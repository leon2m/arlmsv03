/*
  # AR LMS v0.2 Database Schema

  1. Core Tables
    - profiles: Extended user profile information
    - trainings: Training catalog and management
    - training_contents: Content storage and tracking
    - surveys: Survey management system
    - survey_responses: User survey responses
    - certificates: Certificate management
    - user_progress: Training progress tracking

  2. Security
    - RLS policies for data access control
    - Role-based permissions
*/

-- Profiles for extended user information
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  organization TEXT,
  role TEXT CHECK (role IN ('admin', 'instructor', 'student')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training catalog
CREATE TABLE trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  instructor_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('online', 'classroom', 'hybrid')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Training content management
CREATE TABLE training_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_id UUID REFERENCES trainings(id),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pptx', 'pdf', 'video', 'scorm')),
  content_url TEXT NOT NULL,
  duration INTEGER, -- in minutes
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey system
CREATE TABLE surveys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('entry', 'feedback')),
  is_required BOOLEAN DEFAULT false,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Survey responses
CREATE TABLE survey_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id UUID REFERENCES surveys(id),
  user_id UUID REFERENCES auth.users(id),
  responses JSONB NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certificate management
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  training_id UUID REFERENCES trainings(id),
  certificate_number TEXT UNIQUE NOT NULL,
  issue_date TIMESTAMPTZ DEFAULT NOW(),
  expiry_date TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  metadata JSONB
);

-- User progress tracking
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  training_id UUID REFERENCES trainings(id),
  content_id UUID REFERENCES training_contents(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  last_accessed TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view published trainings"
  ON trainings FOR SELECT
  TO authenticated
  USING (status = 'published');

CREATE POLICY "Instructors can manage their trainings"
  ON trainings FOR ALL
  TO authenticated
  USING (instructor_id = auth.uid());

CREATE POLICY "Users can view training content"
  ON training_contents FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trainings 
    WHERE trainings.id = training_contents.training_id 
    AND status = 'published'
  ));

CREATE POLICY "Users can view and respond to surveys"
  ON surveys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can submit survey responses"
  ON survey_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view their certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can track their progress"
  ON user_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  certificate_num TEXT;
BEGIN
  certificate_num := 'CERT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                    LPAD(CAST(floor(random() * 10000) AS TEXT), 4, '0');
  RETURN certificate_num;
END;
$$ LANGUAGE plpgsql;