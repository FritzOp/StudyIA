-- ==============================================================================
-- STUDYIA - ESQUEMA DE BASE DE DATOS SUPABASE (PostgreSQL)
-- Universidad de La Guajira - Proyecto Final de Móvil
-- ==============================================================================
-- Copia y pega este script en: Supabase Dashboard -> SQL Editor -> New Query -> Run

-- 1. TABLA DE PERFILES DE USUARIOS (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'Estudiante Universitario',
  institution TEXT DEFAULT 'Universidad de La Guajira',
  career TEXT DEFAULT 'Ingeniería de Sistemas',
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  semester TEXT DEFAULT '1er Semestre',
  study_streak_days INTEGER DEFAULT 1,
  xp_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABLA DE ASIGNATURAS / MATERIAS
CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT DEFAULT 'MAT-101',
  description TEXT,
  icon TEXT DEFAULT 'book-open-page-variant',
  color TEXT DEFAULT '#6366F1',
  notes_count INTEGER DEFAULT 0,
  progress INTEGER DEFAULT 0,
  last_activity TEXT DEFAULT 'Recién agregada',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABLA DE APUNTES Y RESÚMENES CON IA
CREATE TABLE IF NOT EXISTS public.notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABLA DE FLASHCARDS GENERADAS
CREATE TABLE IF NOT EXISTS public.flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
  note_id UUID REFERENCES public.notes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  difficulty TEXT DEFAULT 'media',
  times_reviewed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABLA DE ACTIVIDADES RECIENTES
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  type TEXT DEFAULT 'summary', -- 'summary', 'flashcards', 'quiz'
  snippet TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- SEGURIDAD A NIVEL DE FILAS (ROW LEVEL SECURITY - RLS)
-- Cada estudiante solo puede ver y editar sus propios datos
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Políticas para Subjects
CREATE POLICY "Los usuarios pueden ver sus asignaturas" 
  ON public.subjects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus asignaturas" 
  ON public.subjects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus asignaturas" 
  ON public.subjects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus asignaturas" 
  ON public.subjects FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para Notes
CREATE POLICY "Los usuarios pueden ver sus notas" 
  ON public.notes FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus notas" 
  ON public.notes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para Flashcards
CREATE POLICY "Los usuarios pueden ver sus flashcards" 
  ON public.flashcards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus flashcards" 
  ON public.flashcards FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Políticas para Activities
CREATE POLICY "Los usuarios pueden ver sus actividades" 
  ON public.activities FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden insertar sus actividades" 
  ON public.activities FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ==============================================================================
-- TRIGGER AUTOMÁTICO: CREACIÓN DE PERFIL AL REGISTRARSE EN AUTH.USERS
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, institution, career)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'Estudiante'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'Estudiante Universitario'),
    COALESCE(NEW.raw_user_meta_data->>'institution', 'Universidad de La Guajira'),
    COALESCE(NEW.raw_user_meta_data->>'career', 'Ingeniería de Sistemas')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eliminar trigger si ya existía para evitar duplicados
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
