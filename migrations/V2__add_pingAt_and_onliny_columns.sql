-- V2__add_pingAt_and_onliny_columns.sql

ALTER TABLE sites 
    ADD COLUMN IF NOT EXISTS pingAt DATE,
    ADD COLUMN IF NOT EXISTS online BOOLEAN;