// Script de migration pour ajouter les colonnes manquantes
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigration() {
    try {
        console.log("🔄 Exécution de la migration...");

        // Ajouter la colonne image_data si elle n'existe pas
        console.log("📝 Ajout de la colonne image_data...");
        await pool.query(`
      ALTER TABLE receipts 
      ADD COLUMN IF NOT EXISTS image_data TEXT;
    `);
        console.log("✅ Colonne image_data ajoutée");

        // Ajouter la colonne yann_extraction si elle n'existe pas
        console.log("📝 Ajout de la colonne yann_extraction...");
        await pool.query(`
      ALTER TABLE receipts 
      ADD COLUMN IF NOT EXISTS yann_extraction JSONB;
    `);
        console.log("✅ Colonne yann_extraction ajoutée");

        // Ajouter la colonne updated_at si elle n'existe pas
        console.log("📝 Ajout de la colonne updated_at...");
        await pool.query(`
      ALTER TABLE receipts 
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);
        console.log("✅ Colonne updated_at ajoutée");

        // Vérifier les colonnes
        const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'receipts'
      ORDER BY ordinal_position
    `);

        console.log("\n📊 Colonnes de la table receipts après migration:");
        result.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

        await pool.end();
        console.log("\n✅ Migration terminée avec succès !");

    } catch (error) {
        console.error("❌ Erreur lors de la migration:", error);
        process.exit(1);
    }
}

runMigration();
