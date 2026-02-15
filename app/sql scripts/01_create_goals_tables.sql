-- Create goals table
create table if not exists goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  target_value numeric not null,
  target_unit text not null,
  frequency text default 'daily',
  type text check (type in ('numeric', 'time')),
  created_at timestamp with time zone default now()
);

-- Create goal_logs table
create table if not exists goal_logs (
  id uuid default gen_random_uuid() primary key,
  goal_id uuid references goals(id) on delete cascade not null,
  user_id uuid references auth.users not null,
  log_date date default current_date not null,
  value numeric not null,
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table goals enable row level security;
alter table goal_logs enable row level security;

-- Policies for goals
create policy "Admins can view all goals"
  on goals for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

create policy "Admins can insert goals"
  on goals for insert
  with check (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

create policy "Admins can update goals"
  on goals for update
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

create policy "Admins can delete goals"
  on goals for delete
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

-- Policies for goal_logs
create policy "Admins can view all goal_logs"
  on goal_logs for select
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

create policy "Admins can insert goal_logs"
  on goal_logs for insert
  with check (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

create policy "Admins can update goal_logs"
  on goal_logs for update
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );

create policy "Admins can delete goal_logs"
  on goal_logs for delete
  using (
    auth.uid() in (
      select id from profiles where role = 'admin'
    )
  );
