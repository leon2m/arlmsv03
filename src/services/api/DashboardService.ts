import { supabase } from './index';

export class DashboardService {
  async getMetrics() {
    try {
      const { data: activeStudents, error: activeStudentsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .eq('role', 'student')
        .gte('last_login', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      if (activeStudentsError) {
        throw new Error(`Active students error: ${activeStudentsError.message}`);
      }

      const { data: completedCourses, error: completedCoursesError } = await supabase
        .from('user_progress')
        .select('id', { count: 'exact' })
        .eq('completed', true);

      if (completedCoursesError) {
        throw new Error(`Completed courses error: ${completedCoursesError.message}`);
      }

      const { data: averageProgress, error: averageProgressError } = await supabase
        .from('user_progress')
        .select('progress');

      if (averageProgressError) {
        throw new Error(`Average progress error: ${averageProgressError.message}`);
      }

      const { data: activeCourses, error: activeCoursesError } = await supabase
        .from('trainings')
        .select('id', { count: 'exact' })
        .eq('status', 'published');

      if (activeCoursesError) {
        throw new Error(`Active courses error: ${activeCoursesError.message}`);
      }

      return {
        activeStudents: activeStudents?.count || 0,
        completedCourses: completedCourses?.count || 0,
        averageProgress: averageProgress 
          ? Math.round(averageProgress.reduce((acc, curr) => acc + curr.progress, 0) / averageProgress.length) 
          : 0,
        activeCourses: activeCourses?.count || 0
      };
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting metrics:', error.message);
      } else {
        console.error('Error getting metrics:', error);
      }
      throw error;
    }
  }

  async getUpcomingEvents() {
    try {
      const { data: events, error } = await supabase
        .from('trainings')
        .select(`
          id,
          title,
          type,
          start_date,
          instructor:instructor_id(full_name),
          enrolled:user_enrollments(count)
        `)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true })
        .limit(5);

      if (error) {
        throw new Error(`Upcoming events error: ${error.message}`);
      }

      return events || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting upcoming events:', error.message);
      } else {
        console.error('Error getting upcoming events:', error);
      }
      throw error;
    }
  }

  async getPopularCourses() {
    try {
      const { data: courses, error } = await supabase
        .from('trainings')
        .select(`
          id,
          title,
          enrolled:user_enrollments(count),
          rating:course_ratings(rating),
          progress:user_progress(progress)
        `)
        .eq('status', 'published')
        .order('enrolled', { ascending: false })
        .limit(3);

      if (error) {
        throw new Error(`Popular courses error: ${error.message}`);
      }

      return courses || [];
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error getting popular courses:', error.message);
      } else {
        console.error('Error getting popular courses:', error);
      }
      throw error;
    }
  }
}