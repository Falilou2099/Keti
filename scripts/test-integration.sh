#!/bin/bash

# Script de test de l'intégration Gemini + Yann API
# Ce script vérifie que tous les composants sont opérationnels

echo "=========================================="
echo "🧪 Test de l'intégration Gemini + Yann"
echo "=========================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1 : Vérifier que l'API de Yann est accessible
echo "📡 Test 1 : Vérification de l'API FastAPI de Yann..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API de Yann accessible${NC}"
    curl -s http://localhost:8000/health | jq '.'
else
    echo -e "${RED}❌ API de Yann non accessible${NC}"
    echo -e "${YELLOW}💡 Démarrez l'API avec: cd api && python -m uvicorn main:app --port 8000${NC}"
    exit 1
fi

echo ""

# Test 2 : Vérifier que Next.js est démarré
echo "📡 Test 2 : Vérification de Next.js..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Next.js accessible${NC}"
else
    echo -e "${RED}❌ Next.js non accessible${NC}"
    echo -e "${YELLOW}💡 Démarrez Next.js avec: npm run dev${NC}"
    exit 1
fi

echo ""

# Test 3 : Vérifier les variables d'environnement
echo "🔧 Test 3 : Vérification des variables d'environnement..."

if [ -f .env.local ]; then
    echo -e "${GREEN}✅ Fichier .env.local trouvé${NC}"
    
    if grep -q "GEMINI_API_KEY" .env.local; then
        echo -e "${GREEN}✅ GEMINI_API_KEY configurée${NC}"
    else
        echo -e "${RED}❌ GEMINI_API_KEY manquante${NC}"
    fi
    
    if grep -q "YANN_API_URL" .env.local; then
        echo -e "${GREEN}✅ YANN_API_URL configurée${NC}"
    else
        echo -e "${YELLOW}⚠️  YANN_API_URL manquante (utilise http://localhost:8000 par défaut)${NC}"
    fi
    
    if grep -q "DATABASE_URL" .env.local; then
        echo -e "${GREEN}✅ DATABASE_URL configurée${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL manquante${NC}"
    fi
else
    echo -e "${RED}❌ Fichier .env.local non trouvé${NC}"
    exit 1
fi

echo ""

# Test 4 : Vérifier la structure de la base de données
echo "🗄️  Test 4 : Vérification de la base de données..."
echo -e "${YELLOW}⚠️  Vérification manuelle requise${NC}"
echo "Exécutez cette requête pour vérifier la colonne yann_extraction :"
echo ""
echo "  psql \$DATABASE_URL -c \"\\d receipts\""
echo ""
echo "Ou exécutez la migration si nécessaire :"
echo ""
echo "  psql \$DATABASE_URL < scripts/add_yann_extraction.sql"
echo ""

# Test 5 : Résumé
echo "=========================================="
echo "📊 Résumé des tests"
echo "=========================================="
echo ""
echo "Pour tester l'intégration complète :"
echo "1. Connectez-vous au dashboard (http://localhost:3000)"
echo "2. Cliquez sur 'Ajouter un ticket'"
echo "3. Uploadez une photo de ticket de caisse"
echo "4. Vérifiez les logs dans le terminal Next.js"
echo ""
echo "Logs attendus :"
echo "  🔍 Étape 1 : Vérification d'authenticité avec Gemini AI..."
echo "  ✅ Ticket authentique ! Appel de l'API de Yann..."
echo "  ✅ Extraction réussie par l'API de Yann"
echo ""
echo "=========================================="
