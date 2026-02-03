-- Add German Name column to Common Items
alter table common_items 
add column if not exists name_de text;

-- Create index for faster search on German names
create index if not exists common_items_name_de_idx on common_items (name_de);
