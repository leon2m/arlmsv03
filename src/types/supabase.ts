export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          organization: string | null
          role: 'admin' | 'instructor' | 'student'
          created_at: string
          updated_at: string
          last_login: string | null
          preferences: Json | null
        }
        Insert: {
          id: string
          full_name?: string | null
          organization?: string | null
          role: 'admin' | 'instructor' | 'student'
          created_at?: string
          updated_at?: string
          last_login?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          full_name?: string | null
          organization?: string | null
          role?: 'admin' | 'instructor' | 'student'
          created_at?: string
          updated_at?: string
          last_login?: string | null
          preferences?: Json | null
        }
      }
      trainings: {
        Row: {
          id: string
          title: string
          description: string | null
          instructor_id: string
          type: 'online' | 'classroom' | 'hybrid'
          status: 'draft' | 'published' | 'archived'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          instructor_id: string
          type: 'online' | 'classroom' | 'hybrid'
          status?: 'draft' | 'published' | 'archived'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          instructor_id?: string
          type?: 'online' | 'classroom' | 'hybrid'
          status?: 'draft' | 'published' | 'archived'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      training_contents: {
        Row: {
          id: string
          training_id: string
          title: string
          type: 'pptx' | 'pdf' | 'video' | 'scorm'
          content_url: string
          duration: number | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          training_id: string
          title: string
          type: 'pptx' | 'pdf' | 'video' | 'scorm'
          content_url: string
          duration?: number | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          training_id?: string
          title?: string
          type?: 'pptx' | 'pdf' | 'video' | 'scorm'
          content_url?: string
          duration?: number | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      surveys: {
        Row: {
          id: string
          title: string
          description: string | null
          type: 'entry' | 'feedback'
          is_required: boolean
          questions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          type: 'entry' | 'feedback'
          is_required?: boolean
          questions: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          type?: 'entry' | 'feedback'
          is_required?: boolean
          questions?: Json
          created_at?: string
          updated_at?: string
        }
      }
      survey_responses: {
        Row: {
          id: string
          survey_id: string
          user_id: string
          responses: Json
          completed_at: string
        }
        Insert: {
          id?: string
          survey_id: string
          user_id: string
          responses: Json
          completed_at?: string
        }
        Update: {
          id?: string
          survey_id?: string
          user_id?: string
          responses?: Json
          completed_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          training_id: string
          certificate_number: string
          issue_date: string
          expiry_date: string | null
          status: 'active' | 'expired' | 'revoked'
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          training_id: string
          certificate_number: string
          issue_date?: string
          expiry_date?: string | null
          status?: 'active' | 'expired' | 'revoked'
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          training_id?: string
          certificate_number?: string
          issue_date?: string
          expiry_date?: string | null
          status?: 'active' | 'expired' | 'revoked'
          metadata?: Json | null
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          training_id: string
          content_id: string
          progress: number
          completed: boolean
          last_accessed: string
        }
        Insert: {
          id?: string
          user_id: string
          training_id: string
          content_id: string
          progress?: number
          completed?: boolean
          last_accessed?: string
        }
        Update: {
          id?: string
          user_id?: string
          training_id?: string
          content_id?: string
          progress?: number
          completed?: boolean
          last_accessed?: string
        }
      }
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json
          category: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          category: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          category?: string
          created_at?: string
          updated_at?: string
        }
      }
      theme_settings: {
        Row: {
          id: string
          name: string
          settings: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          settings: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          settings?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          type: 'learning_path' | 'performance' | 'recommendation'
          data: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'learning_path' | 'performance' | 'recommendation'
          data: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'learning_path' | 'performance' | 'recommendation'
          data?: Json
          created_at?: string
        }
      }
    }
    Functions: {
      generate_certificate_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_analytics_data: {
        Args: {
          date_range: string
        }
        Returns: Json
      }
      get_user_recommendations: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      generate_learning_path: {
        Args: {
          user_id: string
          target_skills: string[]
        }
        Returns: Json
      }
      predict_user_performance: {
        Args: {
          user_id: string
          training_id: string
        }
        Returns: Json
      }
    }
  }
}