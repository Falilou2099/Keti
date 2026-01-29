# 🎫 Scanner de Tickets avec IA - Documentation

## 📋 Vue d'ensemble

La fonctionnalité de scan de tickets utilise l'API Gemini de Google pour analyser automatiquement les tickets de caisse et vérifier leur authenticité.

## ✨ Fonctionnalités

- **Upload d'images** : Supporte JPEG, PNG, GIF et WebP (max 5MB)
- **Analyse IA** : Extraction automatique des informations du ticket
- **Vérification d'authenticité** : Score de confiance de 0 à 100%
- **Détection d'anomalies** : Identification des éléments suspects
- **Historique** : Sauvegarde de tous les tickets scannés

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install @google/generative-ai
```

### 2. Configurer la clé API Gemini

Ajoutez votre clé API dans le fichier `.env.local` :

```env
GEMINI_API_KEY=AIzaSyApLYcMhx3U5VrYjzAW4-99VRidHfaofDE
```

### 3. Créer la table dans la base de données

Exécutez le script SQL :

```bash
mysql -u root -p keti < scripts/receipts.sql
```

Ou manuellement :

```sql
CREATE TABLE IF NOT EXISTS receipts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  merchant_name VARCHAR(255) NOT NULL,
  transaction_date DATE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  is_authentic BOOLEAN NOT NULL DEFAULT TRUE,
  confidence_score INT NOT NULL,
  items JSON NOT NULL,
  suspicious_elements JSON NOT NULL,
  analysis TEXT NOT NULL,
  image_data LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_transaction_date (transaction_date),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 📱 Utilisation

### Dans l'interface utilisateur

1. **Depuis le Dashboard** :
   - Cliquez sur le bouton "Ajouter un ticket" dans les Actions rapides
   - Ou cliquez sur "Scanner"

2. **Upload d'un ticket** :
   - Cliquez dans la zone d'upload
   - Sélectionnez une photo de votre ticket
   - L'analyse démarre automatiquement

3. **Consulter les résultats** :
   - Informations du commerçant
   - Date et montant de la transaction
   - Liste détaillée des articles
   - Score de confiance
   - Éléments suspects détectés (si applicable)

4. **Historique** :
   - Accédez à l'onglet "Historique" dans le Receipt Manager
   - Consultez tous vos tickets scannés
   - Cliquez sur un ticket pour voir les détails

### Via l'API

#### Scanner un ticket (POST)

```typescript
const response = await fetch('/api/receipts/scan', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    image: 'data:image/jpeg;base64,...'
  })
});

const data = await response.json();
// data.receipt contient l'analyse complète
```

#### Récupérer l'historique (GET)

```typescript
const response = await fetch('/api/receipts/scan?limit=20&offset=0');
const data = await response.json();
// data.receipts contient la liste des tickets
```

## 🏗️ Architecture

### Backend

- **`lib/gemini.ts`** : Module d'analyse IA avec Gemini
- **`app/api/receipts/scan/route.ts`** : API endpoints (POST/GET)
- **`lib/auth.ts`** : Fonction `verifyAuth` pour l'authentification

### Frontend

- **`components/receipt-scanner.tsx`** : Interface de scan
- **`components/receipt-history.tsx`** : Historique des tickets
- **`components/receipt-manager.tsx`** : Gestionnaire avec onglets
- **`components/quick-actions.tsx`** : Boutons d'accès rapide

### Base de données

- **Table `receipts`** : Stockage des tickets scannés avec toutes les métadonnées

## 🔍 Critères d'authenticité

L'IA vérifie :

- ✅ Qualité de l'impression et alignement du texte
- ✅ Présence des informations légales (SIRET, TVA, etc.)
- ✅ Cohérence des calculs (prix × quantités = totaux)
- ✅ Format et structure typiques d'un ticket
- ✅ Présence de logos ou éléments de sécurité
- ✅ Cohérence des dates et heures

## 🧪 Tests

Exécuter les tests unitaires :

```bash
npm test
```

Tests disponibles :
- `__tests__/lib/gemini.test.ts` : Tests du module d'analyse
- `__tests__/api/receipts/scan.test.ts` : Tests de l'API

## 📊 Données extraites

Pour chaque ticket, l'IA extrait :

```typescript
{
  merchant_name: string;           // Nom du commerçant
  transaction_date: string;        // Date (YYYY-MM-DD)
  total_amount: number;            // Montant total
  items: Array<{                   // Liste des articles
    name: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
  is_authentic: boolean;           // Authenticité
  confidence_score: number;        // Score 0-100
  suspicious_elements: Array<{     // Anomalies détectées
    type: string;
    description: string;
    severity: "low" | "medium" | "high";
  }>;
  analysis: string;                // Analyse détaillée
}
```

## 🔒 Sécurité

- ✅ Authentification requise pour toutes les opérations
- ✅ Validation du format d'image
- ✅ Limite de taille d'image (5MB)
- ✅ Clé API stockée en variable d'environnement
- ✅ Données utilisateur isolées (user_id)

## 🎨 Personnalisation

### Modifier le modèle IA

Dans `lib/gemini.ts`, ligne 46 :

```typescript
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
```

Modèles disponibles : `gemini-1.5-flash`, `gemini-1.5-pro`

### Ajuster le prompt

Modifiez le prompt dans `lib/gemini.ts` pour personnaliser l'analyse.

## 🐛 Dépannage

### Erreur "GEMINI_API_KEY n'est pas configurée"

Vérifiez que `.env.local` contient la clé API.

### Erreur "Format d'image invalide"

Assurez-vous que l'image est en JPEG, PNG, GIF ou WebP.

### Erreur de base de données

Vérifiez que la table `receipts` existe et que l'utilisateur est authentifié.

## 📝 Notes

- La clé API Gemini fournie est pour le développement
- Pour la production, utilisez votre propre clé API
- Les images sont stockées en base64 dans la base de données
- Pensez à optimiser le stockage pour la production

## 🚀 Prochaines étapes

- [ ] Ajouter l'export PDF des tickets
- [ ] Implémenter la recherche dans l'historique
- [ ] Ajouter des statistiques de dépenses
- [ ] Intégrer la détection de garanties
