-- Add cook_time_minutes to recipes table
ALTER TABLE recipes 
ADD COLUMN IF NOT EXISTS cook_time_minutes numeric;

-- Comment for clarity
COMMENT ON COLUMN recipes.cook_time_minutes IS 'Time spent actively cooking (minutes)';
COMMENT ON COLUMN recipes.prep_time_minutes IS 'Time spent preparing ingredients (minutes)';
