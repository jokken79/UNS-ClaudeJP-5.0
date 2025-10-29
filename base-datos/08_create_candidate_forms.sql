-- Migration: Ensure candidate extended columns and create candidate_forms table
-- Description: Adds storage for raw rirekisho forms and photo data URLs

DO $$
BEGIN
    RAISE NOTICE 'Verificando columnas adicionales en candidates...';
END $$;

ALTER TABLE candidates ADD COLUMN IF NOT EXISTS applicant_id VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS lunch_preference VARCHAR(50);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS glasses VARCHAR(100);
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS ocr_notes TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS photo_data_url TEXT;

CREATE INDEX IF NOT EXISTS idx_candidates_applicant_id ON candidates(applicant_id);

DO $$
BEGIN
    RAISE NOTICE 'Creando tabla candidate_forms (si no existe)...';
END $$;

CREATE TABLE IF NOT EXISTS candidate_forms (
    id SERIAL PRIMARY KEY,
    candidate_id INTEGER REFERENCES candidates(id) ON DELETE SET NULL,
    rirekisho_id VARCHAR(20),
    applicant_id VARCHAR(50),
    form_data JSONB NOT NULL,
    photo_data_url TEXT,
    azure_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_candidate_forms_candidate_id ON candidate_forms(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_forms_applicant_id ON candidate_forms(applicant_id);
CREATE INDEX IF NOT EXISTS idx_candidate_forms_rirekisho_id ON candidate_forms(rirekisho_id);

COMMENT ON TABLE candidate_forms IS 'Snapshots completos de formularios Rirekisho enviados desde el frontend';
COMMENT ON COLUMN candidate_forms.form_data IS 'Datos completos del formulario en formato JSON';
COMMENT ON COLUMN candidate_forms.photo_data_url IS 'Imagen de la fotografía enviada (Base64 Data URL)';
COMMENT ON COLUMN candidate_forms.azure_metadata IS 'Metadatos y respuestas de OCR/Azure relacionadas';

DO $$
BEGIN
    RAISE NOTICE '✓ Migración candidate_forms completada';
END $$;
