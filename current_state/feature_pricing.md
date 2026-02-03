# Pricing Feature Snapshot
Date: 2026-02-03
Description: Current state of the Community Pricing implementation (Schema, API, UI).

---

## SQL Schema (setup_pricing.sql)
```sql
-- Community Pricing Schema

-- 1. Global Chains (Seeded)
create table if not exists supermarket_chains (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  icon text, -- URL or emoji
  created_at timestamp with time zone default now()
);

-- Seed Chains (German/European focus)
insert into supermarket_chains (name, icon) values
('Aldi', '🔵'),
('Lidl', '🟡'),
('Edeka', '💛'),
('Rewe', '🔴'),
('Kaufland', '🔴'),
('Penny', '🔴'),
('Netto', '⚫'),
('DM', '�'),
('Rossmann', '�'),
('Alnatura', '🌿'),
('Globus', '🌍'),
('Metro', '�'),
('Tegut', '🌱')
on conflict (name) do nothing;

-- 2. Stores (The physical locations)
create table if not exists supermarket_stores (
  id uuid default gen_random_uuid() primary key,
  chain_id uuid references supermarket_chains(id), -- Nullable for Independent stores
  name text not null, -- e.g. "Main St" or "Joe's Market"
  
  -- Location (Simple for now, maybe PostGIS later if requested)
  address text,
  city text,
  
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- 3. Price Reports (Crowdsourced)
create table if not exists product_prices (
  id uuid default gen_random_uuid() primary key,
  
  -- The Item being priced
  common_item_id uuid references common_items(id) not null,
  
  -- The Location
  store_id uuid references supermarket_stores(id) not null,
  
  -- The Price
  price numeric not null check (price > 0),
  
  -- Metadata
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- 4. RLS Policies

-- Chains: Public Read
alter table supermarket_chains enable row level security;
create policy "Chains are public" on supermarket_chains for select using (true);

-- Stores: Public Read, Auth Create
alter table supermarket_stores enable row level security;
create policy "Stores are public" on supermarket_stores for select using (true);
create policy "Auth can add stores" on supermarket_stores for insert with check (auth.role() = 'authenticated');

-- Prices: Public Read, Auth Create
alter table product_prices enable row level security;
create policy "Prices are public" on product_prices for select using (true);
create policy "Auth can report prices" on product_prices for insert with check (auth.role() = 'authenticated');

-- 5. Helper Function: Get Average Price for a Chain
-- Returns the average price of an item across all stores of a specific chain
-- Only looks at prices reported in the last 30 days.
create or replace function get_chain_average_price(p_chain_id uuid, p_item_id uuid)
returns numeric
language sql
stable
as $$
  select round(avg(price), 2)
  from product_prices
  join supermarket_stores on product_prices.store_id = supermarket_stores.id
  where supermarket_stores.chain_id = p_chain_id
  and product_prices.common_item_id = p_item_id
  and product_prices.created_at > (now() - interval '30 days');
$$;
```

