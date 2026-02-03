-- RLS FIX FINAL: Breakdown of Security Functions
-- The goal is to avoid ANY table lookup inside a policy that could trigger another policy.

-- 1. Get My IDs (Simple)
create or replace function get_my_household_ids()
returns setof uuid
language sql
security definer
set search_path = public
stable
as $$
  select household_id from household_members where user_id = auth.uid();
$$;

-- 2. Am I Admin? (Specific Helper)
-- Returns true if the current user is an admin of the given household_id
create or replace function is_household_admin(lookup_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from household_members 
    where household_id = lookup_household_id 
    and user_id = auth.uid() 
    and role = 'admin'
  );
$$;

-- 3. RESET POLICIES (Drop everything to be safe)
drop policy if exists "Members can view households" on households;
drop policy if exists "Households Select" on households;
drop policy if exists "Users can create households" on households;
drop policy if exists "Households Insert" on households;
drop policy if exists "Households Update" on households;

drop policy if exists "Members can view household members" on household_members;
drop policy if exists "Members Select" on household_members;
drop policy if exists "Admins can add members" on household_members;
drop policy if exists "Members Insert" on household_members;


-- 4. APPLY CLEAN POLICIES

-- HOUSEHOLDS
create policy "Select Households" on households for select
  using (
    id in (select get_my_household_ids()) 
    OR 
    created_by = auth.uid()
  );

create policy "Insert Households" on households for insert
  with check (created_by = auth.uid());

create policy "Update Households" on households for update
  using (id in (select get_my_household_ids()));


-- HOUSEHOLD MEMBERS (The Problematic One)
create policy "Select Members" on household_members for select
  using (
    household_id in (select get_my_household_ids())
  );

-- Insert Policy: 
-- Uses is_household_admin() which is SECURITY DEFINER.
-- This prevents the "Insert Policy -> Subquery -> Select Policy" loop.
create policy "Insert Members" on household_members for insert
  with check (
    -- Allow adding self (Common case)
    user_id = auth.uid()
    OR
    -- Allow admin to add others (using secure function)
    is_household_admin(household_id)
  );

-- Update Policy
create policy "Update Members" on household_members for update
  using (is_household_admin(household_id));

-- Delete Policy
create policy "Delete Members" on household_members for delete
  using (
    user_id = auth.uid() -- Leave
    OR
    is_household_admin(household_id) -- Remove others
  );
