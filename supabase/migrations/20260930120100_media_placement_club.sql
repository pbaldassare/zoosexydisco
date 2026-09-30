-- «club»: le foto dei tre ambienti nella pagina Il locale.
alter table public.media drop constraint media_placement_check;
alter table public.media add constraint media_placement_check
  check (placement <@ array['gallery', 'home', 'members', 'club']::text[]);
