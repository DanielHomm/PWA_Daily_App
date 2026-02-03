-- FIX for Infinite Recursion (500 Error)
-- The previous policy on household_members queried itself indefinitely.
-- We solve this by creating a secure function to fetch my households without triggering the loop.

-- 1. Create a helper function to get my households (Bypasses RLS)
create or replace function get_my_household_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id from household_members where user_id = auth.uid();
$$;

-- 2. Update 'households' policy (safer)
drop policy if exists "Members can view households" on households;

create policy "Members can view households"
  on households for select
  using (
    id in (select get_my_household_ids())
  );

-- 3. Update 'household_members' policy (THE FIX)
drop policy if exists "Members can view household members" on household_members;

create policy "Members can view household members"
  on household_members for select
  using (
    household_id in (select get_my_household_ids())
  );

-- 4. Update other tables to use the safe function too (Optimization)
drop policy if exists "Access household products" on household_products;
create policy "Access household products"
  on household_products for all
  using (household_id in (select get_my_household_ids()));

drop policy if exists "Access household inventory" on inventory_items;
create policy "Access household inventory"
  on inventory_items for all
  using (household_id in (select get_my_household_ids()));

drop policy if exists "Access shopping list" on shopping_list_items;
create policy "Access shopping list"
  on shopping_list_items for all
  using (household_id in (select get_my_household_ids()));
