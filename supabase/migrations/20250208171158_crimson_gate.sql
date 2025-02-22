-- Add enrolled_count and rating columns to trainings table
ALTER TABLE trainings 
ADD COLUMN enrolled_count INTEGER DEFAULT 0,
ADD COLUMN rating NUMERIC(3,2) DEFAULT 0.0;

-- Create a function to update enrolled_count
CREATE OR REPLACE FUNCTION update_training_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE trainings
  SET enrolled_count = (
    SELECT COUNT(DISTINCT user_id)
    FROM user_progress
    WHERE training_id = NEW.training_id
  )
  WHERE id = NEW.training_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update enrolled_count
CREATE TRIGGER update_training_stats
AFTER INSERT OR UPDATE OR DELETE ON user_progress
FOR EACH ROW
EXECUTE FUNCTION update_training_enrolled_count();