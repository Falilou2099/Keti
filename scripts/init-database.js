/**
 * Script pour initialiser la base de données Neon avec la table receipts
 */
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

async function initDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔌 Connexion à la base de données Neon...');

    // Lire le fichier SQL
    const sqlPath = path.join(__dirname, 'receipts.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📝 Exécution du script SQL...');
    await pool.query(sql);

    console.log('✅ Table receipts créée avec succès !');

    // Vérifier la structure de la table
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'receipts'
      ORDER BY ordinal_position;
    `);

    console.log('\n📊 Structure de la table receipts:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
