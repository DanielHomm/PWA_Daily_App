-- 1. Create sub_challenges table
create table sub_challenges (
  id uuid default gen_random_uuid() primary key,
  challenge_id uuid references challenges(id) on delete cascade not null,
  title text not null,
  frequency text not null check (frequency in ('daily', 'every_other_day', 'weekly', 'monthly')),
  created_at timestamp with time zone default now()
);

-- 2. Add sub_challenge_id to challenge_checkins
alter table challenge_checkins 
add column sub_challenge_id uuid references sub_challenges(id) on delete cascade;

-- 3. Update constraint to allow multiple check-ins per day (one per sub-challenge)
-- Note: You might need to drop the existing constraint first. 
-- Assuming existing constraint is named 'challenge_checkins_user_id_challenge_id_date_key' or similar.
-- This SQL attempts to be safe but you may need to check your exact constraint name.

-- Drop old unique constraint if it enforced one checkin per challenge per day
-- alter table challenge_checkins drop constraint if exists challenge_checkins_user_id_challenge_id_date_key;

-- Add new unique constraint
alter table challenge_checkins
add constraint checkins_unique_sub_challenge 
unique (user_id, date, sub_challenge_id);
