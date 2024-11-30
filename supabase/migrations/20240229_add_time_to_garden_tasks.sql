-- Add time field to garden_tasks
ALTER TABLE garden_tasks
ADD COLUMN scheduled_time TIME; 