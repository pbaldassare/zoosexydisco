-- Statistiche in-house per la Dashboard del pannello.
--
-- «entry» segna la prima pagina aperta in una scheda del browser: è una visita.
-- Le altre righe sono pagine viste. Nessun identificativo: il browser ricorda
-- solo «questa scheda è già stata contata», fino alla sua chiusura.
alter table public.page_views add column if not exists entry boolean not null default false;
create index if not exists site_events_day_type on public.site_events (day, type);

-- Tutto calcolato qui: al telefono dell'admin arriva un solo JSON piccolo.
-- I giorni sono quelli di Roma; il periodo precedente ha la stessa durata.
create or replace function public.dashboard_stats(p_days int)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  today date := (now() at time zone 'Europe/Rome')::date;
  cur_from date := today - (p_days - 1);
  prev_from date := today - (2 * p_days - 1);
  prev_to date := today - p_days;
  result jsonb;
begin
  if not public.is_admin() then
    raise exception 'solo admin' using errcode = '42501';
  end if;

  with pv as (
    select * from public.page_views where day between prev_from and today and path not like '/admin%'
  ),
  ev as (
    select * from public.site_events where day between prev_from and today
  )
  select jsonb_build_object(
    'from', cur_from,
    'to', today,
    'visits', (select count(*) from pv where entry and day >= cur_from),
    'visits_prev', (select count(*) from pv where entry and day between prev_from and prev_to),
    'views', (select count(*) from pv where day >= cur_from),
    'views_prev', (select count(*) from pv where day between prev_from and prev_to),
    'whatsapp', (select count(*) from ev where type = 'whatsapp_click' and day >= cur_from),
    'whatsapp_prev', (select count(*) from ev where type = 'whatsapp_click' and day between prev_from and prev_to),
    'phone', (select count(*) from ev where type = 'phone_click' and day >= cur_from),
    'phone_prev', (select count(*) from ev where type = 'phone_click' and day between prev_from and prev_to),
    'series', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d::date, 'visits', coalesce(v.visits, 0), 'views', coalesce(v.views, 0)) order by d), '[]'::jsonb)
      from generate_series(cur_from, today, interval '1 day') d
      left join (
        select day, count(*) filter (where entry) as visits, count(*) as views from pv where day >= cur_from group by day
      ) v on v.day = d::date
    ),
    'pages', (
      select coalesce(jsonb_agg(jsonb_build_object('path', path, 'views', n) order by n desc, path), '[]'::jsonb)
      from (select path, count(*) as n from pv where day >= cur_from group by path order by n desc, path limit 8) t
    ),
    'sources', (
      select coalesce(jsonb_agg(jsonb_build_object('source', source, 'visits', n) order by n desc), '[]'::jsonb)
      from (
        select case
                 when coalesce(referrer_host, '') = '' then 'direct'
                 when referrer_host like '%instagram.%' then 'instagram'
                 when referrer_host ~ '(^|\.)google\.' then 'google'
                 when referrer_host ~ '(^|\.)(facebook|fb)\.' then 'facebook'
                 else 'other'
               end as source,
               count(*) as n
        from pv where entry and day >= cur_from group by 1
      ) t
    ),
    'devices', (
      select coalesce(jsonb_agg(jsonb_build_object('device', coalesce(device, 'desktop'), 'visits', n) order by n desc), '[]'::jsonb)
      from (select device, count(*) as n from pv where entry and day >= cur_from group by device) t
    ),
    'messages_open', (select count(*) from public.contact_messages where not handled),
    'applications_new', (select count(*) from public.applications where status = 'new')
  ) into result;
  return result;
end;
$$;

revoke execute on function public.dashboard_stats(int) from public, anon;
grant execute on function public.dashboard_stats(int) to authenticated;
