import { supabase } from './index';

export class ThemeService {
  async getActiveTheme() {
    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('is_active', true)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateTheme(themeId: string, settings: any) {
    const { error } = await supabase
      .from('theme_settings')
      .update({ settings })
      .eq('id', themeId);
    
    if (error) throw error;
  }

  async createTheme(name: string, settings: any) {
    const { data, error } = await supabase
      .from('theme_settings')
      .insert({
        name,
        settings,
        is_active: false
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async setActiveTheme(themeId: string) {
    // Start a transaction to ensure only one active theme
    const { error: updateError } = await supabase
      .from('theme_settings')
      .update({ is_active: false })
      .neq('id', themeId);
    
    if (updateError) throw updateError;

    const { error } = await supabase
      .from('theme_settings')
      .update({ is_active: true })
      .eq('id', themeId);
    
    if (error) throw error;
  }
}