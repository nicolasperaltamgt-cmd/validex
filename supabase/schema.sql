-- Esquema para guardar productos de forma permanente, por usuario.
-- Cómo usarlo (cuando crees tu proyecto en Supabase): SQL Editor > New query > pegar todo > Run.
-- Cada persona solo puede ver y modificar SUS propios guardados (seguridad por filas, RLS).

create table if not exists public.saved_products (
  user_id    uuid not null references auth.users (id) on delete cascade,
  product_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.saved_products enable row level security;

create policy "ver mis guardados"
  on public.saved_products for select
  using (auth.uid() = user_id);

create policy "guardar para mí"
  on public.saved_products for insert
  with check (auth.uid() = user_id);

create policy "quitar mis guardados"
  on public.saved_products for delete
  using (auth.uid() = user_id);
