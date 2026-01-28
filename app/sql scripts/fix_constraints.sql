-- Drop legacy constraint that enforces one check-in per challenge per day
-- We need to find the name of the constraint first, but often it's auto-generated.
-- This script explicitly drops the constraint 'challenge_checkins_challenge_id_user_id_date_key' if it exists.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenge_checkins_challenge_id_user_id_date_key') THEN
    ALTER TABLE challenge_checkins DROP CONSTRAINT challenge_checkins_challenge_id_user_id_date_key;
    RAISE NOTICE 'Dropped legacy constraint challenge_checkins_challenge_id_user_id_date_key';
  END IF;
  
  -- Also attempt to drop other common naming patterns just in case
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'challenge_checkins_user_id_challenge_id_date_key') THEN
     ALTER TABLE challenge_checkins DROP CONSTRAINT challenge_checkins_user_id_challenge_id_date_key;
     RAISE NOTICE 'Dropped legacy constraint challenge_checkins_user_id_challenge_id_date_key';
  END IF;
END $$;
