-- StudyIA: tablas para el respaldo offline-first y control de uso de la IA.
-- Las filas usan el mismo UUID que en el teléfono; updated_at lo fija el cliente y
-- deleted_at es el borrado lógico que se propaga a los demás dispositivos.
-- Las tablas antiguas (subjects, notes, flashcards, activities) no se tocan.

create table if not exists public.study_subjects (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  code text not null default '',
  description text not null default '',
  color text not null default '#6366F1',
  icon text not null default 'book-open-page-variant',
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists public.study_materials (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  subject_id uuid not null references public.study_subjects (id) on delete cascade,
  title text not null,
  source_type text not null check (source_type in ('text', 'image', 'pdf', 'document')),
  source_text text,
  file_name text,
  mime_type text,
  status text not null default 'pending' check (status in ('pending', 'ready', 'error')),
  generator text check (generator in ('ai', 'local')),
  error_message text,
  summary text,
  key_concepts jsonb,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists public.study_flashcards (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  material_id uuid not null references public.study_materials (id) on delete cascade,
  subject_id uuid not null references public.study_subjects (id) on delete cascade,
  question text not null,
  answer text not null,
  box integer not null default 1 check (box between 1 and 5),
  due_at timestamptz not null,
  review_count integer not null default 0 check (review_count >= 0),
  last_reviewed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists public.study_quiz_questions (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  material_id uuid not null references public.study_materials (id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_index integer not null check (correct_index >= 0),
  explanation text not null default '',
  position integer not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists public.study_quiz_attempts (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  material_id uuid not null references public.study_materials (id) on delete cascade,
  subject_id uuid not null references public.study_subjects (id) on delete cascade,
  score integer not null check (score >= 0),
  total integer not null check (total > 0),
  answers jsonb not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table if not exists public.study_activities (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('material', 'flashcards', 'quiz')),
  title text not null,
  detail text not null default '',
  subject_name text not null default '',
  material_id uuid,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

-- Índices para el filtro por usuario y para las llaves foráneas.
create index if not exists study_subjects_user_idx on public.study_subjects (user_id);
create index if not exists study_materials_user_idx on public.study_materials (user_id);
create index if not exists study_materials_subject_idx on public.study_materials (subject_id);
create index if not exists study_flashcards_user_idx on public.study_flashcards (user_id);
create index if not exists study_flashcards_material_idx on public.study_flashcards (material_id);
create index if not exists study_flashcards_subject_idx on public.study_flashcards (subject_id);
create index if not exists study_quiz_questions_user_idx on public.study_quiz_questions (user_id);
create index if not exists study_quiz_questions_material_idx on public.study_quiz_questions (material_id);
create index if not exists study_quiz_attempts_user_idx on public.study_quiz_attempts (user_id);
create index if not exists study_quiz_attempts_material_idx on public.study_quiz_attempts (material_id);
create index if not exists study_quiz_attempts_subject_idx on public.study_quiz_attempts (subject_id);
create index if not exists study_activities_user_idx on public.study_activities (user_id);

-- Cada usuario solo ve, crea, edita y borra sus propias filas.
do $$
declare
  t text;
begin
  foreach t in array array[
    'study_subjects', 'study_materials', 'study_flashcards',
    'study_quiz_questions', 'study_quiz_attempts', 'study_activities'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "ver los míos" on public.%I', t);
    execute format('drop policy if exists "crear los míos" on public.%I', t);
    execute format('drop policy if exists "editar los míos" on public.%I', t);
    execute format('drop policy if exists "borrar los míos" on public.%I', t);
    execute format(
      'create policy "ver los míos" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "crear los míos" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "editar los míos" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format(
      'create policy "borrar los míos" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end
$$;

-- Registro de llamadas a la IA: la Edge Function lo usa para limitar el gasto por usuario.
-- Sin políticas de update ni delete: el usuario no puede reiniciar su propio contador.
create table if not exists public.ai_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  action text not null,
  created_at timestamptz not null default now()
);
create index if not exists ai_requests_user_time_idx on public.ai_requests (user_id, created_at desc);
alter table public.ai_requests enable row level security;
drop policy if exists "ver los míos" on public.ai_requests;
drop policy if exists "crear los míos" on public.ai_requests;
create policy "ver los míos" on public.ai_requests
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "crear los míos" on public.ai_requests
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Conserva las materias que ya se hubieran creado con la versión anterior de la app.
insert into public.study_subjects (id, user_id, name, code, description, color, icon, created_at, updated_at)
select id, user_id, name, coalesce(code, ''), coalesce(description, ''), coalesce(color, '#6366F1'),
       coalesce(icon, 'book-open-page-variant'), created_at, created_at
from public.subjects
on conflict (id) do nothing;

-- Endurece el trigger de perfiles: ruta de búsqueda fija y no invocable por la API.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, role, institution, career)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Estudiante'),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'Estudiante Universitario'),
    coalesce(new.raw_user_meta_data->>'institution', 'Universidad de La Guajira'),
    coalesce(new.raw_user_meta_data->>'career', 'Ingeniería de Sistemas')
  );
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
