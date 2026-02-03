-- Recreate challenge_checkins Table

-- 1. Create Table with core columns
create table if not exists challenge_checkins (
  id uuid default gen_random_uuid() primary key,
  transaction_date timestamp with time zone default now(),
  
  -- Foreign Keys
  challenge_id uuid references challenges(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  sub_challenge_id uuid references sub_challenges(id) on delete cascade, -- Can be null for legacy, but usually set
  
  -- The check-in date (yyyy-mm-dd)
  date date not null
);

-- 2. Add Unique Constraint
-- Prevents duplicate check-ins for the same task on the same day
alter table challenge_checkins
  drop constraint if exists checkins_unique_sub_challenge;

alter table challenge_checkins
  add constraint checkins_unique_sub_challenge 
  unique (user_id, date, sub_challenge_id);


-- 3. Enable RLS
alter table challenge_checkins enable row level security;

-- 4. RLS Policies

-- SELECT: Visible to all members of the challenge
create policy "Members can view checkins"
  on challenge_checkins for select
  using (
    -- User is In the members list for this challenge
    auth.uid() in (
      select user_id from challenge_members 
      where challenge_id = challenge_checkins.challenge_id
    )
    OR
    -- OR user is the Creator of the challenge (sometimes creators aren't in members list explicitly)
    auth.uid() in (
      select created_by from challenges 
      where id = challenge_checkins.challenge_id
    )
  );

-- INSERT: Users can only check in for themselves
create policy "Users can insert their own checkins"
  on challenge_checkins for insert
  with check (
    auth.uid() = user_id
  );

-- UPDATE: Users can update their own checkins
create policy "Users can update their own checkins"
  on challenge_checkins for update
  using (auth.uid() = user_id);

-- DELETE: Users can delete their own checkins
create policy "Users can delete their own checkins"
  on challenge_checkins for delete
  using (auth.uid() = user_id);
