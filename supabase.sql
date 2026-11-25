-- Rozjede to? – database.
-- Run all of this once in Supabase: SQL Editor → New query → paste → Run.
-- It is safe to run again later (nothing gets deleted).
--
--   builds – visitors' saved PC builds (the website reads and writes these, each user only their own)
--   parts  – CPUs and GPUs with their performance score (you edit these in Table Editor)
--   games  – games and their requirements, filled every week from RAWG by GitHub (you can edit them too)
--
-- The website itself never reads "parts" and "games" from here: GitHub copies them into
-- data/parts.js and data/games.js (weekly, or with the "Publikovat změny z databáze" button),
-- which keeps the site fast and within Supabase's free limits.

-- ============ builds ============
create table if not exists public.builds (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 60),
  cpu         text not null check (char_length(cpu) <= 100),
  gpu         text not null check (char_length(gpu) <= 100),
  ram         int  not null check (ram between 1 and 1024),
  created_at  timestamptz not null default now()
);
create index if not exists builds_user_idx on public.builds (user_id);
alter table public.builds enable row level security;

drop policy if exists "Own builds: read" on public.builds;
create policy "Own builds: read" on public.builds
  for select to authenticated using (auth.uid() = user_id);
drop policy if exists "Own builds: add" on public.builds;
create policy "Own builds: add" on public.builds
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "Own builds: change" on public.builds;
create policy "Own builds: change" on public.builds
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "Own builds: delete" on public.builds;
create policy "Own builds: delete" on public.builds
  for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.builds to authenticated;

-- ============ parts (CPUs and GPUs) ============
-- score: performance on one scale (GTX 1060 6GB = 100 for GPUs, Core i5-8400 = 100 for CPUs)
-- hidden: generic requirement ("dual core 2.4 GHz") – used for games, not offered to visitors
-- aliases: other names people or games use for the same part, e.g. {"GTX 1060"}
create table if not exists public.parts (
  id       bigint generated always as identity primary key,
  kind     text not null check (kind in ('cpu', 'gpu')),
  name     text not null,
  score    int  not null check (score >= 0),
  hidden   boolean not null default false,
  aliases  text[] not null default '{}',
  unique (kind, name)
);
alter table public.parts enable row level security;   -- no policies: only you (dashboard) and GitHub (secret key) can access

-- ============ games ============
-- min / rec: {"cpu": [part names] | null, "gpu": [part names] | null, "ram": GB | null}
-- manual: set automatically when you edit or add a game yourself – the weekly RAWG update then leaves it alone
create table if not exists public.games (
  id          bigint primary key,            -- RAWG game id (pick any unused number for a game you add by hand)
  slug        text,
  name        text not null,
  pop         int,                           -- popularity rank on RAWG (1 = most popular)
  released    date,
  year        int,
  tba         boolean not null default false,
  genres      text[] not null default '{}',
  img         text,
  upcoming    boolean not null default false,
  min         jsonb not null default '{"cpu": null, "gpu": null, "ram": null}',
  rec         jsonb,
  req_text    jsonb,                         -- original requirement text when it couldn't be read fully
  no_req      boolean not null default false,
  manual      boolean not null default false,
  updated_at  timestamptz not null default now()
);
alter table public.games enable row level security;   -- no policies: only you (dashboard) and GitHub (secret key)

-- Any change not made by GitHub's updater (which uses the secret key = role service_role)
-- marks the game as edited by hand, so the next RAWG update won't overwrite it.
create or replace function public.games_mark_manual() returns trigger
language plpgsql as $$
begin
  if current_user <> 'service_role' then
    -- unticking "manual" yourself is allowed: the game is then updated from RAWG again
    if not (tg_op = 'UPDATE' and old.manual and not new.manual) then
      new.manual := true;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists games_mark_manual on public.games;
create trigger games_mark_manual before insert or update on public.games
  for each row execute function public.games_mark_manual();
