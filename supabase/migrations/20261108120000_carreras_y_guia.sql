-- Carreras temáticas y guía de estudio con IA.

-- Carreras adicionales del estudiante y si la app debe combinarlas con la principal.
alter table public.profiles
  add column if not exists extra_careers jsonb not null default '[]'::jsonb,
  add column if not exists mix_careers boolean not null default false;

-- Guía de estudio de cada apunte (explicación, glosario, plan de estudio...).
alter table public.study_materials
  add column if not exists guide jsonb;
