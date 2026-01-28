import os 
import re
from typing import List, Dict
from fastapi import FastAPI, UploadFile, File, HTTPException
from azure.core.credentials import AzureKeyCredential
from azure.ai.formrecognizer import DocumentAnalysisClient

# Configuration
AZURE_ENDPOINT = "https://yannnathanstartupweek.cognitiveservices.azure.com"
AZURE_KEY = "9jy9GAr3lQQmDGQPo9F2pH1cjwXeEyyQEYhdqrRAVVAsxmKQgrlkJQQJ99CAAChHRaEXJ3w3AAALACOGMsv6"

# Client Form Recognizer
doc_client = DocumentAnalysisClient(
    endpoint=AZURE_ENDPOINT,
    credential=AzureKeyCredential(AZURE_KEY)
)

app = FastAPI()

# ============================================================================
# CONFIGURATION DES MOTS-CLÉS
# ============================================================================

# Mots-clés PRINCIPAUX (au moins un de ces mots doit être présent)
MAIN_KEYWORDS = {
    "ticket": ["ticket", "reçu", "recu"],
    "facture": ["facture", "invoice"],
    "tva": ["tva", "t.v.a", "t.v.a."],
    "ttc": ["ttc", "t.t.c", "t.t.c."]
}

# Mots-clés SECONDAIRES (renforcent la détection mais pas obligatoires)
SECONDARY_KEYWORDS = [
    "total",
    "montant",
    "prix",
    "€",
    "eur",
    "carte",
    "espèces",
    "especes",
    "paiement",
    "merci",
    "caisse"
]


def normalize_text(text: str) -> str:
    """
    Normalise le texte pour une meilleure détection.
    - Convertit en minuscules
    - Enlève les espaces multiples
    - Garde la ponctuation pour les mots avec points (T.V.A.)
    """
    text = text.lower()
    # Remplacer espaces multiples par un seul espace
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_text_from_image(content: bytes) -> str:
    """
    Extrait tout le texte d'une image en utilisant Azure OCR.
    """
    try:
        poller = doc_client.begin_analyze_document(
            "prebuilt-read",
            document=content
        )
        result = poller.result()
        
        full_text = ""
        if result.content:
            full_text = result.content
        
        return normalize_text(full_text)
        
    except Exception as e:
        raise Exception(f"Erreur lors de l'extraction du texte : {str(e)}")


def find_keywords_in_text(text: str) -> Dict:
    """
    Recherche les mots-clés dans le texte extrait.
    
    Returns:
        dict: {
            "main_keywords_found": list[str],
            "secondary_keywords_found": list[str],
            "total_keywords": int,
            "keyword_details": dict
        }
    """
    main_found = []
    keyword_details = {}
    
    # Chercher les mots-clés principaux
    for category, variants in MAIN_KEYWORDS.items():
        found_variants = []
        for variant in variants:
            # Recherche avec regex pour matcher le mot entier ou avec ponctuation
            pattern = r'\b' + re.escape(variant) + r'\b'
            if re.search(pattern, text, re.IGNORECASE):
                found_variants.append(variant)
        
        if found_variants:
            main_found.append(category)
            keyword_details[category] = found_variants
    
    # Chercher les mots-clés secondaires
    secondary_found = []
    for keyword in SECONDARY_KEYWORDS:
        pattern = r'\b' + re.escape(keyword) + r'\b'
        if re.search(pattern, text, re.IGNORECASE):
            secondary_found.append(keyword)
    
    return {
        "main_keywords_found": main_found,
        "secondary_keywords_found": secondary_found,
        "total_keywords": len(main_found) + len(secondary_found),
        "keyword_details": keyword_details
    }


def calculate_receipt_score(keyword_result: Dict, text_length: int) -> Dict:
    """
    Calcule un score de confiance basé sur plusieurs critères.
    
    Critères :
    1. Présence de mots-clés principaux (poids: 70%)
    2. Présence de mots-clés secondaires (poids: 20%)
    3. Longueur du texte (poids: 10%)
    """
    main_count = len(keyword_result["main_keywords_found"])
    secondary_count = len(keyword_result["secondary_keywords_found"])
    
    # Score basé sur les mots-clés principaux
    main_score = min(main_count / 2, 1.0) * 0.7  # Au moins 2 mots principaux = score max
    
    # Score basé sur les mots-clés secondaires
    secondary_score = min(secondary_count / 3, 1.0) * 0.2  # Au moins 3 mots secondaires
    
    # Score basé sur la longueur du texte (tickets ont généralement du texte)
    length_score = min(text_length / 100, 1.0) * 0.1  # Au moins 100 caractères
    
    total_score = main_score + secondary_score + length_score
    
    # Décision : au moins 1 mot-clé principal OBLIGATOIRE
    is_receipt = main_count > 0
    
    return {
        "is_receipt": is_receipt,
        "confidence": round(total_score, 2),
        "main_keywords_count": main_count,
        "secondary_keywords_count": secondary_count
    }


