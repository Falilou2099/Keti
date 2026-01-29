#!/usr/bin/env node

/**
 * Script de test pour l'intégration Azure Document Intelligence
 * 
 * Ce script teste :
 * 1. La validation des credentials Azure
 * 2. L'extraction de champs d'un ticket de caisse
 * 
 * Usage: node test-azure.js <chemin-vers-image>
 */

const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: '.env.local' });

// Importer le module Azure (nécessite compilation TypeScript)
async function testAzureIntegration() {
    console.log('🧪 Test de l\'intégration Azure Document Intelligence\n');

    // Vérifier les credentials
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

    if (!endpoint || !apiKey) {
        console.error('❌ Erreur: Les credentials Azure ne sont pas configurés');
        console.error('   Veuillez définir AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT et AZURE_DOCUMENT_INTELLIGENCE_KEY dans .env.local');
        process.exit(1);
    }

    if (endpoint.includes('your-resource') || apiKey.includes('your-api-key')) {
        console.error('❌ Erreur: Les credentials Azure sont des placeholders');
        console.error('   Veuillez remplacer les valeurs par défaut dans .env.local');
        process.exit(1);
    }

    console.log('✅ Credentials Azure configurés');
    console.log(`   Endpoint: ${endpoint}`);
    console.log(`   API Key: ${apiKey.substring(0, 8)}...`);

    // Vérifier si une image est fournie
    const imagePath = process.argv[2];
    if (!imagePath) {
        console.log('\n⚠️  Aucune image fournie pour le test');
        console.log('   Usage: node test-azure.js <chemin-vers-image>');
        console.log('\n✅ Test de configuration réussi!');
        return;
    }

    // Vérifier que l'image existe
    if (!fs.existsSync(imagePath)) {
        console.error(`\n❌ Erreur: L'image ${imagePath} n'existe pas`);
        process.exit(1);
    }

    console.log(`\n📄 Test avec l'image: ${imagePath}`);

    // Lire l'image et la convertir en base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

    console.log('   Taille de l\'image:', (imageBuffer.length / 1024).toFixed(2), 'KB');

    // Importer dynamiquement le module Azure (compilé)
    try {
        const { extractReceiptFields } = await import('./lib/azure.js');

        console.log('\n🔍 Extraction des champs avec Azure...');
        const result = await extractReceiptFields(base64Image);

        console.log('\n✅ Extraction réussie!\n');
        console.log('📊 Résultats:');
        console.log('─'.repeat(50));
        console.log(`Commerçant: ${result.merchantName || 'N/A'}`);
        console.log(`Date: ${result.transactionDate || 'N/A'}`);
        console.log(`Heure: ${result.transactionTime || 'N/A'}`);
        console.log(`Total: ${result.total || 'N/A'}`);
        console.log(`Sous-total: ${result.subtotal || 'N/A'}`);
        console.log(`Taxes: ${result.tax || 'N/A'}`);
        console.log(`Confiance: ${result.confidence ? (result.confidence * 100).toFixed(1) + '%' : 'N/A'}`);

        if (result.items && result.items.length > 0) {
            console.log(`\nArticles (${result.items.length}):`);
            result.items.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.description || 'N/A'} - ${item.totalPrice || 'N/A'}`);
            });
        }

        console.log('\n✅ Test réussi!');
    } catch (error) {
        console.error('\n❌ Erreur lors de l\'extraction:', error.message);
        process.exit(1);
    }
}

testAzureIntegration().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
});
