-- Optimisation des performances de la base de données
-- Script à exécuter sur la base de données Neon PostgreSQL

-- Index pour améliorer les recherches par authenticité
CREATE INDEX IF NOT EXISTS idx_receipts_is_authentic ON receipts(is_authentic);

-- Index composite pour les requêtes fréquentes (user + date)
CREATE INDEX IF NOT EXISTS idx_receipts_user_date ON receipts(user_id, transaction_date DESC);

-- Index pour les recherches par montant
CREATE INDEX IF NOT EXISTS idx_receipts_total_amount ON receipts(total_amount);

-- Index pour les recherches par score de confiance
CREATE INDEX IF NOT EXISTS idx_receipts_confidence ON receipts(confidence_score);

-- Analyser les tables pour mettre à jour les statistiques du planificateur de requêtes
ANALYZE receipts;
ANALYZE users;
ANALYZE sessions;

-- Afficher les index créés
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename IN ('receipts', 'users', 'sessions')
ORDER BY tablename, indexname;
