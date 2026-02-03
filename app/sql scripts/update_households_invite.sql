-- Add invite_code to households
ALTER TABLE households 
ADD COLUMN IF NOT EXISTS invite_code text UNIQUE;

-- Function to generate random code (or we handle in frontend/backend, but DB default is nice)
-- Simple 6 char alphanumeric
CREATE OR REPLACE FUNCTION generate_invite_code() RETURNS text AS $$
DECLARE
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,U,V,W,X,Y,Z}';
  result text := '';
  i integer := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Backfill existing
UPDATE households SET invite_code = generate_invite_code() WHERE invite_code IS NULL;

-- Make it required now
ALTER TABLE households ALTER COLUMN invite_code SET NOT NULL;

-- RPC Function to Join by Code (Security Definer to bypass RLS for finding the household)
CREATE OR REPLACE FUNCTION join_household_by_code(code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_household_id uuid;
  hh_name text;
BEGIN
  -- Find household
  SELECT id, name INTO target_household_id, hh_name
  FROM households 
  WHERE invite_code = code
  LIMIT 1;

  IF target_household_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  -- Check if already member
  IF EXISTS (SELECT 1 FROM household_members WHERE household_id = target_household_id AND user_id = auth.uid()) THEN
     RAISE EXCEPTION 'Already a member of this household';
  END IF;

  -- Insert member
  INSERT INTO household_members (household_id, user_id, role)
  VALUES (target_household_id, auth.uid(), 'member');

  RETURN json_build_object('id', target_household_id, 'name', hh_name);
END;
$$;
