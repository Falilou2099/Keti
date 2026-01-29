#!/bin/bash

# Test de l'API Mindee avec une image de test

# Créer une petite image de test (1x1 pixel PNG)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_receipt.png

echo "🧪 Test de l'API Mindee..."
echo ""

# Tester l'endpoint /process-receipt
curl -X POST \
  -F "file=@/tmp/test_receipt.png" \
  http://localhost:8000/process-receipt \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Test terminé"
