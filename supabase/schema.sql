-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Kullanıcılar tablosu
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'teacher', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Kurslar tablosu
CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Dersler tablosu
CREATE TABLE lessons (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    order_number INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- İlerleme tablosu
CREATE TABLE progress (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    last_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    PRIMARY KEY (user_id, lesson_id)
);

-- Quiz tablosu
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Sorular tablosu
CREATE TABLE questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT REFERENCES quizzes(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('multiple_choice', 'true_false', 'open_ended')),
    correct_answer TEXT NOT NULL,
    options JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Sohbet oturumları tablosu
CREATE TABLE chat_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    course_id BIGINT REFERENCES courses(id) ON DELETE SET NULL,
    lesson_id BIGINT REFERENCES lessons(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Sohbet mesajları tablosu
CREATE TABLE chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT REFERENCES chat_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    type VARCHAR(10) CHECK (type IN ('user', 'bot')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Yetkinlik setleri tablosu
CREATE TABLE competency_sets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Yetkinlikler tablosu
CREATE TABLE competencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    set_id UUID REFERENCES competency_sets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    min_score INTEGER DEFAULT 1,
    max_score INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı yetkinlik puanları tablosu
CREATE TABLE user_competencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    competency_id UUID REFERENCES competencies(id) ON DELETE CASCADE,
    current_score DECIMAL(3,1) NOT NULL,
    target_score DECIMAL(3,1) NOT NULL,
    last_assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    next_assessment_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, competency_id)
);

-- Kullanıcı profilleri tablosu
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    full_name text,
    title text,
    bio text,
    avatar_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

comment on table public.user_profiles is 'Kullanıcı profil bilgileri';

-- Kullanıcı istatistikleri tablosu
CREATE TABLE IF NOT EXISTS public.user_stats (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    xp integer default 0,
    level integer default 1,
    completed_trainings integer default 0,
    monthly_completions integer default 0,
    streak integer default 0,
    longest_streak integer default 0,
    badges integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id)
);

comment on table public.user_stats is 'Kullanıcı öğrenme istatistikleri';

-- Örnek profil verileri
INSERT INTO public.user_profiles (user_id, full_name, title, bio, avatar_url)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Ahmet Yılmaz', 'Senior Frontend Developer', 'React ve TypeScript uzmanı, 5 yıllık deneyim', 'https://i.pravatar.cc/150?img=12'),
  ('11111111-1111-1111-1111-111111111111', 'Ayşe Demir', 'Backend Developer', 'Node.js ve PostgreSQL ile 3 yıllık deneyim', 'https://i.pravatar.cc/150?img=5');

-- Örnek istatistik verileri
INSERT INTO public.user_stats (user_id, xp, level, completed_trainings, monthly_completions, streak, longest_streak, badges)
VALUES
  ('00000000-0000-0000-0000-000000000000', 3750, 8, 24, 6, 12, 21, 15),
  ('11111111-1111-1111-1111-111111111111', 2800, 6, 18, 4, 8, 15, 11);

-- Örnek yetkinlik seti verileri
INSERT INTO public.competency_sets (id, name, description, category) VALUES
  ('tech-001', 'Frontend Development', 'Modern web geliştirme teknolojileri ve best practices', 'Hard Skills'),
  ('tech-002', 'Backend Development', 'Sunucu tarafı programlama ve veritabanı yönetimi', 'Hard Skills'),
  ('soft-001', 'İletişim Becerileri', 'Etkili iletişim ve sunum yetenekleri', 'Soft Skills'),
  ('lead-001', 'Takım Liderliği', 'Takım yönetimi ve proje koordinasyonu', 'Leadership');

-- Örnek yetkinlik verileri
INSERT INTO public.competencies (id, competency_set_id, name, description, min_score, max_score) VALUES
  ('comp-001', 'tech-001', 'React.js', 'Modern React uygulamaları geliştirme', 0, 100),
  ('comp-002', 'tech-001', 'TypeScript', 'TypeScript ile tip güvenli kod yazımı', 0, 100),
  ('comp-003', 'tech-001', 'CSS/SASS', 'Modern CSS teknikleri ve SASS kullanımı', 0, 100),
  ('comp-004', 'tech-002', 'Node.js', 'Node.js ile backend geliştirme', 0, 100),
  ('comp-005', 'tech-002', 'PostgreSQL', 'Veritabanı tasarımı ve optimizasyon', 0, 100),
  ('comp-006', 'soft-001', 'Sunum Becerileri', 'Etkili sunum hazırlama ve sunma', 0, 100),
  ('comp-007', 'soft-001', 'Takım İletişimi', 'Takım içi etkili iletişim', 0, 100),
  ('comp-008', 'lead-001', 'Proje Yönetimi', 'Agile proje yönetimi metodolojileri', 0, 100);

