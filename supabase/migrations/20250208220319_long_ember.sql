/*
  # Add Exam Management Tables

  1. New Tables
    - `exams` table for exam management
    - `exam_questions` table for exam questions
    - `exam_responses` table for user responses
    - `exam_results` table for exam results

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users
*/

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('quiz', 'final', 'certification')),
  duration INTEGER NOT NULL, -- in minutes
  total_questions INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'upcoming', 'completed')),
  course_id UUID REFERENCES trainings(id),
  max_attempts INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam questions table
CREATE TABLE IF NOT EXISTS exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')),
  options JSONB,
  correct_answer TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam responses table
CREATE TABLE IF NOT EXISTS exam_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  user_id UUID REFERENCES auth.users(id),
  question_id UUID REFERENCES exam_questions(id),
  answer TEXT NOT NULL,
  is_correct BOOLEAN,
  points_earned INTEGER,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exam results table
CREATE TABLE IF NOT EXISTS exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID REFERENCES exams(id),
  user_id UUID REFERENCES auth.users(id),
  total_score INTEGER NOT NULL,
  passing_score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  attempt_number INTEGER NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL,
  UNIQUE(exam_id, user_id, attempt_number)
);

-- Enable Row Level Security
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view published exams"
  ON exams FOR SELECT
  TO authenticated
  USING (status IN ('active', 'upcoming'));

CREATE POLICY "Instructors can manage exams"
  ON exams FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'instructor')
    )
  );

CREATE POLICY "Users can view exam questions during exam"
  ON exam_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM exams
      WHERE exams.id = exam_questions.exam_id
      AND exams.status = 'active'
    )
  );

CREATE POLICY "Users can submit exam responses"
  ON exam_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their exam results"
  ON exam_results FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Insert sample exam data
INSERT INTO exams (
  title,
  description,
  type,
  duration,
  total_questions,
  passing_score,
  start_date,
  status,
  max_attempts
) VALUES
(
  'Python Programming Final',
  'Final exam for Python Programming course',
  'final',
  120,
  50,
  70,
  NOW() + INTERVAL '7 days',
  'upcoming',
  1
),
(
  'Web Development Quiz',
  'Quick assessment of web development fundamentals',
  'quiz',
  30,
  20,
  60,
  NOW(),
  'active',
  3
),
(
  'Data Science Certification',
  'Professional certification exam for Data Science',
  'certification',
  180,
  75,
  80,
  NOW() + INTERVAL '14 days',
  'upcoming',
  2
);