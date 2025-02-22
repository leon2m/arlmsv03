/*
  # Add test data

  1. Test Data
    - Sample users and profiles
    - Training courses with content
    - Surveys and responses
    - Certificates
    - User progress records
    - AI insights
    
  2. Notes
    - All UUIDs are in valid format
    - All foreign key relationships are maintained
*/

-- Insert test users into auth.users
-- Note: In production, users would be created through auth signup
INSERT INTO auth.users (id, email)
VALUES 
  ('d7bed21c-5b24-4428-a7a7-26ce3d7af862', 'admin@example.com'),
  ('b5cd4c89-1f1b-4d3c-9d7d-6cfbd5e1af7c', 'instructor@example.com'),
  ('e9d2f7fb-701c-4fc0-a756-e7b2fb465c5f', 'student1@example.com'),
  ('f4b73d87-16a7-4d3c-8f7a-a5b3d7e9f1c2', 'student2@example.com');

-- Insert profiles for test users
INSERT INTO profiles (id, full_name, organization, role, created_at, updated_at)
VALUES
  ('d7bed21c-5b24-4428-a7a7-26ce3d7af862', 'Admin User', 'AR Learning', 'admin', NOW(), NOW()),
  ('b5cd4c89-1f1b-4d3c-9d7d-6cfbd5e1af7c', 'John Instructor', 'Tech Academy', 'instructor', NOW(), NOW()),
  ('e9d2f7fb-701c-4fc0-a756-e7b2fb465c5f', 'Alice Student', 'Student Corp', 'student', NOW(), NOW()),
  ('f4b73d87-16a7-4d3c-8f7a-a5b3d7e9f1c2', 'Bob Student', 'Learning Inc', 'student', NOW(), NOW());

-- Insert sample training courses
INSERT INTO trainings (id, title, description, instructor_id, type, status, start_date, end_date, enrolled_count, rating)
VALUES
  ('c86be4ac-e94c-4d89-8a73-1a3b8d52495a', 'Python Programming Basics', 'Learn the fundamentals of Python programming', 'b5cd4c89-1f1b-4d3c-9d7d-6cfbd5e1af7c', 'online', 'published', NOW(), NOW() + INTERVAL '30 days', 25, 4.5),
  ('d92f4f3a-b91c-4d1a-9c77-b84212b5a994', 'Web Development Fundamentals', 'Introduction to HTML, CSS, and JavaScript', 'b5cd4c89-1f1b-4d3c-9d7d-6cfbd5e1af7c', 'online', 'published', NOW() + INTERVAL '7 days', NOW() + INTERVAL '37 days', 18, 4.2),
  ('e37a8f5c-d8e2-4e83-b5f1-9c3a4b5d6e7f', 'Data Science Essentials', 'Introduction to data analysis and visualization', 'b5cd4c89-1f1b-4d3c-9d7d-6cfbd5e1af7c', 'hybrid', 'published', NOW() + INTERVAL '14 days', NOW() + INTERVAL '44 days', 32, 4.8),
  ('f48b9c6d-e9f3-4a7b-8c2e-0d1a2b3c4d5e', 'Machine Learning Basics', 'Learn fundamental ML concepts and algorithms', 'b5cd4c89-1f1b-4d3c-9d7d-6cfbd5e1af7c', 'classroom', 'published', NOW() + INTERVAL '21 days', NOW() + INTERVAL '51 days', 15, 4.6);

-- Insert training content
INSERT INTO training_contents (training_id, title, type, content_url, duration, order_index)
VALUES
  ('c86be4ac-e94c-4d89-8a73-1a3b8d52495a', 'Introduction to Python', 'video', 'python/intro.mp4', 45, 1),
  ('c86be4ac-e94c-4d89-8a73-1a3b8d52495a', 'Python Basics Guide', 'pdf', 'python/basics.pdf', NULL, 2),
  ('d92f4f3a-b91c-4d1a-9c77-b84212b5a994', 'HTML Fundamentals', 'video', 'web/html.mp4', 60, 1),
  ('e37a8f5c-d8e2-4e83-b5f1-9c3a4b5d6e7f', 'Data Science Overview', 'pptx', 'datascience/overview.pptx', NULL, 1);

