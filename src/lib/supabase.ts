import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Veri tipleri
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  avatar_url?: string;
  created_at: string;
}

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

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  content: string;
  order_number: number;
  duration_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  user_id: string;
  lesson_id: number;
  completed: boolean;
  last_position_seconds: number;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: number;
  lesson_id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface Question {
  id: number;
  quiz_id: number;
  content: string;
  type: 'multiple_choice' | 'true_false' | 'open_ended';
  correct_answer: string;
  options?: string[];
  created_at: string;
}

export interface ChatMessage {
  id: number;
  user_id: string;
  session_id: number;
  content: string;
  type: 'user' | 'bot';
  created_at: string;
}

export interface ChatSession {
  id: number;
  user_id: string;
  title: string;
  course_id?: number;
  lesson_id?: number;
  created_at: string;
  last_message_at: string;
}

// Veritabanı işlemleri
export const db = {
  // Kullanıcı işlemleri
  users: {
    async getById(id: string): Promise<User | null> {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async getByEmail(email: string): Promise<User | null> {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Kurs işlemleri
  courses: {
    async getAll(): Promise<Course[]> {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },

    async getById(id: number): Promise<Course | null> {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },

    async getByInstructor(instructorId: string): Promise<Course[]> {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('instructor_id', instructorId);
      
      if (error) throw error;
      return data || [];
    }
  },

  // Ders işlemleri
  lessons: {
    async getByCourse(courseId: number): Promise<Lesson[]> {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('order_number', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  },

  // İlerleme işlemleri
  progress: {
    async getByUser(userId: string): Promise<Progress[]> {
      const { data, error } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data || [];
    },

    async updateProgress(userId: string, lessonId: number, progress: Partial<Progress>): Promise<void> {
      const { error } = await supabase
        .from('progress')
        .upsert([
          {
            user_id: userId,
            lesson_id: lessonId,
            ...progress,
            updated_at: new Date().toISOString()
          }
        ]);
      
      if (error) throw error;
    }
  },

  // Quiz işlemleri
  quizzes: {
    async getByLesson(lessonId: number): Promise<Quiz[]> {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*, questions(*)')
        .eq('lesson_id', lessonId);
      
      if (error) throw error;
      return data || [];
    }
  },

  // Sohbet işlemleri
  chat: {
    async getMessages(sessionId: number): Promise<ChatMessage[]> {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },

    async addMessage(sessionId: number, content: string, type: 'user' | 'bot', userId: string): Promise<ChatMessage> {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert([
          {
            session_id: sessionId,
            user_id: userId,
            content,
            type,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },

    async getSessions(userId: string): Promise<ChatSession[]> {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },

    async createSession(userId: string, title: string, courseId?: number, lessonId?: number): Promise<ChatSession> {
      const { data, error } = await supabase
        .from('chat_sessions')
        .insert([
          {
            user_id: userId,
            title,
            course_id: courseId,
            lesson_id: lessonId,
            created_at: new Date().toISOString(),
            last_message_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};
