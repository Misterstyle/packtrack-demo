-- Create shipments table for PackTrack
create table if not exists public.shipments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_name text not null,
  image text not null default '/images/product-1.jpg',
  status text not null default 'processing',
  direction text not null default 'incoming',
  carrier text not null,
  tracking_code text not null,
  last_update text not null default 'Zojuist',
  pickup_location jsonb,
  receipt_image text,
  packaging_photo text,
  packing_note text,
  shipping_deadline text,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.shipments enable row level security;

-- RLS Policies: users can only access their own shipments
create policy "Users can view own shipments"
  on public.shipments for select
  using (auth.uid() = user_id);

create policy "Users can insert own shipments"
  on public.shipments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own shipments"
  on public.shipments for update
  using (auth.uid() = user_id);

create policy "Users can delete own shipments"
  on public.shipments for delete
  using (auth.uid() = user_id);

-- Index for fast user-specific queries
create index if not exists idx_shipments_user_id on public.shipments(user_id);
create index if not exists idx_shipments_user_archived on public.shipments(user_id, is_archived);
