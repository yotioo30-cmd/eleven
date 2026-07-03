-- =========================================================
-- SEKOLAH CYBERPUNK APP — SUPABASE SCHEMA + RLS
-- Jalankan seluruh file ini di Supabase SQL Editor
-- =========================================================

-- Ekstensi
create extension if not exists "uuid-ossp";

-- =========================================================
-- 1. PROFILES  (role: admin | ketua | siswa)
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'siswa' check (role in ('admin','ketua','siswa')),
  class_name text,
  phone text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Auto-create profile saat user baru daftar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), new.email, 'siswa')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================
-- 2. STUDENTS
-- =========================================================
create table if not exists public.students (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete set null,
  nis text,
  name text not null,
  class_name text,
  gender text,
  address text,
  phone text,
  birth_date date,
  created_at timestamptz default now()
);

-- =========================================================
-- 3. TEACHERS
-- =========================================================
create table if not exists public.teachers (
  id uuid primary key default uuid_generate_v4(),
  nip text,
  name text not null,
  subject text,
  phone text,
  email text,
  created_at timestamptz default now()
);

-- =========================================================
-- 4. CLASSES
-- =========================================================
create table if not exists public.classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  wali_kelas text,
  tahun_ajaran text,
  jumlah_siswa int,
  created_at timestamptz default now()
);

-- =========================================================
-- 5. SCHEDULE
-- =========================================================
create table if not exists public.schedule (
  id uuid primary key default uuid_generate_v4(),
  class_name text,
  day text,
  subject text,
  start_time text,
  end_time text,
  teacher_name text,
  created_at timestamptz default now()
);

-- =========================================================
-- 6. GRADES
-- =========================================================
create table if not exists public.grades (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  student_name text,
  subject text,
  type text,
  score numeric,
  semester text,
  created_at timestamptz default now()
);

-- =========================================================
-- 7. ATTENDANCE
-- =========================================================
create table if not exists public.attendance (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references public.students(id) on delete cascade,
  student_name text,
  date date default current_date,
  status text check (status in ('Hadir','Izin','Sakit','Alpa')),
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- =========================================================
-- 8. ANNOUNCEMENTS
-- =========================================================
create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text,
  scope text default 'Sekolah' check (scope in ('Sekolah','Kelas')),
  target_class text,
  event_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- =========================================================
-- 9. FILES
-- =========================================================
create table if not exists public.files (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  category text default 'Dokumen' check (category in ('Materi','Tugas','Dokumen')),
  file_url text,
  file_name text,
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- =========================================================
-- 10. TRANSACTIONS (Kas Kelas)
-- =========================================================
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  date date default current_date,
  type text check (type in ('Masuk','Keluar')),
  amount numeric not null,
  description text,
  class_name text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- =========================================================
-- 11. ACTIVITY LOGS
-- =========================================================
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references public.profiles(id),
  actor_name text,
  action text,
  table_name text,
  detail text,
  created_at timestamptz default now()
);

-- =========================================================
-- 12. CHAT MESSAGES (Chat Kelas)
-- =========================================================
create table if not exists public.chat_messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id),
  sender_name text,
  class_name text,
  message text not null,
  created_at timestamptz default now()
);

-- =========================================================
-- STORAGE BUCKET UNTUK FILE
-- =========================================================
insert into storage.buckets (id, name, public)
values ('school-files','school-files', true)
on conflict (id) do nothing;

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.profiles enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.classes enable row level security;
alter table public.schedule enable row level security;
alter table public.grades enable row level security;
alter table public.attendance enable row level security;
alter table public.announcements enable row level security;
alter table public.files enable row level security;
alter table public.transactions enable row level security;
alter table public.activity_logs enable row level security;
alter table public.chat_messages enable row level security;

-- Helper: fungsi cek role user saat ini
create or replace function public.current_role_name()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- ---------- PROFILES ----------
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select
  using (true);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles for update
  using (auth.uid() = id or public.current_role_name() = 'admin');

drop policy if exists "profiles_admin_delete" on public.profiles;
create policy "profiles_admin_delete" on public.profiles for delete
  using (public.current_role_name() = 'admin');

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert
  with check (auth.uid() = id);

-- ---------- STUDENTS ----------
drop policy if exists "students_select" on public.students;
create policy "students_select" on public.students for select using (true);
drop policy if exists "students_admin_write" on public.students;
create policy "students_admin_write" on public.students for insert
  with check (public.current_role_name() = 'admin');
drop policy if exists "students_admin_update" on public.students;
create policy "students_admin_update" on public.students for update
  using (public.current_role_name() = 'admin');
drop policy if exists "students_admin_delete" on public.students;
create policy "students_admin_delete" on public.students for delete
  using (public.current_role_name() = 'admin');

