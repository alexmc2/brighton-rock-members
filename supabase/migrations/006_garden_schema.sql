-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Create update_updated_at_column function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create garden_areas table
create table garden_areas (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    status text not null default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create garden_tasks table
create table garden_tasks (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text not null,
    status text not null default 'pending',
    priority text not null default 'medium',
    area_id uuid references garden_areas(id),
    assigned_to uuid references auth.users(id),
    due_date timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create garden_comments table
create table garden_comments (
    id uuid primary key default uuid_generate_v4(),
    task_id uuid references garden_tasks(id) not null,
    user_id uuid references auth.users(id) not null,
    comment text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create garden_plants table
create table garden_plants (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    type text not null,
    area_id uuid references garden_areas(id),
    planting_date timestamp with time zone,
    notes text,
    status text not null default 'alive',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert initial garden areas
insert into garden_areas (name, description) values
    ('Greenhouse', 'Main greenhouse area for propagation and tender plants'),
    ('Compost', 'Composting area including worm bin'),
    ('Fruit Trees', 'Orchard area with fruit trees'),
    ('Bee Area', 'Dedicated space for beehives'),
    ('Main Garden', 'Main vegetable and flower growing area');

-- Enable RLS
alter table garden_areas enable row level security;
alter table garden_tasks enable row level security;
alter table garden_comments enable row level security;
alter table garden_plants enable row level security;

-- Policies for garden_areas
create policy "Garden areas are viewable by all authenticated users"
    on garden_areas for select
    to authenticated
    using (true);

create policy "Garden areas can be created by authenticated users"
    on garden_areas for insert
    to authenticated
    with check (true);

-- Policies for garden_tasks
create policy "Garden tasks are viewable by all authenticated users"
    on garden_tasks for select
    to authenticated
    using (true);

create policy "Garden tasks can be created by authenticated users"
    on garden_tasks for insert
    to authenticated
    with check (true);

create policy "Garden tasks can be updated by authenticated users"
    on garden_tasks for update
    to authenticated
    using (true);

-- Policies for garden_comments
create policy "Garden comments are viewable by all authenticated users"
    on garden_comments for select
    to authenticated
    using (true);

create policy "Garden comments can be created by authenticated users"
    on garden_comments for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own garden comments"
    on garden_comments for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete their own garden comments"
    on garden_comments for delete
    to authenticated
    using (auth.uid() = user_id);

-- Policies for garden_plants
create policy "Garden plants are viewable by all authenticated users"
    on garden_plants for select
    to authenticated
    using (true);

create policy "Garden plants can be created by authenticated users"
    on garden_plants for insert
    to authenticated
    with check (true);

create policy "Garden plants can be updated by authenticated users"
    on garden_plants for update
    to authenticated
    using (true);

-- Create updated_at triggers
create trigger set_garden_areas_updated_at
    before update on garden_areas
    for each row
    execute function update_updated_at_column();

create trigger set_garden_tasks_updated_at
    before update on garden_tasks
    for each row
    execute function update_updated_at_column();

create trigger set_garden_plants_updated_at
    before update on garden_plants
    for each row
    execute function update_updated_at_column(); 