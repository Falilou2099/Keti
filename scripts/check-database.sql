-- Script pour vérifier les données dans la base de données

-- Vérifier les utilisateurs
SELECT 'Users:' as table_name, COUNT(*) as count FROM users;
SELECT * FROM users LIMIT 5;

-- Vérifier les tickets
SELECT 'Receipts:' as table_name, COUNT(*) as count FROM receipts;
SELECT id, user_id, merchant_name, transaction_date, total_amount, created_at 
FROM receipts 
ORDER BY created_at DESC 
LIMIT 10;

-- Vérifier les garanties
SELECT 'Warranties:' as table_name, COUNT(*) as count FROM warranties;
SELECT * FROM warranties LIMIT 10;

-- Vérifier les alertes
SELECT 'Warranty Alerts:' as table_name, COUNT(*) as count FROM warranty_alerts;
SELECT * FROM warranty_alerts LIMIT 10;
