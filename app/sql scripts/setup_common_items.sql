-- 1. Create Common Items Table
create table if not exists common_items (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category_name text not null, -- Store name directly for easier seeding/lookup, or map to ID if strict
  default_unit text default 'units',
  icon text,
  
  created_at timestamp with time zone default now()
);

-- 2. Add Link to Household Products (Nullable)
alter table household_products 
  add column if not exists common_item_id uuid references common_items(id);

-- 3. Enable RLS
alter table common_items enable row level security;

-- 4. Policy: Everyone can read common items
drop policy if exists "Common items are public" on common_items;
create policy "Common items are public" 
  on common_items for select using (true);


-- 5. Seed Data (Upsert based on name if possible, but name isn't unique constraint yet. Let's make it unique for sanity)
alter table common_items add constraint common_items_name_key unique (name);

insert into common_items (name, category_name, default_unit, icon) values
-- Dairy
('Milk', 'Dairy & Cheese', 'l', '🥛'),
('Cheese', 'Dairy & Cheese', 'kg', '🧀'),
('Butter', 'Dairy & Cheese', 'g', '🧈'),
('Yogurt', 'Dairy & Cheese', 'g', '🥣'),
('Cream', 'Dairy & Cheese', 'ml', '🥛'),
('Eggs', 'Dairy & Cheese', 'pcs', '🥚'),

-- Produce
('Bananas', 'Produce', 'kg', '🍌'),
('Apples', 'Produce', 'kg', '🍎'),
('Tomatoes', 'Produce', 'kg', '🍅'),
('Potatoes', 'Produce', 'kg', '🥔'),
('Onions', 'Produce', 'kg', '🧅'),
('Carrots', 'Produce', 'kg', '🥕'),
('Lettuce', 'Produce', 'pcs', '🥬'),
('Cucumber', 'Produce', 'pcs', '🥒'),
('Garlic', 'Produce', 'pcs', '🧄'),
('Avocado', 'Produce', 'pcs', '🥑'),
('Lemon', 'Produce', 'pcs', '🍋'),

-- Meat
('Chicken Breast', 'Meat & Fish', 'kg', '🍗'),
('Ground Beef', 'Meat & Fish', 'kg', '🥩'),
('Salmon', 'Meat & Fish', 'kg', '🐟'),
('Bacon', 'Meat & Fish', 'g', '🥓'),
('Sausages', 'Meat & Fish', 'pcs', '🌭'),

-- Bakery
('Bread', 'Bakery', 'pcs', '🍞'),
('Toast', 'Bakery', 'pcs', '🍞'),
('Croissant', 'Bakery', 'pcs', '🥐'),
('Bagels', 'Bakery', 'pcs', '🥯'),

-- Pantry
('Rice', 'Pantry & Dry Goods', 'kg', '🍚'),
('Pasta', 'Pantry & Dry Goods', 'kg', '🍝'),
('Flour', 'Pantry & Dry Goods', 'kg', '🥡'),
('Sugar', 'Pantry & Dry Goods', 'kg', '🧂'),
('Salt', 'Pantry & Dry Goods', 'g', '🧂'),
('Olive Oil', 'Pantry & Dry Goods', 'l', '🫒'),
('Cereal', 'Pantry & Dry Goods', 'box', '🥣'),
('Tomato Sauce', 'Pantry & Dry Goods', 'jar', '🥫'),
('Coffee', 'Pantry & Dry Goods', 'g', '☕'),
('Tea', 'Pantry & Dry Goods', 'box', '🍵'),

-- Snacks
('Chips', 'Snacks', 'bag', '🍟'),
('Chocolate', 'Snacks', 'g', '🍫'),
('Cookies', 'Snacks', 'pack', '🍪'),
('Nuts', 'Snacks', 'g', '🥜'),

-- Beverages
('Water', 'Beverages', 'l', '💧'),
('Juice', 'Beverages', 'l', '🧃'),
('Soda', 'Beverages', 'can', '🥤'),
('Beer', 'Beverages', 'bottle', '🍺'),
('Wine', 'Beverages', 'bottle', '🍷'),

-- Household
('Toilet Paper', 'Household & Cleaning', 'pack', '🧻'),
('Paper Towels', 'Household & Cleaning', 'roll', '🧻'),
('Dish Soap', 'Household & Cleaning', 'bottle', '🧼'),
('Laundry Detergent', 'Household & Cleaning', 'bottle', '🧺'),
('Trash Bags', 'Household & Cleaning', 'box', '🗑️'),
('Toothpaste', 'Personal Care', 'tube', '🦷'),
('Shampoo', 'Personal Care', 'bottle', '🧴')

on conflict (name) do nothing;
