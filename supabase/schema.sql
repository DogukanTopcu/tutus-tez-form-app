create extension if not exists pgcrypto;

create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc'::text, now()),
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
  profile jsonb not null,
  analytics jsonb not null default '{}'::jsonb,
  responses jsonb not null
);

create index if not exists survey_responses_created_at_idx
  on public.survey_responses (created_at desc);

create index if not exists survey_responses_psqi_score_idx
  on public.survey_responses (psqi_score);

create index if not exists survey_responses_upf_count_idx
  on public.survey_responses (ultra_processed_yes_count);

alter table public.survey_responses enable row level security;

comment on table public.survey_responses is
  'Public web survey submissions for the seafarer nutrition study.';
