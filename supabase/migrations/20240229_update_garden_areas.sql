-- Add display_order column if it doesn't exist
ALTER TABLE garden_areas 
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Update existing garden areas
UPDATE garden_areas 
SET 
    name = CASE 
        WHEN name = 'Main Garden' THEN 'Main Garden'
        WHEN name = 'Bee Area' THEN 'Bees'
        WHEN name = 'Greenhouse' THEN 'Greenhouse'
        WHEN name = 'Compost' THEN 'Compost'
    END,
    description = CASE 
        WHEN name = 'Main Garden' THEN 'Main vegetable and flower growing area'
        WHEN name = 'Bee Area' THEN 'Dedicated space for beehives'
        WHEN name = 'Greenhouse' THEN 'Main greenhouse area for propagation and tender plants'
        WHEN name = 'Compost' THEN 'Composting area including worm bin'
    END,
    display_order = CASE 
        WHEN name = 'Main Garden' THEN 1
        WHEN name = 'Bee Area' THEN 2
        WHEN name = 'Greenhouse' THEN 3
        WHEN name = 'Compost' THEN 4
    END;