-- Insert sample surveys
INSERT INTO surveys (id, title, description, type, is_required, questions)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'Course Feedback Survey', 'Please provide your feedback about the course', 'feedback', false, 
    '[
      {"id": 1, "type": "rating", "text": "How would you rate this course?"},
      {"id": 2, "type": "text", "text": "What did you like most about the course?"},
      {"id": 3, "type": "text", "text": "What could be improved?"}
    ]'::jsonb),
  ('b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e', 'Entry Assessment', 'Initial skill assessment', 'entry', true,
    '[
      {"id": 1, "type": "multiple_choice", "text": "What is your programming experience level?", "options": ["Beginner", "Intermediate", "Advanced"]},
      {"id": 2, "type": "text", "text": "What are your learning goals?"}
    ]'::jsonb);

-- Insert sample survey responses
INSERT INTO survey_responses (survey_id, user_id, responses)
VALUES
  ('a1b2c3d4-e5f6-4a5b-8c7d-9e8f7a6b5c4d', 'e9d2f7fb-701c-4fc0-a756-e7b2fb465c5f',
    '{"1": 5, "2": "The practical exercises were very helpful", "3": "More real-world examples would be great"}'::jsonb),
  ('b2c3d4e5-f6a7-5b6c-9d8e-0f1a2b3c4d5e', 'f4b73d87-16a7-4d3c-8f7a-a5b3d7e9f1c2',
    '{"1": "Beginner", "2": "Learn programming fundamentals and build web applications"}'::jsonb);

-- Insert sample certificates
INSERT INTO certificates (user_id, training_id, certificate_number, issue_date, status)
VALUES
  ('e9d2f7fb-701c-4fc0-a756-e7b2fb465c5f', 'c86be4ac-e94c-4d89-8a73-1a3b8d52495a', 'CERT-20250209-0001', NOW(), 'active'),
  ('f4b73d87-16a7-4d3c-8f7a-a5b3d7e9f1c2', 'd92f4f3a-b91c-4d1a-9c77-b84212b5a994', 'CERT-20250209-0002', NOW(), 'active');

-- Insert user progress records
INSERT INTO user_progress (user_id, training_id, content_id, progress, completed, last_accessed)
VALUES
  ('e9d2f7fb-701c-4fc0-a756-e7b2fb465c5f', 'c86be4ac-e94c-4d89-8a73-1a3b8d52495a', (SELECT id FROM training_contents WHERE training_id = 'c86be4ac-e94c-4d89-8a73-1a3b8d52495a' LIMIT 1), 100, true, NOW()),
  ('f4b73d87-16a7-4d3c-8f7a-a5b3d7e9f1c2', 'd92f4f3a-b91c-4d1a-9c77-b84212b5a994', (SELECT id FROM training_contents WHERE training_id = 'd92f4f3a-b91c-4d1a-9c77-b84212b5a994' LIMIT 1), 75, false, NOW());

-- Insert AI insights
INSERT INTO ai_insights (user_id, type, data)
VALUES
  ('e9d2f7fb-701c-4fc0-a756-e7b2fb465c5f', 'learning_path',
    '{
      "currentLevel": "intermediate",
      "recommendedCourses": ["Web Development Advanced", "JavaScript Frameworks"],
      "nextSteps": ["Complete React Course", "Start Backend Development"]
    }'::jsonb),
  ('f4b73d87-16a7-4d3c-8f7a-a5b3d7e9f1c2', 'performance',
    '{
      "averageProgress": 85,
      "completionRate": 92,
      "strengths": ["Quick Learning", "Consistent Practice"],
      "areasForImprovement": ["Project Work", "Peer Collaboration"]
    }'::jsonb);