-- is_admin() serve solo alle policy "to authenticated": anon non deve poterla chiamare.
-- is_member() resta eseguibile da anon perché la valutano le policy di lettura pubblica;
-- restituisce solo lo stato dell'utente corrente (false per anon), nessun dato di altri.
revoke execute on function public.is_admin() from anon;
