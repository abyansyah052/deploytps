-- TPS Dashboard - Supabase Database Schema
-- Run this script in Supabase SQL Editor

-- Drop table if exists (for fresh start)
DROP TABLE IF EXISTS materials CASCADE;

-- Create materials table (updated schema without stock fields)
CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    jenisnya VARCHAR(50),
    material_sap VARCHAR(100),
    material_description TEXT,
    base_unit_of_measure VARCHAR(20),
    status VARCHAR(50),
    lokasi_sistem VARCHAR(255),
    lokasi_fisik VARCHAR(255),
    storeroom VARCHAR(100),
    penempatan_pada_alat TEXT,
    deskripsi_penempatan TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_jenisnya ON materials(jenisnya);
CREATE INDEX IF NOT EXISTS idx_materials_material_sap ON materials(material_sap);
CREATE INDEX IF NOT EXISTS idx_materials_status ON materials(status);
CREATE INDEX IF NOT EXISTS idx_materials_storeroom ON materials(storeroom);
CREATE INDEX IF NOT EXISTS idx_materials_created_at ON materials(created_at);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_materials_updated_at ON materials;
CREATE TRIGGER update_materials_updated_at 
    BEFORE UPDATE ON materials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for Supabase
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can customize this later)
CREATE POLICY "Allow all access to materials" ON materials
    FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON materials TO postgres, anon, authenticated, service_role;
GRANT USAGE ON SEQUENCE materials_id_seq TO postgres, anon, authenticated, service_role;

-- Verify table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'materials' 
ORDER BY ordinal_position;
