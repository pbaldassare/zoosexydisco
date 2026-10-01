-- Pulizia notturna: pg_cron chiama la Edge Function purge-expired alle 02:30
-- UTC, cioè 03:30 a Roma d'inverno e 04:30 d'estate: a locale chiuso.
-- Il segreto condiviso sta nel Vault con il nome «cron_secret» e nei segreti
-- delle funzioni come CRON_SECRET: si crea a mano, non sta nel repository.
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule(jobid) from cron.job where jobname = 'purge-expired';

select cron.schedule(
  'purge-expired',
  '30 2 * * *',
  $$
  select net.http_post(
    url := 'https://rpbprmngkkscnhqqayfq.supabase.co/functions/v1/purge-expired',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
