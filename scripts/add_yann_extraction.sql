-- Migration : Ajouter la colonne yann_extraction à la table receipts
-- Cette colonne stocke les données extraites par l'API de Yann (Azure OCR + Mindee)

ALTER TABLE receipts 
ADD COLUMN IF NOT EXISTS yann_extraction JSONB;

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN receipts.yann_extraction IS 'Données extraites par l''API FastAPI de Yann (Azure OCR + Mindee)';
