-- FIX for Household Creation 403
-- Problem: When creating a household, you are not yet a member.
-- The current SELECT policy only checks membership.
-- So you insert successfully, but cannot 'select' the returned row, causing an error.

-- 1. Update 'households' SELECT policy to also allow the Creator to see it.
drop policy if exists "Members can view households" on households;

create policy "Members can view households"
  on households for select
  using (
    id in (select get_my_household_ids())
    OR
    created_by = auth.uid() -- The FIX: Creators can always see what they created
  );