-- Örnek kullanıcı yetkinlik verileri
INSERT INTO public.user_competencies (user_id, competency_id, current_score, target_score, last_assessment_date) VALUES
  ('00000000-0000-0000-0000-000000000000', 'comp-001', 85, 95, '2025-02-15'),
  ('00000000-0000-0000-0000-000000000000', 'comp-002', 75, 90, '2025-02-10'),
  ('00000000-0000-0000-0000-000000000000', 'comp-003', 90, 95, '2025-02-18'),
  ('00000000-0000-0000-0000-000000000000', 'comp-004', 65, 85, '2025-02-12'),
  ('00000000-0000-0000-0000-000000000000', 'comp-005', 70, 85, '2025-02-14'),
  ('00000000-0000-0000-0000-000000000000', 'comp-006', 80, 90, '2025-02-16'),
  ('00000000-0000-0000-0000-000000000000', 'comp-007', 85, 95, '2025-02-17'),
  ('00000000-0000-0000-0000-000000000000', 'comp-008', 60, 80, '2025-02-13');

-- RLS politikaları
alter table public.user_profiles enable row level security;
alter table public.user_stats enable row level security;

create policy "Kullanıcılar kendi profillerini görebilir"
    on public.user_profiles for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi profillerini güncelleyebilir"
    on public.user_profiles for update
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi istatistiklerini görebilir"
    on public.user_stats for select
    using (auth.uid() = user_id);

create policy "Kullanıcılar kendi istatistiklerini güncelleyebilir"
    on public.user_stats for update
    using (auth.uid() = user_id);

