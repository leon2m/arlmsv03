import { supabase } from './api';

export interface Assignment {
  id: number;
  title: string;
  description: string;
  course_id: number;
  due_date: string;
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

export const assignmentService = {
  async getUserAssignments(userId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        courses (
          title,
          instructor_id
        )
      `)
      .eq('student_id', userId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getAssignmentDetails(assignmentId: number): Promise<Assignment> {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        courses (
          title,
          instructor_id
        ),
        submissions (*)
      `)
      .eq('id', assignmentId)
      .single();

    if (error) throw error;
    return data;
  },

  async submitAssignment(assignmentId: number, submission: { content: string, files?: string[] }): Promise<void> {
    const { error } = await supabase
      .from('submissions')
      .insert([
        {
          assignment_id: assignmentId,
          content: submission.content,
          files: submission.files,
          submitted_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
  }
};
