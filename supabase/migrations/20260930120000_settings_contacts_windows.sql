-- Persone da contattare (telefono = anche WhatsApp) e finestre di apertura,
-- gestite dall'admin. `day` segue Date.getDay() (domenica = 0); `close` può
-- cadere dopo la mezzanotte.
alter table public.site_settings
  add column if not exists contacts jsonb not null default '[]'::jsonb,
  add column if not exists opening_windows jsonb not null default '[]'::jsonb;
