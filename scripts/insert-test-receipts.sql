-- Script pour insérer des tickets de test dans la base de données

-- Insérer quelques tickets de test pour l'utilisateur ID 1
-- Assurez-vous que l'utilisateur avec ID 1 existe dans votre base de données

INSERT INTO receipts (
    user_id, 
    merchant_name, 
    transaction_date, 
    total_amount, 
    is_authentic, 
    confidence_score, 
    items, 
    suspicious_elements, 
    analysis
) VALUES 
(
    1,
    'Darty',
    '2024-01-15',
    129.99,
    true,
    95,
    '[{"name": "Aspirateur Dyson V11", "quantity": 1, "price": 129.99}]'::jsonb,
    '[]'::jsonb,
    'Ticket authentique - Darty'
),
(
    1,
    'Fnac',
    '2024-02-20',
    199.00,
    true,
    92,
    '[{"name": "Casque audio Sony WH-1000XM5", "quantity": 1, "price": 199.00}]'::jsonb,
    '[]'::jsonb,
    'Ticket authentique - Fnac'
),
(
    1,
    'Carrefour',
    CURRENT_DATE - INTERVAL '5 days',
    54.20,
    true,
    88,
    '[{"name": "Courses alimentaires", "quantity": 1, "price": 54.20}]'::jsonb,
    '[]'::jsonb,
    'Ticket authentique - Carrefour'
),
(
    1,
    'Norauto',
    CURRENT_DATE - INTERVAL '28 days',
    149.00,
    true,
    90,
    '[{"name": "Batterie voiture", "quantity": 1, "price": 149.00}]'::jsonb,
    '[]'::jsonb,
    'Ticket authentique - Norauto'
);

-- Vérifier les tickets insérés
SELECT id, merchant_name, transaction_date, total_amount 
FROM receipts 
WHERE user_id = 1
ORDER BY transaction_date DESC;
