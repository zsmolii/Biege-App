-- Automatisch users Eintrag erstellen bei Registrierung
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, is_admin, is_active)
  values (
    new.id,
    new.email,
    -- Admin-E-Mail automatisch als Admin markieren
    case when new.email = 'zsmolii@icloud.com' then true else false end,
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_users on auth.users;

create trigger on_auth_user_created_users
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
