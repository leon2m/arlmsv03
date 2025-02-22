import { supabase } from './api';

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor_id: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export const courseService = {
  async getUserCourses(userId: string): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (
          id,
          title,
          duration_minutes
        ),
        progress (
          completed,
          last_position_seconds
        )
      `)
      .eq('instructor_id', userId);

    if (error) throw error;
    return data || [];
  },

  async getCourseDetails(courseId: number): Promise<Course> {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        lessons (
          *,
          progress (*)
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) throw error;
    return data;
  }
};
