-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS materials CASCADE;

CREATE TABLE materials (
    id SERIAL PRIMARY KEY,
    jenisnya VARCHAR(50), -- Division (ME, CC, RTG, Lain)
    material_sap VARCHAR(100), -- Material SAP code
    material_description TEXT, -- Material Description Maximo
    base_unit_of_measure VARCHAR(20), -- Base Unit of Measure
    status VARCHAR(50), -- Status (ACTIVE, No Status)
    lokasi_sistem VARCHAR(255), -- Lokasi Sistem
    lokasi_fisik VARCHAR(255), -- Lokasi Fisik  
    storeroom VARCHAR(100), -- StoreRoom
    penempatan_pada_alat TEXT, -- Penempatan pada Alat
    deskripsi_penempatan TEXT, -- Deskripsi Penempatan
    
    -- Additional fields for compatibility and features
    original_qty INTEGER DEFAULT 0,
    threshold_qty INTEGER DEFAULT 10,
    image_url TEXT, -- Preserve image from link feature
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_materials_jenisnya ON materials(jenisnya);
CREATE INDEX idx_materials_status ON materials(status);
CREATE INDEX idx_materials_material_sap ON materials(material_sap);
CREATE INDEX idx_materials_storeroom ON materials(storeroom);
