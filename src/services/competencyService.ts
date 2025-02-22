import { supabase } from './api';

export interface CompetencySet {
  id: string;
  name: string;
  description: string;
  category: string;
  competencies?: Competency[];
}

export interface Competency {
  id: string;
  set_id: string;
  name: string;
  description: string;
  min_score: number;
  max_score: number;
  current_score?: number;
  target_score?: number;
  last_assessment_date?: string;
  next_assessment_date?: string;
}

export const competencyService = {
  async getUserCompetencies(userId: string): Promise<CompetencySet[]> {
    try {
      // Önce tüm yetkinlik setlerini al
      const { data: sets, error: setsError } = await supabase
        .from('competency_sets')
        .select('*');

      if (setsError) throw setsError;

      // Her set için yetkinlikleri ve kullanıcı puanlarını al
      const competencySets = await Promise.all(
        sets.map(async (set) => {
          const { data: competencies, error: compError } = await supabase
            .from('competencies')
            .select(`
              *,
              user_competencies!inner(
                current_score,
                target_score,
                last_assessment_date,
                next_assessment_date
              )
            `)
            .eq('set_id', set.id)
            .eq('user_competencies.user_id', userId);

          if (compError) throw compError;

          // Yetkinlik verilerini düzenle
          const formattedCompetencies = competencies.map(comp => ({
            id: comp.id,
            set_id: comp.set_id,
            name: comp.name,
            description: comp.description,
            min_score: comp.min_score,
            max_score: comp.max_score,
            current_score: comp.user_competencies[0]?.current_score,
            target_score: comp.user_competencies[0]?.target_score,
            last_assessment_date: comp.user_competencies[0]?.last_assessment_date,
            next_assessment_date: comp.user_competencies[0]?.next_assessment_date
          }));

          return {
            ...set,
            competencies: formattedCompetencies
          };
        })
      );

      return competencySets;
    } catch (error) {
      console.error('Yetkinlik verileri alınırken hata:', error);
      throw error;
    }
  },

  async updateUserCompetency(
    userId: string,
    competencyId: string,
    data: {
      current_score?: number;
      target_score?: number;
      next_assessment_date?: string;
    }
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_competencies')
        .upsert({
          user_id: userId,
          competency_id: competencyId,
          ...data,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Yetkinlik güncellenirken hata:', error);
      throw error;
    }
  }
};
