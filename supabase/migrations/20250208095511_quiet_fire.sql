-- Analytics functions
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
    'activeUsers', (
      SELECT COUNT(DISTINCT user_id)
      FROM user_progress
      WHERE last_accessed >= start_date
    ),
    'completedTrainings', (
      SELECT COUNT(*)
      FROM user_progress
      WHERE completed = true
      AND last_accessed >= start_date
    ),
    'averageProgress', (
      SELECT COALESCE(AVG(progress), 0)
      FROM user_progress
      WHERE last_accessed >= start_date
    ),
    'totalCourses', (
      SELECT COUNT(*)
      FROM trainings
      WHERE created_at >= start_date
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- AI Recommendation functions
CREATE OR REPLACE FUNCTION get_user_recommendations(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- This is a simplified recommendation algorithm
  -- In production, you would implement more sophisticated logic
  SELECT jsonb_build_object(
    'recommendedCourses', (
      SELECT jsonb_agg(t.*)
      FROM trainings t
      WHERE t.status = 'published'
      AND NOT EXISTS (
        SELECT 1 FROM user_progress up
        WHERE up.training_id = t.id
        AND up.user_id = get_user_recommendations.user_id
      )
      LIMIT 5
    ),
    'learningPath', (
      SELECT jsonb_build_object(
        'currentLevel', 'intermediate',
        'nextSteps', jsonb_build_array(
          'Complete Advanced AI Course',
          'Take Python Certification',
          'Join Machine Learning Workshop'
        )
      )
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Performance Prediction function
CREATE OR REPLACE FUNCTION predict_user_performance(user_id UUID, training_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  user_avg_progress FLOAT;
  course_difficulty FLOAT;
  predicted_score FLOAT;
BEGIN
  -- Get user's average progress
  SELECT AVG(progress)
  INTO user_avg_progress
  FROM user_progress
  WHERE user_id = predict_user_performance.user_id;

  -- Simulate course difficulty (would be based on real data in production)
  course_difficulty := 0.7;

  -- Simple prediction algorithm
  predicted_score := LEAST(100, user_avg_progress * (1 - course_difficulty));

  SELECT jsonb_build_object(
    'predictedScore', predicted_score,
    'confidence', 0.85,
    'factors', jsonb_build_object(
      'pastPerformance', user_avg_progress,
      'courseDifficulty', course_difficulty,
      'studyTime', 'Medium'
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;