-- Remove stock management columns from Supabase database
-- These columns should not exist in the information center model

-- Check if columns exist first
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'materials' 
AND table_schema = 'public'
AND column_name IN ('original_qty', 'threshold_qty');

-- Remove original_qty column if it exists
ALTER TABLE materials DROP COLUMN IF EXISTS original_qty;

-- Remove threshold_qty column if it exists  
ALTER TABLE materials DROP COLUMN IF EXISTS threshold_qty;

-- Verify columns are removed
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'materials' 
AND table_schema = 'public'
ORDER BY ordinal_position;
