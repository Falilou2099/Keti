-- Migration: Créer la table receipt_items et migrer les données existantes
-- Date: 2026-01-29

-- Étape 1: Créer la nouvelle table receipt_items
CREATE TABLE IF NOT EXISTS receipt_items (
  id SERIAL PRIMARY KEY,
  receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2),
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Étape 2: Créer un index pour optimiser les jointures
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);

-- Étape 3: Migrer les données existantes (si la colonne items existe)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'receipts' AND column_name = 'items'
  ) THEN
    -- Migrer les articles depuis le JSON vers la nouvelle table
    INSERT INTO receipt_items (receipt_id, name, quantity, unit_price, total_price)
    SELECT 
      r.id,
      COALESCE(item->>'name', item->>'description', 'Article sans nom'),
      CASE 
        WHEN item->>'quantity' ~ '^[0-9]+\.?[0-9]*$' 
        THEN (item->>'quantity')::decimal 
        ELSE NULL 
      END,
      CASE 
        WHEN item->>'price' ~ '^[0-9]+\.?[0-9]*$' 
        THEN (item->>'price')::decimal 
        ELSE NULL 
      END,
      CASE 
        WHEN item->>'total' ~ '^[0-9]+\.?[0-9]*$' 
        THEN (item->>'total')::decimal 
        ELSE NULL 
      END
    FROM receipts r,
    LATERAL json_array_elements(r.items::json) as item
    WHERE r.items IS NOT NULL AND r.items::text != '[]';
    
    RAISE NOTICE 'Migration des articles terminée';
    
    -- Supprimer la colonne items
    ALTER TABLE receipts DROP COLUMN items;
    RAISE NOTICE 'Colonne items supprimée';
  ELSE
    RAISE NOTICE 'La colonne items n''existe pas, migration ignorée';
  END IF;
END $$;

-- Étape 4: Vérifier les résultats
DO $$
DECLARE
  receipt_count INTEGER;
  item_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO receipt_count FROM receipts;
  SELECT COUNT(*) INTO item_count FROM receipt_items;
  
  RAISE NOTICE 'Nombre de tickets: %', receipt_count;
  RAISE NOTICE 'Nombre d''articles: %', item_count;
END $$;
