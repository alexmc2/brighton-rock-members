-- Drop existing foreign key if it exists
ALTER TABLE IF EXISTS garden_comments
DROP CONSTRAINT IF EXISTS garden_comments_task_id_fkey;

-- Add foreign key with cascade delete
ALTER TABLE garden_comments
ADD CONSTRAINT garden_comments_task_id_fkey
FOREIGN KEY (task_id)
REFERENCES garden_tasks(id)
ON DELETE CASCADE; 