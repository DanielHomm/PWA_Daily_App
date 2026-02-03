-- Meal Planner Schema

-- 1. Meal Plans Table
create table if not exists meal_plans (
  id uuid default gen_random_uuid() primary key,
  household_id uuid references households(id) on delete cascade not null,
  
  -- When?
  date date not null,
  meal_type text not null check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')),
  
  -- What? (Link to Recipe OR Custom Text)
  recipe_id uuid references recipes(id) on delete set null,
  custom_text text,
  
  -- Details
  servings numeric default 2,
  is_cooked boolean default false, -- Track if done?
  
  created_by uuid references auth.users(id),
  created_at timestamp with time zone default now()
);

-- 2. RLS Policies

alter table meal_plans enable row level security;

-- Household members can view/manage
create policy "Meal plans accessible to household members"
  on meal_plans for all
  using (
    exists (
      select 1 from household_members
      where household_members.household_id = meal_plans.household_id
      and household_members.user_id = auth.uid()
    )
  );
