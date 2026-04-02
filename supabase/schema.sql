create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key,
  email text not null,
  display_name text,
  role text not null default 'editor',
  created_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.survey_versions (
  id uuid primary key default gen_random_uuid(),
  version_number integer not null unique,
  status text not null default 'draft',
  schema jsonb not null,
  created_by uuid references public.admin_users (user_id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now())
);

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  deleted_at timestamptz,
  deleted_by uuid references public.admin_users (user_id) on delete set null,
  survey_version_id uuid references public.survey_versions (id) on delete set null,
  survey_snapshot jsonb,
  age integer,
  gender text,
  nationality text,
  role text,
  shift_type text,
  height_cm numeric,
  weight_kg numeric,
  bmi numeric,
  stool_type smallint,
  psqi_score smallint,
  ultra_processed_yes_count smallint,
  consent_confirmed boolean not null default false,
  source text not null default 'public-web',
  profile jsonb not null default '{}'::jsonb,
  analytics jsonb not null default '{}'::jsonb,
  responses jsonb not null
);

alter table public.survey_responses add column if not exists updated_at timestamptz not null default timezone('utc'::text, now());
alter table public.survey_responses add column if not exists deleted_at timestamptz;
alter table public.survey_responses add column if not exists deleted_by uuid references public.admin_users (user_id) on delete set null;
alter table public.survey_responses add column if not exists survey_version_id uuid references public.survey_versions (id) on delete set null;
alter table public.survey_responses add column if not exists survey_snapshot jsonb;
alter table public.survey_responses alter column profile set default '{}'::jsonb;
alter table public.survey_responses alter column analytics set default '{}'::jsonb;

create unique index if not exists admin_users_email_idx
  on public.admin_users (lower(email));

create unique index if not exists survey_versions_single_draft_idx
  on public.survey_versions (status)
  where status = 'draft';

create unique index if not exists survey_versions_single_published_idx
  on public.survey_versions (status)
  where status = 'published';

create index if not exists survey_versions_status_idx
  on public.survey_versions (status, version_number desc);

create index if not exists survey_responses_active_created_at_idx
  on public.survey_responses (created_at desc)
  where deleted_at is null;

create index if not exists survey_responses_active_version_idx
  on public.survey_responses (survey_version_id)
  where deleted_at is null;

create index if not exists survey_responses_active_gender_idx
  on public.survey_responses (gender)
  where deleted_at is null;

create index if not exists survey_responses_active_role_idx
  on public.survey_responses (role)
  where deleted_at is null;

create index if not exists survey_responses_active_shift_type_idx
  on public.survey_responses (shift_type)
  where deleted_at is null;

create index if not exists survey_responses_active_psqi_score_idx
  on public.survey_responses (psqi_score)
  where deleted_at is null;

create index if not exists survey_responses_active_upf_count_idx
  on public.survey_responses (ultra_processed_yes_count)
  where deleted_at is null;

alter table public.admin_users enable row level security;
alter table public.survey_versions enable row level security;
alter table public.survey_responses enable row level security;

comment on table public.admin_users is
  'Supabase auth users allowed to access the /admin panel.';

comment on table public.survey_versions is
  'Versioned survey schemas used by the public form and admin CMS.';

comment on table public.survey_responses is
  'Public survey submissions with immutable survey snapshots for reporting and auditability.';

comment on column public.survey_responses.survey_snapshot is
  'Exact schema snapshot used when the response was submitted.';
