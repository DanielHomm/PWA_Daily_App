-- Migration script for Challenge: 7525d223-4deb-42f4-96da-df6872513822

DO $$
DECLARE
  new_sub_id uuid;
  target_challenge_id uuid := '7525d223-4deb-42f4-96da-df6872513822';
BEGIN
  -- 1. Create the new sub-challenge (if it doesn't exist already)
  -- We use a CTE or check existence to avoid duplicates if you run this twice, 
  -- but roughly we just want to insert and capture the ID.
  
  INSERT INTO sub_challenges (challenge_id, title, frequency)
  VALUES (target_challenge_id, 'Daily Goal', 'daily')
  RETURNING id INTO new_sub_id;

  -- 2. Update existing check-ins for this challenge that don't have a sub_challenge_id yet
  UPDATE challenge_checkins
  SET sub_challenge_id = new_sub_id
  WHERE challenge_id = target_challenge_id
    AND sub_challenge_id IS NULL;

  RAISE NOTICE 'Migrated challenge % to sub-challenge %', target_challenge_id, new_sub_id;
END $$;
