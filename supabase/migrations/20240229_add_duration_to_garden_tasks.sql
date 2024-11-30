-- Add duration field to garden_tasks
ALTER TABLE garden_tasks
ADD COLUMN IF NOT EXISTS duration TEXT; 