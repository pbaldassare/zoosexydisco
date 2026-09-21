-- =====================================================================
-- ZOO Sexy Disco — schema di base
-- Tabelle, funzioni di ruolo, RLS. Tutte le tabelle hanno id, created_at,
-- updated_at (trigger). I campi bilingui sono coppie _it / _en.
-- =====================================================================

-- ---------------------------------------------------------------------
-- utilità
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- ruoli: admin e iscritti
-- ---------------------------------------------------------------------
create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admin_users where user_id = (select auth.uid()));
$$;

-- ---------------------------------------------------------------------
-- impostazioni e testi
-- ---------------------------------------------------------------------
create table public.site_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton),
  company_name text not null,
  legal_address text not null,
  vat_number text not null,
  rea text not null,
  registry text not null,
  share_capital text not null,
  pec text not null,
  email text not null,
  phone text not null default '[da completare]',
  whatsapp text not null default '[da completare]',
  instagram_handle text not null default '[da completare]',
  instagram_url text not null default '',
  google_reviews_url text not null default '',
  address_venue text not null default '[da completare]',
  maps_query text not null default '',
  opening_hours_it text not null default '[da completare]',
  opening_hours_en text not null default '',
  entry_prices_it text not null default '[da completare]',
  entry_prices_en text not null default '',
  drink_prices_it text not null default '[da completare]',
  drink_prices_en text not null default '',
  logo_path text,
  upload_video_max_mb int not null default 50 check (upload_video_max_mb between 1 and 5000),
  upload_video_max_seconds int not null default 90 check (upload_video_max_seconds between 5 and 3600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  page text generated always as (split_part(key, '.', 1)) stored,
  it text not null default '',
  en text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- temi
-- ---------------------------------------------------------------------
create table public.themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  accent text not null check (accent ~ '^#[0-9A-Fa-f]{6}$'),
  accent_hot text not null check (accent_hot ~ '^#[0-9A-Fa-f]{6}$'),
  hero_image_path text,
  hero_video_path text,
  logo_path text,
  starts_at timestamptz,
  ends_at timestamptz,
  is_default boolean not null default false,
  force_active boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at is null or ends_at is null or starts_at < ends_at)
);
-- un solo tema Default e un solo tema forzato alla volta
create unique index themes_one_default on public.themes (is_default) where is_default;
create unique index themes_one_forced on public.themes (force_active) where force_active;

create or replace function public.protect_default_theme()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' and old.is_default then
    raise exception 'Il tema Default non si può cancellare';
  end if;
  if tg_op = 'UPDATE' and old.is_default and not new.is_default then
    raise exception 'Il tema Default non si può declassare: imposta un altro tema come Default';
  end if;
  return coalesce(new, old);
end;
$$;

-- ---------------------------------------------------------------------
-- serate e spettacoli
-- ---------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title_it text not null,
  title_en text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  dress_code_it text not null default '',
  dress_code_en text not null default '',
  description_it text not null default '',
  description_en text not null default '',
  cover_path text,
  entry_it text not null default '',
  entry_en text not null default '',
  theme_id uuid references public.themes (id) on delete set null,
  members_only boolean not null default false,
  published boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (starts_at < ends_at)
);
create index events_starts_at on public.events (starts_at);
create index events_theme_id on public.events (theme_id);

create table public.shows (
  id uuid primary key default gen_random_uuid(),
  title_it text not null,
  title_en text not null default '',
  description_it text not null default '',
  description_en text not null default '',
  schedule_it text not null default '',
  schedule_en text not null default '',
  cover_path text,
  sort int not null default 0,
  published boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- media
-- ---------------------------------------------------------------------
create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image', 'video')),
  bucket text not null check (bucket in ('public-media', 'private-video', 'members-media')),
  path text not null,
  thumb_path text,
  poster_path text,
  width int,
  height int,
  duration_s numeric(8, 2),
  size_bytes bigint,
  event_id uuid references public.events (id) on delete set null,
  -- 'members' rende il contenuto riservato agli iscritti, anche se ha altri placement
  placement text[] not null default '{gallery}' check (placement <@ array['gallery', 'home', 'members']::text[]),
  alt_it text,
  alt_en text,
  people_tag text,
  release_signed boolean not null default false,
  release_date date,
  visible boolean not null default true,
  sort int not null default 0,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (bucket, path)
);
create index media_event_id on public.media (event_id);
create index media_people_tag on public.media (people_tag) where people_tag is not null;
create index media_placement on public.media using gin (placement);

