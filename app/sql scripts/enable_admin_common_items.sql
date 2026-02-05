-- Helper to check if user is a global admin based on profiles table
create or replace function is_app_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
$$;

-- Allow admins to insert into common_items
create policy "Admins can insert common items"
  on common_items
  for insert
  with check (is_app_admin());

-- Allow admins to update common_items
create policy "Admins can update common items"
  on common_items
  for update
  using (is_app_admin());
