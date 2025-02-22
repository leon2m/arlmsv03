import { supabase } from './api';

export interface Quiz {
  id: number;
  title: string;
  description: string;
  course_id: number;
  time_limit_minutes: number;
  passing_score: number;
  available_from: string;
  available_until: string;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: number;
  quiz_id: number;
  user_id: string;
  score: number;
  started_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed';
}

export const examService = {
  async getUserQuizzes(userId: string): Promise<Quiz[]> {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        courses (
          title
        ),
        quiz_attempts (
          score,
          status
        )
      `)
      .eq('quiz_attempts.user_id', userId)
      .order('available_from', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getQuizDetails(quizId: number): Promise<Quiz> {
    const { data, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions (
          id,
          question_text,
          options
        )
      `)
      .eq('id', quizId)
      .single();

    if (error) throw error;
    return data;
  },

  async startQuizAttempt(quizId: number, userId: string): Promise<QuizAttempt> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([
        {
          quiz_id: quizId,
          user_id: userId,
          started_at: new Date().toISOString(),
          status: 'in_progress'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async submitQuizAttempt(attemptId: number, answers: Record<string, string>): Promise<void> {
    const { error } = await supabase
      .from('quiz_attempts')
      .update({
        answers,
        completed_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', attemptId);

    if (error) throw error;
  }
};