-- ---------- TEACHERS ----------
drop policy if exists "teachers_select" on public.teachers;
create policy "teachers_select" on public.teachers for select using (true);
drop policy if exists "teachers_admin_all" on public.teachers;
create policy "teachers_admin_insert" on public.teachers for insert with check (public.current_role_name() = 'admin');
create policy "teachers_admin_update" on public.teachers for update using (public.current_role_name() = 'admin');
create policy "teachers_admin_delete" on public.teachers for delete using (public.current_role_name() = 'admin');

-- ---------- CLASSES ----------
create policy "classes_select" on public.classes for select using (true);
create policy "classes_admin_insert" on public.classes for insert with check (public.current_role_name() = 'admin');
create policy "classes_admin_update" on public.classes for update using (public.current_role_name() = 'admin');
create policy "classes_admin_delete" on public.classes for delete using (public.current_role_name() = 'admin');

-- ---------- SCHEDULE ----------
create policy "schedule_select" on public.schedule for select using (true);
create policy "schedule_admin_insert" on public.schedule for insert with check (public.current_role_name() = 'admin');
create policy "schedule_admin_update" on public.schedule for update using (public.current_role_name() = 'admin');
create policy "schedule_admin_delete" on public.schedule for delete using (public.current_role_name() = 'admin');

-- ---------- GRADES ----------
create policy "grades_select" on public.grades for select using (
  public.current_role_name() in ('admin','ketua')
  or student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "grades_admin_insert" on public.grades for insert with check (public.current_role_name() = 'admin');
create policy "grades_admin_update" on public.grades for update using (public.current_role_name() = 'admin');
create policy "grades_admin_delete" on public.grades for delete using (public.current_role_name() = 'admin');

-- ---------- ATTENDANCE ----------
create policy "attendance_select" on public.attendance for select using (
  public.current_role_name() in ('admin','ketua')
  or student_id in (select id from public.students where profile_id = auth.uid())
);
create policy "attendance_insert" on public.attendance for insert with check (
  public.current_role_name() in ('admin','ketua')
);
create policy "attendance_update" on public.attendance for update using (
  public.current_role_name() in ('admin','ketua')
);
create policy "attendance_delete" on public.attendance for delete using (
  public.current_role_name() = 'admin'
);

-- ---------- ANNOUNCEMENTS ----------
create policy "announcements_select" on public.announcements for select using (true);
create policy "announcements_insert" on public.announcements for insert with check (
  public.current_role_name() in ('admin','ketua')
);
create policy "announcements_update" on public.announcements for update using (
  public.current_role_name() = 'admin' or created_by = auth.uid()
);
create policy "announcements_delete" on public.announcements for delete using (
  public.current_role_name() = 'admin' or created_by = auth.uid()
);

-- ---------- FILES ----------
create policy "files_select" on public.files for select using (true);
create policy "files_insert" on public.files for insert with check (
  public.current_role_name() in ('admin','ketua')
);
create policy "files_update" on public.files for update using (
  public.current_role_name() = 'admin' or uploaded_by = auth.uid()
);
create policy "files_delete" on public.files for delete using (
  public.current_role_name() = 'admin' or uploaded_by = auth.uid()
);

-- ---------- TRANSACTIONS (KAS) ----------
create policy "transactions_select" on public.transactions for select using (true);
create policy "transactions_admin_insert" on public.transactions for insert with check (public.current_role_name() = 'admin');
create policy "transactions_admin_update" on public.transactions for update using (public.current_role_name() = 'admin');
create policy "transactions_admin_delete" on public.transactions for delete using (public.current_role_name() = 'admin');

-- ---------- ACTIVITY LOGS ----------
create policy "logs_select_admin" on public.activity_logs for select using (public.current_role_name() = 'admin');
create policy "logs_insert_any_auth" on public.activity_logs for insert with check (auth.uid() is not null);

-- ---------- CHAT MESSAGES ----------
create policy "chat_select" on public.chat_messages for select using (auth.uid() is not null);
create policy "chat_insert" on public.chat_messages for insert with check (auth.uid() is not null);
create policy "chat_delete_own_or_admin" on public.chat_messages for delete using (
  sender_id = auth.uid() or public.current_role_name() = 'admin'
);

-- =========================================================
-- STORAGE POLICIES (bucket: school-files)
-- =========================================================
create policy "school_files_public_read" on storage.objects for select
  using (bucket_id = 'school-files');
create policy "school_files_auth_upload" on storage.objects for insert
  with check (bucket_id = 'school-files' and auth.uid() is not null);
create policy "school_files_owner_delete" on storage.objects for delete
  using (bucket_id = 'school-files' and auth.uid() is not null);

-- =========================================================
-- SELESAI. Setelah menjalankan schema ini, buat admin pertama
-- dengan cara:
-- 1. Daftar akun biasa lewat aplikasi (role otomatis 'siswa')
-- 2. Di SQL editor jalankan:
--    update public.profiles set role='admin' where email='admin@email.com';
-- =========================================================