-- Gerçekçi test verileri
-- Öğretmenler
INSERT INTO users (id, name, email, role, created_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Prof. Dr. Ahmet Yılmaz', 'ahmet.yilmaz@example.com', 'teacher', '2024-01-15T08:00:00Z'),
('22222222-2222-2222-2222-222222222222', 'Doç. Dr. Ayşe Kaya', 'ayse.kaya@example.com', 'teacher', '2024-01-16T09:30:00Z');

-- Öğrenciler
INSERT INTO users (id, name, email, role, created_at) VALUES
('33333333-3333-3333-3333-333333333333', 'Mehmet Demir', 'mehmet.demir@example.com', 'student', '2024-01-20T10:15:00Z'),
('44444444-4444-4444-4444-444444444444', 'Zeynep Yıldız', 'zeynep.yildiz@example.com', 'student', '2024-01-21T11:45:00Z'),
('55555555-5555-5555-5555-555555555555', 'Can Özkan', 'can.ozkan@example.com', 'student', '2024-01-22T14:20:00Z');

-- Kurslar
INSERT INTO courses (id, title, description, instructor_id, category, level, created_at) VALUES
(1, 'İleri Python Programlama', 'Python programlama dilinde ileri seviye konuları öğrenin', '11111111-1111-1111-1111-111111111111', 'Programlama', 'advanced', '2024-01-25T09:00:00Z'),
(2, 'Temel Matematik', 'Temel matematik kavramlarını öğrenin', '22222222-2222-2222-2222-222222222222', 'Matematik', 'beginner', '2024-01-26T10:30:00Z'),
(3, 'Web Geliştirme Temelleri', 'HTML, CSS ve JavaScript ile web geliştirmeyi öğrenin', '11111111-1111-1111-1111-111111111111', 'Web Geliştirme', 'intermediate', '2024-01-27T11:15:00Z');

-- Dersler
INSERT INTO lessons (id, course_id, title, content, order_number, duration_minutes, created_at) VALUES
(1, 1, 'Python Decorators', 'Python decoratorların detaylı açıklaması ve örnekler', 1, 45, '2024-01-28T09:15:00Z'),
(2, 1, 'Generator Functions', 'Generator fonksiyonları ve yield keyword kullanımı', 2, 50, '2024-01-28T10:00:00Z'),
(3, 2, 'Temel Cebir', 'Cebirsel ifadeler ve denklemler', 1, 60, '2024-01-29T09:30:00Z'),
(4, 2, 'Fonksiyonlar', 'Matematiksel fonksiyonlar ve grafikleri', 2, 55, '2024-01-29T10:45:00Z'),
(5, 3, 'HTML Temelleri', 'HTML etiketleri ve sayfa yapısı', 1, 40, '2024-01-30T11:00:00Z'),
(6, 3, 'CSS Styling', 'CSS ile sayfa stilendirme', 2, 45, '2024-01-30T12:15:00Z');

-- Quizler
INSERT INTO quizzes (id, lesson_id, title, description, created_at) VALUES
(1, 1, 'Decorator Quiz', 'Python decoratorlar hakkında test', '2024-01-28T15:00:00Z'),
(2, 3, 'Cebir Quiz', 'Temel cebir konuları testi', '2024-01-29T16:30:00Z');

-- Sorular
INSERT INTO questions (quiz_id, content, type, correct_answer, options, created_at) VALUES
(1, 'Decorator fonksiyonlar ne işe yarar?', 'multiple_choice', 'Fonksiyonların davranışını değiştirmek', '["Fonksiyonları silmek", "Fonksiyonların davranışını değiştirmek", "Sadece print yapmak", "Hiçbiri"]', '2024-01-28T15:30:00Z'),
(1, 'Python decoratorlar için @ sembolü kullanılır.', 'true_false', 'true', null, '2024-01-28T15:35:00Z'),
(2, 'x + 5 = 10 denkleminde x kaçtır?', 'multiple_choice', '5', '["3", "5", "7", "10"]', '2024-01-29T17:00:00Z');

-- İlerleme kayıtları
INSERT INTO progress (user_id, lesson_id, completed, last_position_seconds, created_at) VALUES
('33333333-3333-3333-3333-333333333333', 1, true, 2700, '2024-02-01T14:30:00Z'),
('33333333-3333-3333-3333-333333333333', 2, false, 1500, '2024-02-02T15:45:00Z'),
('44444444-4444-4444-4444-444444444444', 3, true, 3600, '2024-02-03T16:20:00Z');

-- Sohbet oturumları
INSERT INTO chat_sessions (id, user_id, title, course_id, lesson_id, created_at, last_message_at) VALUES
(1, '33333333-3333-3333-3333-333333333333', 'Python Decorator Yardım', 1, 1, '2024-02-10T09:00:00Z', '2024-02-10T09:30:00Z'),
(2, '44444444-4444-4444-4444-444444444444', 'Cebir Soruları', 2, 3, '2024-02-11T10:15:00Z', '2024-02-11T10:45:00Z');

-- Sohbet mesajları
INSERT INTO chat_messages (session_id, user_id, content, type, created_at) VALUES
(1, '33333333-3333-3333-3333-333333333333', 'Decorator fonksiyonları tam anlayamadım, yardımcı olabilir misiniz?', 'user', '2024-02-10T09:00:00Z'),
(1, '33333333-3333-3333-3333-333333333333', 'Decorator''lar bir fonksiyonun davranışını değiştirmek için kullanılan özel fonksiyonlardır. Örnek vermemi ister misiniz?', 'bot', '2024-02-10T09:01:00Z'),
(2, '44444444-4444-4444-4444-444444444444', 'x + 3 = 8 denklemini nasıl çözebilirim?', 'user', '2024-02-11T10:15:00Z'),
(2, '44444444-4444-4444-4444-444444444444', 'Bu denklemi çözmek için, 3''ü eşitliğin diğer tarafına geçirmeliyiz. x = 8 - 3 = 5 olacaktır.', 'bot', '2024-02-11T10:16:00Z');

-- Yetkinlik setleri verileri
INSERT INTO competency_sets (id, name, description, category) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'İletişim Yetkinlikleri', 'Etkili iletişim ve işbirliği becerileri', 'Soft Skills'),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Teknik Yetkinlikler', 'Teknik ve mesleki beceriler', 'Hard Skills'),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Liderlik Yetkinlikleri', 'Liderlik ve yönetim becerileri', 'Leadership');

INSERT INTO competencies (set_id, name, description, min_score, max_score) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Ekip İçi İletişim', 'Ekip üyeleriyle etkili iletişim kurabilme', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'Sunum Becerileri', 'Etkili sunum yapabilme ve bilgi aktarımı', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Problem Çözme', 'Analitik düşünme ve problem çözme', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d480', 'Teknik Dokümantasyon', 'Teknik belgeleme ve raporlama', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Stratejik Düşünme', 'Stratejik planlama ve karar verme', 1, 5),
('f47ac10b-58cc-4372-a567-0e02b2c3d481', 'Ekip Yönetimi', 'Ekip koordinasyonu ve motivasyonu', 1, 5);

-- Realtime özelliği için gerekli politikalar
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Kullanıcı bazlı erişim politikaları
CREATE POLICY "Kullanıcılar kendi mesajlarını görebilir"
    ON chat_messages FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi oturumlarını görebilir"
    ON chat_sessions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi ilerlemelerini görebilir"
    ON progress FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Kullanıcılar kendi profillerini görebilir"
    ON users FOR SELECT
    USING (id = auth.uid());

-- Realtime abonelikleri için fonksiyonlar
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_sessions
  SET last_message_at = NEW.created_at
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_message();
