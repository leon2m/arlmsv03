-- Kurslar tablosu
create table courses (
  id bigint primary key generated always as identity,
  title text not null,
  description text,
  duration text not null,
  image_url text not null,
  type text not null,
  status text not null default 'not_started',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Kurs ilerleme tablosu
create table course_progress (
  id bigint primary key generated always as identity,
  course_id bigint references courses(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  progress integer not null default 0,
  status text not null default 'not_started',
  last_accessed timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(course_id, user_id)
);

-- Örnek kurs verileri
insert into courses (title, description, duration, image_url, type) values
(
  'Değişimin Parçası Olmak',
  'Esnek ve adaptif düşünme becerilerini geliştirerek değişime ayak uydurmayı öğrenin.',
  '1 St 5 dk',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
  'Video Serisi'
),
(
  'Hedefleri Belirleyerek Başarıya Ulaşmak',
  'SMART hedefler belirleme ve başarıya giden yolu planlama.',
  '31 dk',
  'https://images.unsplash.com/photo-1553034545-32d4cd2168f1?w=800&q=80',
  'Video Serisi'
),
(
  'Problem Çözme ve Karar Verme',
  'Sistematik problem çözme ve etkili karar verme teknikleri.',
  '2 St',
  'https://images.unsplash.com/photo-1590402494682-cd3fb53b1f70?w=800&q=80',
  'Video Serisi'
),
(
  'Yaratıcı Düşünme ve İnovasyon',
  'İnovatif fikirler üretme ve yaratıcı düşünme becerilerini geliştirme.',
  '1 St 45 dk',
  'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=800&q=80',
  'Video Serisi'
),
(
  'Etkili İletişim Teknikleri',
  'İş ve özel hayatta etkili iletişim kurma becerileri.',
  '2 St 15 dk',
  'https://images.unsplash.com/photo-1557425955-df376b5903c8?w=800&q=80',
  'Video Serisi'
),
(
  'Zaman Yönetimi',
  'Verimli zaman yönetimi ve önceliklendirme stratejileri.',
  '1 St 30 dk',
  'https://images.unsplash.com/photo-1506784365847-bbad939e9335?w=800&q=80',
  'Video Serisi'
);
