-- ═══════════════════════════════════════════════════════════════
--  FORMPILOT AI — FULL DATABASE SCHEMA MIGRATION
--  Supabase PostgreSQL + Row Level Security
-- ═══════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT,
  email         TEXT UNIQUE NOT NULL,
  avatar_url    TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ──────────────────────────────────────────────────────────────
-- 2. FORMS
-- ──────────────────────────────────────────────────────────────
CREATE TYPE form_status AS ENUM (
  'UPLOADING', 'PROCESSING', 'EXTRACTING', 'UNDERSTANDING', 'READY', 'ERROR'
);

CREATE TABLE IF NOT EXISTS public.forms (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL DEFAULT 'Untitled Form',
  original_file_url TEXT,
  file_type         TEXT,
  status            form_status DEFAULT 'UPLOADING',
  form_type         TEXT,
  extracted_schema  JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_forms_user_id ON public.forms(user_id);
CREATE INDEX idx_forms_status ON public.forms(status);

ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forms"
  ON public.forms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forms"
  ON public.forms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms"
  ON public.forms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms"
  ON public.forms FOR DELETE
  USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 3. FORM FIELDS
-- ──────────────────────────────────────────────────────────────
CREATE TYPE field_validation_status AS ENUM (
  'PENDING', 'VALID', 'INVALID', 'WARNING', 'NEEDS_INPUT'
);

CREATE TABLE IF NOT EXISTS public.form_fields (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id             UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_key           TEXT NOT NULL,
  label               TEXT NOT NULL,
  description         TEXT,
  field_type          TEXT DEFAULT 'text',
  required            BOOLEAN DEFAULT false,
  options             JSONB,
  position            INTEGER DEFAULT 0,
  section             TEXT,
  confidence          REAL DEFAULT 0,
  extracted_value     TEXT,
  mapped_value        TEXT,
  validation_status   field_validation_status DEFAULT 'PENDING',
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_form_fields_form_id ON public.form_fields(form_id);

ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own form fields"
  ON public.form_fields FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own form fields"
  ON public.form_fields FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid()
  ));

-- Service role can INSERT (backend inserts after extraction)
CREATE POLICY "Service can insert form fields"
  ON public.form_fields FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can delete own form fields"
  ON public.form_fields FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.forms WHERE forms.id = form_fields.form_id AND forms.user_id = auth.uid()
  ));

-- ──────────────────────────────────────────────────────────────
-- 4. ANSWERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.answers (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id           UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_id          UUID REFERENCES public.form_fields(id) ON DELETE SET NULL,
  raw_answer        TEXT NOT NULL,
  normalized_answer TEXT,
  source            TEXT DEFAULT 'text',  -- 'text', 'voice', 'autofill'
  confidence        REAL DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_answers_form_id ON public.answers(form_id);
CREATE INDEX idx_answers_field_id ON public.answers(field_id);

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answers"
  ON public.answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON public.answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own answers"
  ON public.answers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own answers"
  ON public.answers FOR DELETE
  USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 5. DOCUMENTS (supporting attachments)
-- ──────────────────────────────────────────────────────────────
CREATE TYPE document_status AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED', 'EXPIRED');

CREATE TABLE IF NOT EXISTS public.documents (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id               UUID REFERENCES public.forms(id) ON DELETE SET NULL,
  file_name             TEXT NOT NULL,
  file_url              TEXT NOT NULL,
  document_type         TEXT,
  status                document_status DEFAULT 'UPLOADED',
  expiry_date           DATE,
  verification_status   TEXT DEFAULT 'PENDING',
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_form_id ON public.documents(form_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON public.documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 6. AI SESSIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id       UUID REFERENCES public.forms(id) ON DELETE CASCADE,
  session_type  TEXT NOT NULL,  -- 'explain', 'map', 'validate', 'chat'
  input         JSONB NOT NULL DEFAULT '{}',
  output        JSONB NOT NULL DEFAULT '{}',
  model         TEXT,
  confidence    REAL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ai_sessions_form_id ON public.ai_sessions(form_id);

ALTER TABLE public.ai_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own AI sessions"
  ON public.ai_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert AI sessions"
  ON public.ai_sessions FOR INSERT
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────
-- 7. VALIDATION RESULTS
-- ──────────────────────────────────────────────────────────────
CREATE TYPE validation_severity AS ENUM ('info', 'warning', 'error');

CREATE TABLE IF NOT EXISTS public.validation_results (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_id     UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_id    UUID REFERENCES public.form_fields(id) ON DELETE CASCADE,
  severity    validation_severity DEFAULT 'warning',
  issue_type  TEXT NOT NULL,
  message     TEXT NOT NULL,
  resolved    BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_validation_results_form_id ON public.validation_results(form_id);

ALTER TABLE public.validation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own validation results"
  ON public.validation_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.forms WHERE forms.id = validation_results.form_id AND forms.user_id = auth.uid()
  ));

CREATE POLICY "Service can insert validation results"
  ON public.validation_results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update validation results"
  ON public.validation_results FOR UPDATE
  USING (true);

-- ──────────────────────────────────────────────────────────────
-- 8. SUBMISSION REVIEWS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.submission_reviews (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_id           UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  readiness_score   INTEGER DEFAULT 0,
  missing_fields    JSONB DEFAULT '[]',
  missing_documents JSONB DEFAULT '[]',
  warnings          JSONB DEFAULT '[]',
  user_approved     BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.submission_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own submission reviews"
  ON public.submission_reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submission reviews"
  ON public.submission_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submission reviews"
  ON public.submission_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────
-- 9. AUDIT LOGS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  form_id     UUID REFERENCES public.forms(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_form_id ON public.audit_logs(form_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- ──────────────────────────────────────────────────────────────
-- 10. STORAGE BUCKETS (run via Supabase dashboard or API)
-- ──────────────────────────────────────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('forms', 'forms', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('generated', 'generated', false);

-- Storage RLS: users can only access their own folder (userId/*)
-- CREATE POLICY "Users can upload to own folder" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id IN ('forms','documents','generated') AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can view own files" ON storage.objects
--   FOR SELECT USING (bucket_id IN ('forms','documents','generated') AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete own files" ON storage.objects
--   FOR DELETE USING (bucket_id IN ('forms','documents','generated') AND auth.uid()::text = (storage.foldername(name))[1]);

-- ──────────────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER FUNCTION
-- ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_forms_updated_at BEFORE UPDATE ON public.forms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER set_form_fields_updated_at BEFORE UPDATE ON public.form_fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
