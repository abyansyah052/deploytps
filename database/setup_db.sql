-- Create database for TPS Dashboard
CREATE DATABASE tps_dashboard;

-- Connect to the database
\c tps_dashboard;

-- Create user with password
CREATE USER tps_user WITH PASSWORD 'Abyansyah123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE tps_dashboard TO tps_user;

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
    id SERIAL PRIMARY KEY,
    divisi VARCHAR(50) NOT NULL,
    material_sap VARCHAR(100) UNIQUE NOT NULL,
    material_description TEXT NOT NULL,
    jenis VARCHAR(100),
    original_qty INTEGER DEFAULT 0,
    qty INTEGER DEFAULT 0,
    satuan VARCHAR(50),
    lokasi VARCHAR(200),
    penempatan_alat VARCHAR(200),
    kategori VARCHAR(100),
    photo VARCHAR(255),
    status_alat VARCHAR(50),
    status_data VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_materials_divisi ON materials(divisi);
CREATE INDEX IF NOT EXISTS idx_materials_status_alat ON materials(status_alat);
CREATE INDEX IF NOT EXISTS idx_materials_penempatan_alat ON materials(penempatan_alat);
CREATE INDEX IF NOT EXISTS idx_materials_material_sap ON materials(material_sap);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_materials_updated_at 
    BEFORE UPDATE ON materials 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Grant privileges on table to user
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tps_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tps_user;
