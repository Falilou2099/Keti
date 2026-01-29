#!/usr/bin/env node

/**
 * Script pour lister les modèles Gemini disponibles avec votre clé API
 */

require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY non trouvée dans .env.local');
        process.exit(1);
    }

    console.log('🔍 Listing des modèles Gemini disponibles...\n');

    const genAI = new GoogleGenerativeAI(apiKey);

    try {
        // Tester différents modèles
        const modelsToTest = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-pro',
            'gemini-pro-vision',
            'gemini-1.5-flash-latest',
            'gemini-1.5-pro-latest'
        ];

        console.log('Modèles à tester:');
        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('Test');
                console.log(`✅ ${modelName} - DISPONIBLE`);
            } catch (error) {
                if (error.message.includes('404')) {
                    console.log(`❌ ${modelName} - NON DISPONIBLE (404)`);
                } else {
                    console.log(`⚠️  ${modelName} - ERREUR: ${error.message.substring(0, 100)}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

listModels();
