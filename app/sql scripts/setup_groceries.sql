-- 1. Standardized Grocery Categories (Read-only for users, Seeded)
create table grocery_categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  icon text, -- Emoji or icon name
  sort_order int default 100
);

-- Seed Categories
insert into grocery_categories (name, icon, sort_order) values 
('Produce', '🥬', 10),
('Dairy & Cheese', '🧀', 20),
('Meat & Fish', '🥩', 30),
('Bakery', '🍞', 40),
('Frozen', '🧊', 50),
('Pantry & Dry Goods', '🍝', 60),
('Beverages', '🥤', 70),
('Snacks', '🍿', 80),
('Household & Cleaning', '🧹', 90),
('Personal Care', '🧴', 100),
('Other', '📦', 999)
on conflict (name) do nothing;

-- 2. Households (The core unit of sharing)
create table households (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- 3. Household Members
create table household_members (
  household_id uuid references households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'member' check (role in ('admin', 'member')),
  joined_at timestamp with time zone default now(),
  primary key (household_id, user_id)
);

-- 4. Products (The item definitions owned by a household)
create table household_products (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references households(id) on delete cascade not null,
  category_id uuid references grocery_categories(id), -- Optional, nice to have
  name text not null,
  
  created_at timestamp with time zone default now()
);

-- 5. Inventory Items (Actual items in fridge/freezer)
create table inventory_items (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references households(id) on delete cascade not null,
  product_id uuid references household_products(id) on delete cascade not null,
  
  location text not null check (location in ('fridge', 'freezer', 'pantry', 'other')),
  quantity numeric default 1,
  unit text default 'units', -- e.g. kg, l, units
  expiry_date date,
  
  created_at timestamp with time zone default now()
);

-- 6. Shopping List Items
create table shopping_list_items (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references households(id) on delete cascade not null,
  product_id uuid references household_products(id) on delete cascade not null,
  
  quantity numeric default 1,
  unit text default 'units',
  is_checked boolean default false,
  added_by uuid references auth.users(id),
  
  created_at timestamp with time zone default now()
);

-- 7. ENABLE RLS
alter table grocery_categories enable row level security;
alter table households enable row level security;
alter table household_members enable row level security;
alter table household_products enable row level security;
alter table inventory_items enable row level security;
alter table shopping_list_items enable row level security;

-- 8. POLICIES

-- Categories: Everyone can read
create policy "Categories are public" 
  on grocery_categories for select using (true);

-- Households: Members can view
create policy "Members can view households"
  on households for select
  using (
    id in (select household_id from household_members where user_id = auth.uid())
  );

create policy "Users can create households"
  on households for insert
  with check (created_by = auth.uid());

-- Household Members: Members can view other members
create policy "Members can view household members"
  on household_members for select
  using (
    household_id in (select household_id from household_members where user_id = auth.uid())
  );
  
-- Allow self-insert (joining) if logic permits, or owner-insert. 
-- For now, allow creators to add themselves implicitly via trigger or app logic.
create policy "Admins can add members"
  on household_members for insert
  with check (
    household_id in (
      select household_id from household_members 
      where user_id = auth.uid() and role = 'admin'
    )
    OR
    user_id = auth.uid() -- Allow adding self (useful during creation)
  );

-- Products/Inventory/Shopping List: 
-- Visible/Editable if you are a member of the household
create policy "Access household products"
  on household_products for all
  using (household_id in (select household_id from household_members where user_id = auth.uid()));

create policy "Access household inventory"
  on inventory_items for all
  using (household_id in (select household_id from household_members where user_id = auth.uid()));

create policy "Access shopping list"
  on shopping_list_items for all
  using (household_id in (select household_id from household_members where user_id = auth.uid()));
