-- Fix analytics function to handle null values and add proper table aliases
CREATE OR REPLACE FUNCTION get_analytics_data(date_range TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  start_date TIMESTAMPTZ;
BEGIN
  -- Calculate start date based on range
  start_date := CASE date_range
    WHEN 'last7Days' THEN NOW() - INTERVAL '7 days'
    WHEN 'last30Days' THEN NOW() - INTERVAL '30 days'
    WHEN 'last12Months' THEN NOW() - INTERVAL '12 months'
    ELSE NOW() - INTERVAL '7 days'
  END;

  SELECT jsonb_build_object(
    'activeUsers', COALESCE((
      SELECT COUNT(DISTINCT up.user_id)
      FROM user_progress up
      WHERE up.last_accessed >= start_date
    ), 0),
    'completedTrainings', COALESCE((
      SELECT COUNT(*)
      FROM user_progress up
      WHERE up.completed = true
      AND up.last_accessed >= start_date
    ), 0),
    'averageProgress', COALESCE((
      SELECT ROUND(AVG(up.progress))
      FROM user_progress up
      WHERE up.last_accessed >= start_date
    ), 0),
    'totalCourses', COALESCE((
      SELECT COUNT(*)
      FROM trainings t
      WHERE t.created_at >= start_date
    ), 0)
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;