-- ---------------------------------------------------------------------
-- promozioni, recensioni, ruoli
-- ---------------------------------------------------------------------
create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  title_it text not null,
  title_en text not null default '',
  body_it text not null default '',
  body_en text not null default '',
  code text,
  image_path text,
  valid_from timestamptz not null default now(),
  valid_to timestamptz not null,
  audience text not null default 'public' check (audience in ('public', 'members')),
  published boolean not null default false,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (valid_from < valid_to)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  rating int not null check (rating between 1 and 5),
  text_it text not null default '',
  text_en text not null default '',
  source text not null default 'manual' check (source in ('google', 'manual')),
  review_date date,
  visible boolean not null default true,
  sort int not null default 0,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_roles (
  id uuid primary key default gen_random_uuid(),
  name_it text not null unique,
  name_en text not null default '',
  active boolean not null default true,
  sort int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- newsletter
-- ---------------------------------------------------------------------
create table public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null default '',
  lang text not null default 'it' check (lang in ('it', 'en')),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  confirm_token uuid default gen_random_uuid(),
  consent_at timestamptz not null default now(),
  confirmed_at timestamptz,
  last_open_at timestamptz,
  auth_user_id uuid unique references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index subscribers_email_lower on public.subscribers (lower(email));
create index subscribers_auth_user on public.subscribers (auth_user_id);

create or replace function public.is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscribers
    where auth_user_id = (select auth.uid()) and status = 'confirmed'
  );
$$;

