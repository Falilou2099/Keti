#!/bin/bash

# Script pour exécuter la migration des garanties et alertes
# Ce script charge les variables d'environnement depuis .env.local et exécute la migration

echo "🚀 Migration des tables warranties et warranty_alerts"
echo ""

# Vérifier que .env.local existe
if [ ! -f .env.local ]; then
    echo "❌ Erreur: .env.local n'existe pas"
    exit 1
fi

# Extraire DATABASE_URL de .env.local
DATABASE_URL=$(grep "^DATABASE_URL=" .env.local | cut -d '=' -f2-)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL non trouvé dans .env.local"
    exit 1
fi

echo "📊 Connexion à la base de données Neon..."
echo ""

# Exécuter le script SQL
psql "$DATABASE_URL" < scripts/add_warranties_alerts.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration réussie !"
    echo "📋 Tables créées : warranties, warranty_alerts"
else
    echo ""
    echo "❌ Erreur lors de la migration"
    exit 1
fi
