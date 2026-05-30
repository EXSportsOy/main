-- ============================================================================
--  EXS Feedback — database schema (Supabase / PostgreSQL)
--  Run in Supabase Dashboard → SQL Editor.
-- ============================================================================

create table if not exists public.feedback (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  category      text not null
                check (category in ('website', 'program_general', 'program_bug')),
  app           text not null default 'website'
                check (app in ('website', 'surveytools', 'heda', 'shodia')),
  lang          text check (lang is null or char_length(lang) <= 8),

  message       text not null check (char_length(message) between 1 and 8000),
  rating        smallint check (rating between 1 and 5),
  email         text check (email is null or char_length(email) <= 320),

  -- Bug report fields (null for other categories)
  bug_title     text check (bug_title is null or char_length(bug_title) <= 200),
  severity      text check (severity is null or severity in ('low','medium','high','critical')),
  steps         text check (steps is null or char_length(steps) <= 8000),
  expected      text check (expected is null or char_length(expected) <= 4000),
  actual        text check (actual is null or char_length(actual) <= 4000),
  environment   text check (environment is null or char_length(environment) <= 400),

  page_url      text check (page_url is null or char_length(page_url) <= 2000),
  user_agent    text check (user_agent is null or char_length(user_agent) <= 1000),

  status        text not null default 'new'
                check (status in ('new','in_progress','resolved','wontfix'))
);

create index if not exists feedback_created_at_idx on public.feedback (created_at desc);
create index if not exists feedback_app_idx        on public.feedback (app);
create index if not exists feedback_category_idx   on public.feedback (category);
create index if not exists feedback_status_idx     on public.feedback (status);

-- ----------------------------------------------------------------------------
--  Row Level Security: anonymous users may ONLY insert — not read/update/delete.
--  Read your feedback from the Supabase Dashboard or with the service_role key.
-- ----------------------------------------------------------------------------
alter table public.feedback enable row level security;

drop policy if exists "feedback_insert_anon" on public.feedback;
create policy "feedback_insert_anon"
  on public.feedback
  for insert
  to anon, authenticated
  with check (char_length(message) between 1 and 8000);

-- No SELECT/UPDATE/DELETE policy for anon → the public key cannot read others' feedback.
