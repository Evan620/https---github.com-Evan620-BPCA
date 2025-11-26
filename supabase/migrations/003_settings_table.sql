-- Create settings table for user configurations
create table if not exists public.settings (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    n8n_webhook_url text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    unique(user_id)
);

-- Enable R
alter table public.settings enable row level security;

-- Policies
create policy "Users can view their own settings"
on public.settings for select
to authenticated
using ( auth.uid() = user_id );

create policy "Users can insert their own settings"
on public.settings for insert
to authenticated
with check ( auth.uid() = user_id );

create policy "Users can update their own settings"
on public.settings for update
to authenticated
using ( auth.uid() = user_id );

-- Trigger for updated_at
create trigger settings_updated_at
before update on public.settings
for each row
execute function update_updated_at_column();