@app.post("/check-receipt")
async def check_receipt(file: UploadFile = File(...)):
    """
    Endpoint pour vérifier si une image est un ticket de caisse.
    
    RÈGLE DE DÉTECTION :
    - Au moins UN mot parmi : Ticket, Facture, TVA, TTC
    - Si trouvé → is_receipt = true
    - Sinon → is_receipt = false
    
    Returns:
        {
            "is_receipt": bool,
            "confidence": float,
            "main_keywords_found": list[str],
            "secondary_keywords_found": list[str],
            "keyword_details": dict,
            "extracted_text_preview": str
        }
    """
    # Validation
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail=f"Le fichier doit être une image (reçu : {file.content_type})"
        )
    
    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Le fichier est vide")
    
    try:
        # Étape 1 : Extraire le texte
        extracted_text = extract_text_from_image(content)
        
        if not extracted_text or len(extracted_text) < 5:
            # Aucun texte détecté
            return {
                "is_receipt": False,
                "confidence": 0.0,
                "main_keywords_found": [],
                "secondary_keywords_found": [],
                "keyword_details": {},
                "extracted_text_preview": "",
                "message": "Aucun texte détecté dans l'image"
            }
        
        # Étape 2 : Chercher les mots-clés
        keyword_result = find_keywords_in_text(extracted_text)
        
        # Étape 3 : Calculer le score
        score_result = calculate_receipt_score(keyword_result, len(extracted_text))
        
        # Combiner les résultats
        response = {
            "is_receipt": score_result["is_receipt"],
            "confidence": score_result["confidence"],
            "main_keywords_found": keyword_result["main_keywords_found"],
            "secondary_keywords_found": keyword_result["secondary_keywords_found"],
            "keyword_details": keyword_result["keyword_details"],
            "extracted_text_preview": extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text,
            "filename": file.filename,
            "text_length": len(extracted_text)
        }
        
        return response
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'analyse : {str(e)}"
        )


@app.post("/check-receipt-simple")
async def check_receipt_simple(file: UploadFile = File(...)):
    """
    Version SIMPLIFIÉE : retourne juste true/false.
    
    Plus rapide si vous n'avez besoin que du résultat binaire.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image.")
    
    content = await file.read()
    
    try:
        # Extraire le texte
        extracted_text = extract_text_from_image(content)
        
        # Chercher les mots-clés principaux
        keyword_result = find_keywords_in_text(extracted_text)
        
        # Décision simple : au moins 1 mot-clé principal
        is_receipt = len(keyword_result["main_keywords_found"]) > 0
        
        return {
            "is_receipt": is_receipt
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur : {str(e)}")


@app.get("/keywords")
async def get_keywords():
    """
    Retourne la liste des mots-clés surveillés.
    """
    return {
        "main_keywords": MAIN_KEYWORDS,
        "secondary_keywords": SECONDARY_KEYWORDS,
        "detection_rule": "Au moins UN mot-clé principal doit être présent"
    }


@app.get("/health")
async def health_check():
    """Endpoint de santé"""
    main_words = [word for variants in MAIN_KEYWORDS.values() for word in variants]
    return {
        "status": "ok",
        "main_keywords": main_words,
        "secondary_keywords_count": len(SECONDARY_KEYWORDS)
    }


if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🚀 Serveur FastAPI - Détection de tickets de caisse")
    print("=" * 60)
    print()
    print("📝 RÈGLE DE DÉTECTION :")
    print("   → Au moins UN de ces mots doit être présent :")
    print("     • Ticket (ou reçu)")
    print("     • Facture (ou invoice)")
    print("     • TVA (ou T.V.A)")
    print("     • TTC (ou T.T.C)")
    print()
    print("✅ Endpoints disponibles :")
    print("   • POST /check-receipt        → Analyse détaillée")
    print("   • POST /check-receipt-simple → Réponse true/false")
    print("   • GET  /keywords             → Voir les mots-clés")
    print("   • GET  /health               → Status du serveur")
    print()
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Installation : pip install azure-ai-formrecognizer


# Code Mindee commenté (ancien code)
"""
from mindee import ClientV2, InferenceParameters, PathInput
from fastapi import FastAPI

input_path = "ticket1.png"
api_key = "md_vHpPefNVwCpfLdRDMV4F0MBaNMQrO5C9NsojQG8MemI"
model_id = "43e3cb6a-aade-4793-bb0b-f448836ac276"

# Init a new client
mindee_client = ClientV2(api_key)

# Set inference parameters
params = InferenceParameters(
    # ID of the model, required.
    model_id=model_id,

    # Options: set to `True` or `False` to override defaults

    # Enhance extraction accuracy with Retrieval-Augmented Generation.
    rag=None,
    # Extract the full text content from the document as strings.
    raw_text=None,
    # Calculate bounding box polygons for all fields.
    polygon=None,
    # Boost the precision and accuracy of all extractions.
    # Calculate confidence scores for all fields.
    confidence=None,
)

# Load a file from disk
input_source = PathInput(input_path)

# Send for processing using polling
response = mindee_client.enqueue_and_get_inference(
    input_source, params
)

# Print a brief summary of the parsed data
print(response.inference)

# Access the result fields
fields: dict = response.inference.result.fields
""" 

