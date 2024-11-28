-- Drop existing comment policies
drop policy if exists "Maintenance comments are viewable by all authenticated users" on maintenance_comments;
drop policy if exists "Maintenance comments can be created by any authenticated user" on maintenance_comments;

-- Create new policies
create policy "Maintenance comments are viewable by all authenticated users"
    on maintenance_comments for select
    to authenticated
    using (true);

create policy "Maintenance comments can be created by authenticated users"
    on maintenance_comments for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Users can update their own comments"
    on maintenance_comments for update
    to authenticated
    using (auth.uid() = user_id);

create policy "Users can delete their own comments"
    on maintenance_comments for delete
    to authenticated
    using (auth.uid() = user_id); 