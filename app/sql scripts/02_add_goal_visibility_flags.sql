-- Add visibility flags to goals table
ALTER TABLE goals 
ADD COLUMN IF NOT EXISTS show_daily_sum boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_weekly_sum boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS show_monthly_sum boolean DEFAULT false;
