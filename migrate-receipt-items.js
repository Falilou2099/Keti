#!/usr/bin/env node

/**
 * Script pour exécuter la migration de la base de données
 */

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function runMigration() {
    const sql = neon(process.env.DATABASE_URL);

    console.log('🔄 Début de la migration...\n');

    try {
        // Étape 1: Créer la table receipt_items
        console.log('📝 Création de la table receipt_items...');
        await sql`
      CREATE TABLE IF NOT EXISTS receipt_items (
        id SERIAL PRIMARY KEY,
        receipt_id INTEGER NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2),
        unit_price DECIMAL(10, 2),
        total_price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
        console.log('✅ Table receipt_items créée\n');

        // Étape 2: Créer l'index
        console.log('📝 Création de l\'index...');
        await sql`
      CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id 
      ON receipt_items(receipt_id)
    `;
        console.log('✅ Index créé\n');

        // Étape 3: Vérifier si la colonne items existe
        console.log('🔍 Vérification de la colonne items...');
        const columnCheck = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'receipts' AND column_name = 'items'
    `;

        if (columnCheck.length > 0) {
            console.log('📦 Migration des données existantes...');

            // Récupérer tous les tickets avec des items
            const receipts = await sql`
        SELECT id, items 
        FROM receipts 
        WHERE items IS NOT NULL AND items::text != '[]'
      `;

            console.log(`   Trouvé ${receipts.length} tickets avec des articles`);

            let totalItems = 0;
            for (const receipt of receipts) {
                try {
                    const items = JSON.parse(receipt.items);

                    for (const item of items) {
                        await sql`
              INSERT INTO receipt_items (receipt_id, name, quantity, unit_price, total_price)
              VALUES (
                ${receipt.id},
                ${item.name || item.description || 'Article sans nom'},
                ${item.quantity || null},
                ${item.price || null},
                ${item.total || null}
              )
            `;
                        totalItems++;
                    }
                } catch (error) {
                    console.warn(`   ⚠️  Erreur lors de la migration du ticket ${receipt.id}:`, error.message);
                }
            }

            console.log(`✅ ${totalItems} articles migrés\n`);

            // Supprimer la colonne items
            console.log('🗑️  Suppression de la colonne items...');
            await sql`ALTER TABLE receipts DROP COLUMN items`;
            console.log('✅ Colonne items supprimée\n');
        } else {
            console.log('ℹ️  La colonne items n\'existe pas, migration ignorée\n');
        }

        // Étape 4: Vérifier les résultats
        console.log('📊 Vérification des résultats...');
        const receiptCount = await sql`SELECT COUNT(*) as count FROM receipts`;
        const itemCount = await sql`SELECT COUNT(*) as count FROM receipt_items`;

        console.log(`   Nombre de tickets: ${receiptCount[0].count}`);
        console.log(`   Nombre d'articles: ${itemCount[0].count}`);

        console.log('\n✅ Migration terminée avec succès !');

    } catch (error) {
        console.error('\n❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

runMigration();
