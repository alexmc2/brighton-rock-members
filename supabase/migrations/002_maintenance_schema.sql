-- Create enum for maintenance request status
create type maintenance_status as enum ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled');

-- Create enum for maintenance priority
create type maintenance_priority as enum ('low', 'medium', 'high', 'urgent');

-- Create maintenance requests table
create table maintenance_requests (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text not null,
    status maintenance_status not null default 'pending',
    priority maintenance_priority not null default 'medium',
    house_id uuid references houses(id) not null,
    reported_by uuid references auth.users(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create maintenance visits table
create table maintenance_visits (
    id uuid primary key default uuid_generate_v4(),
    request_id uuid references maintenance_requests(id) not null,
    scheduled_date timestamp with time zone not null,
    estimated_duration interval not null default interval '1 hour',
    access_person_id uuid references auth.users(id),
    notes text,
    completed_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create maintenance comments table for tracking communication
create table maintenance_comments (
    id uuid primary key default uuid_generate_v4(),
    request_id uuid references maintenance_requests(id) not null,
    user_id uuid references auth.users(id) not null,
    comment text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table maintenance_requests enable row level security;
alter table maintenance_visits enable row level security;
alter table maintenance_comments enable row level security;

-- Policies for maintenance_requests
create policy "Maintenance requests are viewable by all authenticated users"
    on maintenance_requests for select
    to authenticated
    using (true);

create policy "Maintenance requests can be created by any authenticated user"
    on maintenance_requests for insert
    to authenticated
    with check (auth.uid() = reported_by);

create policy "Maintenance requests can be updated by maintenance officers"
    on maintenance_requests for update
    to authenticated
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'maintenance_officer'
        )
    );

-- Policies for maintenance_visits
create policy "Maintenance visits are viewable by all authenticated users"
    on maintenance_visits for select
    to authenticated
    using (true);

create policy "Maintenance visits can be managed by maintenance officers"
    on maintenance_visits for all
    to authenticated
    using (
        exists (
            select 1 from user_roles
            where user_id = auth.uid()
            and role = 'maintenance_officer'
        )
    );

-- Policies for maintenance_comments
create policy "Maintenance comments are viewable by all authenticated users"
    on maintenance_comments for select
    to authenticated
    using (true);

create policy "Maintenance comments can be created by any authenticated user"
    on maintenance_comments for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Create functions to update timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updating timestamps
create trigger update_maintenance_requests_updated_at
    before update on maintenance_requests
    for each row
    execute function update_updated_at_column();

create trigger update_maintenance_visits_updated_at
    before update on maintenance_visits
    for each row
    execute function update_updated_at_column(); 