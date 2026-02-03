-- RLS FIX V2: Comprehensive Policy Reset
-- We will drop all policies on Groceries tables and re-apply them using the safe function.

-- 1. Helper Function (Ensure it is securely defined)
create or replace function get_my_household_ids()
returns setof uuid
language sql
security definer -- <--- CRITICAL: Bypasses RLS
set search_path = public -- <--- CRITICAL: Prevents search_path hijacking
stable
as $$
  select household_id from household_members where user_id = auth.uid();
$$;

-- 2. RESET Households Policies
drop policy if exists "Members can view households" on households;
drop policy if exists "Users can create households" on households;
-- (Drop any others that might exist)

create policy "Households Select"
  on households for select
  using (
    id in (select get_my_household_ids()) 
    OR 
    created_by = auth.uid()
  );

create policy "Households Insert"
  on households for insert
  with check (created_by = auth.uid());

create policy "Households Update"
  on households for update
  using (
    id in (select get_my_household_ids())
    -- Add admin check logic here later if needed, generally members don't update household name?
    -- For now allow members to update (shared ownership) or stricter:
    -- id in (select household_id from household_members where user_id = auth.uid() and role = 'admin')
  );

-- 3. RESET Household Members Policies
drop policy if exists "Members can view household members" on household_members;
drop policy if exists "Admins can add members" on household_members;

-- SELECT: Use the secure function to check 'household_id' membership
-- We allow seeing ALL members of a household we belong to.
create policy "Members Select"
  on household_members for select
  using (
    household_id in (select get_my_household_ids())
  );

-- INSERT: 
-- Case A: Self-join (User joining via invite code - future) -> allow self
-- Case B: Admin adding someone -> check admin status securely
create policy "Members Insert"
  on household_members for insert
  with check (
    user_id = auth.uid() -- Allow adding self (Critical for initial setup)
    OR
    household_id in (
      -- Check if I am an admin of this household (Secure lookup)
      select household_id from household_members 
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- 4. RESET Product/Inventory Policies
drop policy if exists "Access household products" on household_products;
create policy "Products Policy"
  on household_products for all
  using (household_id in (select get_my_household_ids()));

drop policy if exists "Access household inventory" on inventory_items;
create policy "Inventory Policy"
  on inventory_items for all
  using (household_id in (select get_my_household_ids()));

drop policy if exists "Access shopping list" on shopping_list_items;
create policy "Shopping List Policy"
  on shopping_list_items for all
  using (household_id in (select get_my_household_ids()));