create table public.campaigns (
  id uuid primary key default gen_random_uuid(),
  subject_it text not null,
  subject_en text not null default '',
  body_it text not null default '',
  body_en text not null default '',
  audience text not null default 'confirmed',
  status text not null default 'draft' check (status in ('draft', 'sending', 'sent')),
  sent_at timestamptz,
  recipients int not null default 0,
  opens int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- una riga per iscritto e campagna: le aperture ripetute non gonfiano il conteggio
create table public.campaign_opens (
  campaign_id uuid not null references public.campaigns (id) on delete cascade,
  subscriber_id uuid not null references public.subscribers (id) on delete cascade,
  first_open_at timestamptz not null default now(),
  primary key (campaign_id, subscriber_id)
);

-- ---------------------------------------------------------------------
-- candidature e messaggi (dati personali: cancellazione automatica)
-- ---------------------------------------------------------------------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  birth_date date not null check (birth_date <= (current_date - interval '18 years')),
  city text,
  phone text not null,
  email text not null,
  role_id uuid references public.job_roles (id) on delete set null,
  experience text,
  availability jsonb not null default '{}'::jsonb,
  photo_paths text[] not null default '{}' check (cardinality(photo_paths) between 0 and 3),
  cv_path text,
  extra_paths text[] not null default '{}' check (cardinality(extra_paths) <= 2),
  notes text,
  consent_at timestamptz not null,
  status text not null default 'new' check (status in ('new', 'contacted', 'trial', 'hired', 'rejected')),
  internal_notes text,
  delete_after timestamptz not null default (now() + interval '12 months'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index applications_delete_after on public.applications (delete_after);
create index applications_status on public.applications (status);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('contact', 'party')),
  name text not null,
  email text not null,
  phone text,
  party_type text check (party_type in ('celibato', 'compleanno', 'aziendale', 'altro')),
  party_date date,
  guests int check (guests between 1 and 500),
  message text,
  consent_at timestamptz not null,
  handled boolean not null default false,
  delete_after timestamptz not null default (now() + interval '12 months'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index contact_messages_delete_after on public.contact_messages (delete_after);

-- ---------------------------------------------------------------------
-- statistiche in-house: niente IP, niente identificativi
-- ---------------------------------------------------------------------
create table public.page_views (
  id uuid primary key default gen_random_uuid(),
  day date not null default current_date,
  path text not null,
  lang text,
  referrer_host text,
  device text check (device in ('mobile', 'tablet', 'desktop')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index page_views_day on public.page_views (day);

create table public.site_events (
  id uuid primary key default gen_random_uuid(),
  day date not null default current_date,
  type text not null check (type in ('whatsapp_click', 'phone_click', 'table_booking_click', 'newsletter_signup', 'application_sent', 'party_request')),
  path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index site_events_day on public.site_events (day);

-- aggregati giornalieri: qui finiscono i dati grezzi oltre i 13 mesi
create table public.page_views_daily (
  day date not null,
  path text not null,
  lang text not null default '',
  referrer_host text not null default '',
  device text not null default '',
  views int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (day, path, lang, referrer_host, device)
);

-- ---------------------------------------------------------------------
-- trigger updated_at e tema Default
-- ---------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'site_settings', 'content_blocks', 'themes', 'events', 'shows', 'media', 'promotions',
    'reviews', 'job_roles', 'subscribers', 'campaigns', 'applications', 'contact_messages',
    'page_views', 'site_events', 'page_views_daily'
  ] loop
    execute format('create trigger %I before update on public.%I for each row execute function public.set_updated_at()', t || '_updated_at', t);
  end loop;
end $$;

create trigger themes_protect_default
before update or delete on public.themes
for each row execute function public.protect_default_theme();

-- ---------------------------------------------------------------------
-- tema attivo (stessa logica di src/data/themes.ts)
-- 1. force_active  2. finestra di date (starts_at più recente)
-- 3. tema di una serata pubblicata in corso (dalle 12:00, ora di Roma)  4. Default
-- ---------------------------------------------------------------------
create or replace function public.active_theme()
returns setof public.themes
language plpgsql
stable
set search_path = ''
as $$
declare
  r public.themes;
begin
  select t.* into r from public.themes t where t.force_active limit 1;
  if found then return next r; return; end if;

  select t.* into r from public.themes t
  where t.starts_at <= now() and now() < t.ends_at
  order by t.starts_at desc limit 1;
  if found then return next r; return; end if;

  select t.* into r from public.events e join public.themes t on t.id = e.theme_id
  where e.published and not e.members_only
    and ((date_trunc('day', e.starts_at at time zone 'Europe/Rome') + interval '12 hours') at time zone 'Europe/Rome') <= now()
    and now() < e.ends_at
  order by e.starts_at limit 1;
  if found then return next r; return; end if;

  select t.* into r from public.themes t where t.is_default limit 1;
  if found then return next r; end if;
end;
$$;

-- =====================================================================
-- RLS
-- =====================================================================
do $$
declare t text;
begin
  foreach t in array array[
    'site_settings', 'content_blocks', 'themes', 'events', 'shows', 'media', 'promotions',
    'reviews', 'job_roles', 'subscribers', 'campaigns', 'campaign_opens', 'applications',
    'contact_messages', 'page_views', 'site_events', 'page_views_daily'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    -- l'admin può tutto, una policy per operazione
    execute format('create policy %I on public.%I for select to authenticated using ((select public.is_admin()))', t || '_admin_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_admin()))', t || '_admin_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t || '_admin_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_admin()))', t || '_admin_delete', t);
  end loop;
end $$;

-- admin_users: ognuno vede solo la propria riga (serve al login admin);
-- gli admin si aggiungono da SQL o con service role, mai dal client.
create policy admin_users_select_self on public.admin_users
for select to authenticated using (user_id = (select auth.uid()));

-- lettura pubblica: solo ciò che è pubblicato o visibile
create policy site_settings_public_read on public.site_settings for select to anon, authenticated using (true);
create policy content_blocks_public_read on public.content_blocks for select to anon, authenticated using (true);
create policy themes_public_read on public.themes for select to anon, authenticated using (true);
create policy job_roles_public_read on public.job_roles for select to anon, authenticated using (active);
create policy shows_public_read on public.shows for select to anon, authenticated using (published);
create policy reviews_public_read on public.reviews for select to anon, authenticated using (visible);

create policy events_public_read on public.events for select to anon, authenticated
using (published and (not members_only or (select public.is_member())));

create policy media_public_read on public.media for select to anon, authenticated
using (visible and (not ('members' = any (placement)) or (select public.is_member())));

create policy promotions_public_read on public.promotions for select to anon, authenticated
using (
  published and valid_from <= now() and now() < valid_to
  and (audience = 'public' or (audience = 'members' and (select public.is_member())))
);

-- l'iscritto vede solo la propria iscrizione (area riservata)
create policy subscribers_select_self on public.subscribers
for select to authenticated using (auth_user_id = (select auth.uid()));

-- applications, contact_messages, campaigns, campaign_opens, page_views, site_events,
-- page_views_daily: nessun accesso anonimo. Si scrivono solo dalle Edge Functions
-- con service role (che bypassa RLS); si leggono solo da admin.

-- funzioni: esecuzione solo ai ruoli che servono
revoke execute on function public.is_admin() from public;
revoke execute on function public.is_member() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_member() to anon, authenticated;
grant execute on function public.active_theme() to anon, authenticated;
