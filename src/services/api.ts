import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase bağlantı bilgileri eksik! Lütfen .env dosyasını kontrol edin.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Örnek kullanıcı yetkinlikleri verilerini ekle
export const initializeUserCompetencies = async (userId: string) => {
  try {
    // Önce yetkinlik setlerini kontrol et
    const { data: existingSets } = await supabase
      .from('competency_sets')
      .select('id');

    if (!existingSets?.length) {
      // Yetkinlik setlerini ekle
      const { data: sets } = await supabase
        .from('competency_sets')
        .insert([
          {
            name: 'İletişim Yetkinlikleri',
            description: 'Etkili iletişim ve işbirliği becerileri',
            category: 'Soft Skills'
          },
          {
            name: 'Teknik Yetkinlikler',
            description: 'Teknik ve mesleki beceriler',
            category: 'Hard Skills'
          },
          {
            name: 'Liderlik Yetkinlikleri',
            description: 'Liderlik ve yönetim becerileri',
            category: 'Leadership'
          }
        ])
        .select();

      if (sets) {
        // Yetkinlikleri ekle
        for (const set of sets) {
          await supabase.from('competencies').insert([
            {
              set_id: set.id,
              name: 'Ekip İçi İletişim',
              description: 'Ekip üyeleriyle etkili iletişim kurabilme',
              min_score: 1,
              max_score: 5
            },
            {
              set_id: set.id,
              name: 'Problem Çözme',
              description: 'Analitik düşünme ve problem çözme',
              min_score: 1,
              max_score: 5
            }
          ]);
        }
      }
    }

    // Kullanıcı yetkinliklerini ekle
    const { data: competencies } = await supabase
      .from('competencies')
      .select('id');

    if (competencies) {
      for (const comp of competencies) {
        await supabase.from('user_competencies').upsert({
          user_id: userId,
          competency_id: comp.id,
          current_score: 3.6,
          target_score: 5.0,
          last_assessment_date: new Date().toISOString(),
          next_assessment_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 gün sonra
        });
      }
    }
  } catch (error) {
    console.error('Yetkinlik verileri eklenirken hata:', error);
    throw error;
  }
};
