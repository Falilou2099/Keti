import { neonConfig, Pool } from "@neondatabase/serverless";
import ws from "ws";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// ES module compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration pour WebSocket (nécessaire pour Neon)
neonConfig.webSocketConstructor = ws;

async function runMigration() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });

    try {
        console.log("🚀 Démarrage de la migration des garanties et alertes...");

        // Lire le fichier SQL
        const sqlPath = path.join(__dirname, "scripts", "add_warranties_alerts.sql");
        const sql = fs.readFileSync(sqlPath, "utf-8");

        // Exécuter la migration
        await pool.query(sql);

        console.log("✅ Migration réussie !");
        console.log("📋 Tables créées :");
        console.log("   - warranties");
        console.log("   - warranty_alerts");
        console.log("📊 Indexes créés pour optimiser les performances");

        // Vérifier que les tables existent
        const result = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('warranties', 'warranty_alerts')
            ORDER BY table_name;
        `);

        console.log("\n✅ Vérification des tables :");
        result.rows.forEach((row: any) => {
            console.log(`   ✓ ${row.table_name}`);
        });

    } catch (error) {
        console.error("❌ Erreur lors de la migration :", error);
        throw error;
    } finally {
        await pool.end();
    }
}

runMigration()
    .then(() => {
        console.log("\n🎉 Migration terminée avec succès !");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Échec de la migration :", error);
        process.exit(1);
    });
