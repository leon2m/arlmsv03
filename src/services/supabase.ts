import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase bağlantı bilgileri eksik! Lütfen .env dosyanızı kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Kullanıcı işlemleri
export const userService = {
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Profil yüklenirken hata:', error);
        // Varsayılan profil verisi
        return {
          data: {
            id: userId,
            full_name: 'Ahmet Yılmaz',
            title: 'Senior Frontend Developer',
            bio: 'React ve TypeScript uzmanı, 5 yıllık deneyim',
            avatar_url: 'https://i.pravatar.cc/150?img=12',
            email: 'ahmet.yilmaz@example.com',
            department: 'Yazılım Geliştirme',
            role: 'Kıdemli Geliştirici',
            joined_date: '2023-01-15',
            skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'AWS'],
            certifications: [
              { name: 'AWS Certified Developer', date: '2024-01-20', score: 95 },
              { name: 'React Advanced Patterns', date: '2024-03-15', score: 98 },
              { name: 'TypeScript Master', date: '2023-11-10', score: 92 }
            ]
          }
        };
      }

      return { data };
    } catch (error) {
      console.error('Profil yüklenirken hata:', error);
      return { data: null, error };
    }
  },

  async updateUserProfile(userId: string, data: any) {
    return await supabase
      .from('user_profiles')
      .update(data)
      .eq('user_id', userId);
  }
};

// Öğrenme analitikleri
export const analyticsService = {
  async getUserStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('İstatistikler yüklenirken hata:', error);
        // Varsayılan istatistik verisi
        return {
          data: {
            xp: 3750,
            level: 8,
            completedTrainings: 24,
            monthlyCompletions: 6,
            streak: 12,
            longestStreak: 21,
            badges: 15,
            totalHours: 156,
            coursesInProgress: 3,
            certificatesEarned: 8,
            contributions: 45,
            mentoring: {
              sessions: 12,
              rating: 4.8,
              students: 8
            },
            weeklyProgress: {
              target: 10,
              completed: 8,
              efficiency: 85
            },
            skillLevels: {
              frontend: 85,
              backend: 70,
              devops: 65,
              database: 75,
              testing: 80
            }
          }
        };
      }

      return { data };
    } catch (error) {
      console.error('İstatistikler yüklenirken hata:', error);
      return { data: null, error };
    }
  },

  async updateUserStats(userId: string, stats: any) {
    return await supabase
      .from('user_stats')
      .upsert({ user_id: userId, ...stats });
  }
};

// Yetkinlik analitikleri
export const competencyService = {
  async getUserCompetencies(userId: string) {
    try {
      const { data, error } = await supabase
        .from('competency_sets')
        .select(`
          *,
          competencies (
            *,
            user_competencies (*)
          )
        `)
        .order('name');

      if (error) {
        console.error('Yetkinlikler yüklenirken hata:', error);
        // Varsayılan yetkinlik verisi
        return [
          {
            id: 'tech-001',
            name: 'Frontend Development',
            description: 'Modern web geliştirme teknolojileri',
            category: 'Hard Skills',
            competencies: [
              {
                id: 'comp-001',
                name: 'React.js',
                description: 'Modern React uygulamaları',
                current_score: 85,
                target_score: 95,
                min_score: 0,
                max_score: 100,
                last_assessment_date: '2025-02-15'
              },
              {
                id: 'comp-002',
                name: 'TypeScript',
                description: 'Tip güvenli geliştirme',
                current_score: 75,
                target_score: 90,
                min_score: 0,
                max_score: 100,
                last_assessment_date: '2025-02-10'
              }
            ]
          },
          {
            id: 'tech-002',
            name: 'Backend Development',
            description: 'Sunucu tarafı programlama',
            category: 'Hard Skills',
            competencies: [
              {
                id: 'comp-003',
                name: 'Node.js',
                description: 'Server-side JavaScript',
                current_score: 65,
                target_score: 85,
                min_score: 0,
                max_score: 100,
                last_assessment_date: '2025-02-12'
              }
            ]
          }
        ];
      }

      // Veriyi işle ve kullanıcıya özel hale getir
      const processedData = data.map((set: any) => ({
        ...set,
        competencies: set.competencies.map((comp: any) => ({
          ...comp,
          current_score: comp.user_competencies[0]?.current_score || 0,
          target_score: comp.user_competencies[0]?.target_score || comp.max_score,
          last_assessment_date: comp.user_competencies[0]?.last_assessment_date
        }))
      }));

      return processedData;
    } catch (error) {
      console.error('Yetkinlikler yüklenirken hata:', error);
      return [];
    }
  }
};

async function updateUserName(oldName: string, newName: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ full_name: newName })
    .eq('full_name', oldName);

  if (error) {
    console.error('Error updating user name:', error);
    return null;
  }
  return data;
}

export { updateUserName };
