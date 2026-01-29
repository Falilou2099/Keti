#!/usr/bin/env node

/**
 * Script pour lister TOUS les modèles disponibles via l'API Gemini
 */

require('dotenv').config({ path: '.env.local' });

async function listAvailableModels() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY non trouvée dans .env.local');
        process.exit(1);
    }

    console.log('🔍 Récupération de la liste des modèles disponibles...\n');

    try {
        // Appeler l'API ListModels
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Erreur:', data.error?.message || 'Unknown error');
            process.exit(1);
        }

        if (data.models && data.models.length > 0) {
            console.log(`✅ ${data.models.length} modèles trouvés:\n`);

            data.models.forEach(model => {
                const supportsVision = model.supportedGenerationMethods?.includes('generateContent');
                const visionIcon = supportsVision ? '📷' : '📝';
                console.log(`${visionIcon} ${model.name}`);
                console.log(`   Description: ${model.description || 'N/A'}`);
                console.log(`   Méthodes: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
                console.log('');
            });

            // Trouver le meilleur modèle pour vision
            const visionModels = data.models.filter(m =>
                m.supportedGenerationMethods?.includes('generateContent') &&
                (m.name.includes('vision') || m.name.includes('1.5'))
            );

            if (visionModels.length > 0) {
                console.log('\n✅ Modèles recommandés pour l\'analyse d\'images:');
                visionModels.forEach(m => console.log(`   - ${m.name}`));
            }
        } else {
            console.log('⚠️  Aucun modèle trouvé');
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

listAvailableModels();
