#!/usr/bin/env node

/**
 * Script pour tester la clé API Gemini et vérifier l'accès
 */

require('dotenv').config({ path: '.env.local' });

async function testGeminiAPI() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY non trouvée dans .env.local');
        process.exit(1);
    }

    console.log('🔍 Test de la clé API Gemini...');
    console.log(`Clé: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}\n`);

    // Test direct avec fetch vers l'API v1
    const testModels = [
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        'models/gemini-pro'
    ];

    for (const model of testModels) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1/${model}:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Hello'
                        }]
                    }]
                })
            });

            const data = await response.json();

            if (response.ok) {
                console.log(`✅ ${model} - FONCTIONNE (API v1)`);
            } else {
                console.log(`❌ ${model} - Erreur ${response.status}: ${data.error?.message || 'Unknown'}`);
            }
        } catch (error) {
            console.log(`⚠️  ${model} - Erreur réseau: ${error.message}`);
        }
    }
}

testGeminiAPI();
