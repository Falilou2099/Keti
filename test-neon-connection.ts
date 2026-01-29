// Script de test de connexion à Neon
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function testConnection() {
    try {
        console.log("🔌 Test de connexion à Neon...");
        console.log("📍 URL:", process.env.DATABASE_URL?.substring(0, 50) + "...");

        const result = await pool.query("SELECT NOW() as current_time, version() as pg_version");

        console.log("✅ Connexion réussie !");
        console.log("⏰ Heure serveur:", result.rows[0].current_time);
        console.log("🐘 Version PostgreSQL:", result.rows[0].pg_version);

        // Test de la table receipts
        const tableCheck = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'receipts'
      ORDER BY ordinal_position
    `);

        console.log("\n📊 Colonnes de la table receipts:");
        tableCheck.rows.forEach(row => {
            console.log(`  - ${row.column_name}: ${row.data_type}`);
        });

        await pool.end();
        console.log("\n✅ Test terminé avec succès !");

    } catch (error) {
        console.error("❌ Erreur de connexion:", error);
        process.exit(1);
    }
}

testConnection();
