## Ticket Reader avec Mindee & FastAPI

Ce petit projet lit un ticket (`ticket1.png`) avec l'API Mindee et expose le résultat via une API locale avec FastAPI.

### 1. Prérequis

- **Python 3.9+** (recommandé)
- Un environnement virtuel (optionnel mais conseillé)

### 2. Installation des dépendances

Depuis le dossier du projet (`KETI`) :

```bash
pip install mindee fastapi uvicorn
```

### 3. Lancer le script en mode "terminal"

Pour exécuter le script comme un simple script Python et voir le résultat dans le terminal :

```bash
python main.py
```

Le script :
- lit l’image `ticket1.png`,
- envoie le document à Mindee,
- affiche dans le terminal le résultat (`response.inference`).

### 4. Lancer l’API FastAPI (localhost)

Le même script `main.py` crée aussi une application FastAPI avec une route `/result`.

Pour lancer le serveur :

```bash
uvicorn main:app --reload
```

Ensuite, dans ton navigateur :

- **Résultat brut** (même contenu que le terminal, mais en JSON) :  
  `http://127.0.0.1:8000/result`

- **Swagger (interface de test)** :  
  `http://127.0.0.1:8000/docs`

À améliorer avec le reste de l'équipe.

