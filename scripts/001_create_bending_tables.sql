-- Tabelle für Benutzer der Biege-App
create table if not exists public.app_users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamp with time zone default now()
);

alter table public.app_users enable row level security;

create policy "app_users_select_all"
  on public.app_users for select
  using (true);

create policy "app_users_insert_own"
  on public.app_users for insert
  with check (auth.uid() = id);

-- Tabelle für Werkzeuge (V-Öffnungen, Radien, Materialien)
create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  tool_type text not null check (tool_type in ('v_opening', 'radius', 'material')),
  value text not null,
  created_at timestamp with time zone default now(),
  unique(tool_type, value)
);

alter table public.tools enable row level security;

create policy "tools_select_all"
  on public.tools for select
  using (true);

create policy "tools_insert_authenticated"
  on public.tools for insert
  with check (auth.uid() is not null);

create policy "tools_delete_authenticated"
  on public.tools for delete
  using (auth.uid() is not null);

-- Tabelle für Biege-Rezepte
create table if not exists public.bending_recipes (
  id uuid primary key default gen_random_uuid(),
  material text not null,
  thickness numeric not null,
  radius text not null,
  target_angle numeric not null,
  inner_length numeric not null,
  with_protection_plate boolean not null,
  v_opening text not null,
  ground_setting numeric not null,
  press_distance numeric not null,
  length_allowance numeric not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id) on delete set null
);

alter table public.bending_recipes enable row level security;

create policy "recipes_select_all"
  on public.bending_recipes for select
  using (true);

create policy "recipes_insert_authenticated"
  on public.bending_recipes for insert
  with check (auth.uid() is not null);

create policy "recipes_update_authenticated"
  on public.bending_recipes for update
  using (auth.uid() is not null);

-- Tabelle für analysierte Zeichnungen
create table if not exists public.drawings (
  id uuid primary key default gen_random_uuid(),
  image_data text not null,
  material text,
  thickness numeric,
  created_at timestamp with time zone default now(),
  created_by uuid references auth.users(id) on delete cascade
);

alter table public.drawings enable row level security;

create policy "drawings_select_all"
  on public.drawings for select
  using (true);

create policy "drawings_insert_own"
  on public.drawings for insert
  with check (auth.uid() = created_by);

create policy "drawings_delete_own"
  on public.drawings for delete
  using (auth.uid() = created_by);

-- Tabelle für Biegungen in Zeichnungen
create table if not exists public.drawing_bends (
  id uuid primary key default gen_random_uuid(),
  drawing_id uuid references public.drawings(id) on delete cascade,
  bend_sequence integer not null,
  inner_length numeric not null,
  angle numeric not null,
  radius text not null,
  marking_point numeric,
  v_opening text,
  ground_setting numeric,
  press_distance numeric,
  created_at timestamp with time zone default now()
);

alter table public.drawing_bends enable row level security;

create policy "drawing_bends_select_all"
  on public.drawing_bends for select
  using (true);

create policy "drawing_bends_insert_authenticated"
  on public.drawing_bends for insert
  with check (auth.uid() is not null);

create policy "drawing_bends_update_authenticated"
  on public.drawing_bends for update
  using (auth.uid() is not null);

-- Tabelle für gelernte Zugaben
create table if not exists public.learned_allowances (
  id uuid primary key default gen_random_uuid(),
  material text not null,
  thickness numeric not null,
  radius text not null,
  angle numeric not null,
  allowance numeric not null,
  usage_count integer default 1,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(material, thickness, radius, angle)
);

alter table public.learned_allowances enable row level security;

create policy "allowances_select_all"
  on public.learned_allowances for select
  using (true);

create policy "allowances_insert_authenticated"
  on public.learned_allowances for insert
  with check (auth.uid() is not null);

create policy "allowances_update_authenticated"
  on public.learned_allowances for update
  using (auth.uid() is not null);
