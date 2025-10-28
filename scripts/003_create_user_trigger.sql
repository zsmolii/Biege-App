-- Automatisch app_users Eintrag erstellen bei Registrierung
create or replace function public.handle_new_app_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.app_users (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_app on auth.users;

create trigger on_auth_user_created_app
  after insert on auth.users
  for each row
  execute function public.handle_new_app_user();
