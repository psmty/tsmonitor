-- V3__add_pingAt_timestampz.sql

-- Migration script to change 'pingat' column from DATE to TIMESTAMPTZ

-- Step 1: Add a new TIMESTAMPTZ column 'pingat_new'
ALTER TABLE sites 
    ADD COLUMN IF NOT EXISTS pingat_new TIMESTAMPTZ;

-- Step 2: Populate 'pingat_new' with 'pingat' values and default time (00:00:00)
UPDATE sites 
SET pingat_new = pingat::TIMESTAMPTZ;  -- This assumes you want to default the time to midnight

-- Step 3: Drop the old 'pingat' column
ALTER TABLE sites 
    DROP COLUMN IF EXISTS pingat;

-- Step 4: Rename the new column to 'pingat'
ALTER TABLE sites 
    RENAME COLUMN pingat_new TO pingat;
