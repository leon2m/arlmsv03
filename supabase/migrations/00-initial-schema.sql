-- Kullanıcı profilleri tablosu
create table public.profiles (
  id uuid references auth.users on delete cascade,
  full_name text,
  avatar_url text,
  active_days_streak integer default 0,
  total_points integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- RLS politikaları
alter table public.profiles enable row level security;
create policy "Kullanıcılar kendi profillerini görebilir"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Kullanıcılar kendi profillerini güncelleyebilir"
  on public.profiles for update
  using ( auth.uid() = id );

-- Kurslar tablosu
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  category text not null,
  duration text,
  rating numeric(3,2) default 0,
  difficulty text,
  thumbnail text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Kullanıcı ilerleme tablosu
create table public.user_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  progress integer default 0,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, course_id)
);

-- RLS politikaları
alter table public.user_progress enable row level security;
create policy "Kullanıcılar kendi ilerlemelerini görebilir"
  on public.user_progress for select
  using ( auth.uid() = user_id );

create policy "Kullanıcılar kendi ilerlemelerini güncelleyebilir"
  on public.user_progress for update
  using ( auth.uid() = user_id );

-- Kullanıcı ilgi alanları tablosu
create table public.user_interests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  category text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, category)
);

-- RLS politikaları
alter table public.user_interests enable row level security;
create policy "Kullanıcılar kendi ilgi alanlarını görebilir"
  on public.user_interests for select
  using ( auth.uid() = user_id );

create policy "Kullanıcılar kendi ilgi alanlarını güncelleyebilir"
  on public.user_interests for update
  using ( auth.uid() = user_id );

-- Öğrenme hedefleri tablosu
create table public.learning_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  target_date date,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS politikaları
alter table public.learning_goals enable row level security;
create policy "Kullanıcılar kendi hedeflerini görebilir"
  on public.learning_goals for select
  using ( auth.uid() = user_id );

-- Fonksiyonlar ve tetikleyiciler
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Updated_at tetikleyicileri
create trigger handle_updated_at
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.courses
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at
  before update on public.learning_goals
  for each row
  execute procedure public.handle_updated_at();
