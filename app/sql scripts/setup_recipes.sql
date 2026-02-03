-- Recipes Module Schema

-- 1. Recipes Table
create table if not exists recipes (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references households(id) not null,
  name text not null,
  description text, -- Instructions or notes
  default_servings numeric default 2,
  prep_time_minutes numeric,
  
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- 2. Recipe Ingredients Table
create table if not exists recipe_ingredients (
  id uuid default gen_random_uuid() primary key,
  recipe_id uuid references recipes(id) on delete cascade not null,
  
  -- Link to common item (Preferred)
  common_item_id uuid references common_items(id),
  
  -- Fallback name if not a common item
  name text,
  
  -- Quantity per DEFAULT servings (e.g. for 2 people)
  quantity numeric not null,
  unit text not null,
  
  constraint chk_name_or_common check (name is not null or common_item_id is not null)
);

-- 3. RLS Policies

-- Enable RLS
alter table recipes enable row level security;
alter table recipe_ingredients enable row level security;

-- Recipes: Household members can view/manage
create policy "Recipes accessible to household members"
  on recipes for all
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = recipes.household_id
      and household_members.user_id = auth.uid()
    )
  );

-- Ingredients: Accessible via Recipe -> Household
create policy "Ingredients accessible via recipe"
  on recipe_ingredients for all
  using (
    exists (
      select 1 from recipes
      join household_members on household_members.household_id = recipes.household_id
      where recipes.id = recipe_ingredients.recipe_id
      and household_members.user_id = auth.uid()
    )
  );
