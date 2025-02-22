import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import type { User } from '../../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export class AuthService {
  async login(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }

  async register(email: string, password: string, userData: Partial<User>) {
    try {
      // Create auth user
      const { data: auth, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            organization: userData.organization,
            role: userData.role
          }
        }
      });

      if (signUpError) throw signUpError;

      // Create profile after successful registration
      if (auth.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: auth.user.id,
            full_name: userData.full_name,
            organization: userData.organization,
            role: userData.role
          }]);

        if (profileError) throw profileError;
      }

      return auth;
    } catch (error: any) {
      // Add more specific error handling
      if (error.message.includes('Password should be at least 6 characters')) {
        throw new Error('Şifre en az 6 karakter olmalıdır');
      }
      if (error.message.includes('User already registered')) {
        throw new Error('Bu e-posta adresi zaten kayıtlı');
      }
      throw error;
    }
  }

  async importUsers(users: Partial<User>[]) {
    // Batch process user imports
    const results = await Promise.allSettled(
      users.map(async (user) => {
        if (!user.email) throw new Error('E-posta adresi gerekli');
        
        const { data, error } = await this.register(
          user.email,
          'TemporaryPass123!', // Will be changed on first login
          {
            full_name: user.full_name,
            organization: user.organization,
            role: user.role || 'student'
          }
        );
        return { data, error };
      })
    );

    return results;
  }
}

export class TrainingService {
  async createTraining(data: any) {
    return await supabase
      .from('trainings')
      .insert(data)
      .select()
      .single();
  }

  async uploadContent(file: File, trainingId: string) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${trainingId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('training-content')
      .upload(fileName, file);

    if (error) throw error;

    const { data: contentData } = await supabase
      .from('training_contents')
      .insert({
        training_id: trainingId,
        title: file.name,
        type: fileExt as 'pptx' | 'pdf',
        content_url: data.path,
        order_index: 0
      })
      .select()
      .single();

    return contentData;
  }
}

export class SurveyService {
  async createSurvey(data: any) {
    return await supabase
      .from('surveys')
      .insert(data)
      .select()
      .single();
  }

  async submitResponse(surveyId: string, responses: any) {
    const { data: existingResponse } = await supabase
      .from('survey_responses')
      .select()
      .match({ survey_id: surveyId, user_id: supabase.auth.user()?.id })
      .single();

    if (existingResponse) {
      throw new Error('Survey already completed');
    }

    return await supabase
      .from('survey_responses')
      .insert({
        survey_id: surveyId,
        user_id: supabase.auth.user()?.id,
        responses
      })
      .select()
      .single();
  }
}

export class CertificateService {
  async generateCertificate(userId: string, trainingId: string) {
    // Check if user completed the training
    const { data: progress } = await supabase
      .from('user_progress')
      .select()
      .match({ user_id: userId, training_id: trainingId })
      .select();

    const allCompleted = progress?.every(p => p.completed);
    if (!allCompleted) {
      throw new Error('Training not completed');
    }

    // Generate certificate
    return await supabase
      .from('certificates')
      .insert({
        user_id: userId,
        training_id: trainingId,
        certificate_number: await this.generateCertificateNumber(),
        status: 'active'
      })
      .select()
      .single();
  }

  private async generateCertificateNumber() {
    const { data } = await supabase
      .rpc('generate_certificate_number');
    return data;
  }
}

export class AnalyticsService {
  async getDashboardStats() {
    const { data: totalTrainings } = await supabase
      .from('trainings')
      .select('id', { count: 'exact' });

    const { data: activeUsers } = await supabase
      .from('user_progress')
      .select('user_id', { count: 'exact' })
      .gte('last_accessed', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const { data: averageProgress } = await supabase
      .from('user_progress')
      .select('progress');

    return {
      totalTrainings,
      activeUsers,
      averageProgress: averageProgress ? 
        averageProgress.reduce((acc, curr) => acc + curr.progress, 0) / averageProgress.length : 
        0
    };
  }
}