import os
import re
from typing import Dict
from fastapi import FastAPI, File, UploadFile, HTTPException
from azure.ai.formrecognizer import DocumentAnalysisClient
from azure.core.credentials import AzureKeyCredential
from mindee import ClientV2, InferenceParameters, BytesInput
from dotenv import load_dotenv
load_dotenv()

# ============================================================================
# CONFIGURATION AZURE (Bloc 1 - Reconnaissance)
# ============================================================================
AZURE_ENDPOINT = os.getenv("AZURE_ENDPOINT")
AZURE_KEY = os.getenv("AZURE_KEY")

doc_client = DocumentAnalysisClient(
    endpoint=AZURE_ENDPOINT,
    credential=AzureKeyCredential(AZURE_KEY)
)

# ============================================================================
# CONFIGURATION MINDEE (Bloc 2 - Extraction)
# ============================================================================
MINDEE_API_KEY = "md_vHpPefNVwCpfLdRDMV4F0MBaNMQrO5C9NsojQG8MemI"
MINDEE_MODEL_ID = "43e3cb6a-aade-4793-bb0b-f448836ac276"

mindee_client = ClientV2(MINDEE_API_KEY)

# ============================================================================
# CONFIGURATION DES MOTS-CLÉS (Bloc 1)
# ============================================================================
MAIN_KEYWORDS = {
    "ticket": ["ticket", "reçu", "recu"],
    "facture": ["facture", "invoice"],
    "tva": ["tva", "t.v.a", "t.v.a."],
    "ttc": ["ttc", "t.t.c", "t.t.c."]
}

SECONDARY_KEYWORDS = [
    "total", "montant", "prix", "€", "eur", "carte",
    "espèces", "especes", "paiement", "merci", "caisse"
]

# ============================================================================
# FONCTIONS DU BLOC 1 : RECONNAISSANCE
# ============================================================================

def normalize_text(text: str) -> str:
    """Normalise le texte pour une meilleure détection."""
    text = text.lower()
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def extract_text_from_image(content: bytes) -> str:
    """Extrait tout le texte d'une image en utilisant Azure OCR."""
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
    """Recherche les mots-clés dans le texte extrait."""
    main_found = []
    keyword_details = {}
    
    # Chercher les mots-clés principaux
    for category, variants in MAIN_KEYWORDS.items():
        found_variants = []
        for variant in variants:
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
    """Calcule un score de confiance basé sur plusieurs critères."""
    main_count = len(keyword_result["main_keywords_found"])
    secondary_count = len(keyword_result["secondary_keywords_found"])
    
    main_score = min(main_count / 2, 1.0) * 0.7
    secondary_score = min(secondary_count / 3, 1.0) * 0.2
    length_score = min(text_length / 100, 1.0) * 0.1
    
    total_score = main_score + secondary_score + length_score
    is_receipt = main_count > 0
    
    return {
        "is_receipt": is_receipt,
        "confidence": round(total_score, 2),
        "main_keywords_count": main_count,
        "secondary_keywords_count": secondary_count
    }


# ============================================================================
# FONCTION DU BLOC 2 : EXTRACTION DES DONNÉES
# ============================================================================

def extract_receipt_data(image_content: bytes) -> Dict:
    """
    Extrait les informations détaillées d'un ticket de caisse avec Mindee.
    
    Args:
        image_content: Contenu binaire de l'image
        
    Returns:
        dict: Données extraites du ticket
    """
    try:
        # Paramètres d'inférence Mindee
        params = InferenceParameters(
            model_id=MINDEE_MODEL_ID,
            rag=None,
            raw_text=None,
            polygon=None,
            confidence=None,
        )
        
        # Utiliser BytesInput au lieu de PathInput pour éviter de sauvegarder le fichier
        input_source = BytesInput(image_content, filename="ticket.png")
        
        # Envoyer pour traitement
        response = mindee_client.enqueue_and_get_inference(input_source, params)
        
        # Extraire les champs
        fields: dict = response.inference.result.fields
        
        return {
            "success": True,
            "fields": fields,
            "raw_inference": str(response.inference)
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# APPLICATION FASTAPI
# ============================================================================

app = FastAPI()


@app.post("/process-receipt")
async def process_receipt(file: UploadFile = File(...)):
    """
    🎯 ENDPOINT PRINCIPAL : Reconnaissance + Extraction automatique
    
    Workflow :
    1. Vérifie si l'image uploadée est un ticket de caisse (Azure OCR)
    2. SI c'est un ticket → Extrait les données (Mindee)
    3. SINON → Retourne un message d'erreur
    
    Returns:
        Si c'est un ticket : {
            "is_receipt": true,
            "confidence": float,
            "extracted_data": {...}
        }
        Sinon : {
            "is_receipt": false,
            "message": "Ce n'est pas un ticket de caisse"
        }
    """
    # ========== VALIDATION ==========
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail=f"Le fichier doit être une image (reçu : {file.content_type})"
        )
    
    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Le fichier est vide")
    
    try:
        # ========== ÉTAPE 1 : RECONNAISSANCE (BLOC 1) ==========
        print("🔍 Étape 1 : Vérification si l'image est un ticket...")
        
        # Extraire le texte avec Azure OCR
        extracted_text = extract_text_from_image(content)
        
        if not extracted_text or len(extracted_text) < 5:
            return {
                "is_receipt": False,
                "confidence": 0.0,
                "message": "Aucun texte détecté dans l'image",
                "extracted_data": None
            }
        
        # Chercher les mots-clés
        keyword_result = find_keywords_in_text(extracted_text)
        
        # Calculer le score
        score_result = calculate_receipt_score(keyword_result, len(extracted_text))
        
        # ========== DÉCISION : Est-ce un ticket ? ==========
        if not score_result["is_receipt"]:
            # ❌ CE N'EST PAS UN TICKET
            return {
                "is_receipt": False,
                "confidence": score_result["confidence"],
                "message": "L'image ne semble pas être un ticket de caisse",
                "main_keywords_found": keyword_result["main_keywords_found"],
                "secondary_keywords_found": keyword_result["secondary_keywords_found"],
                "extracted_data": None
            }
        
        # ========== ÉTAPE 2 : EXTRACTION DES DONNÉES (BLOC 2) ==========
        print("✅ C'est un ticket ! Extraction des données en cours...")
        
        extraction_result = extract_receipt_data(content)
        
        # ========== RÉPONSE FINALE ==========
        return {
            "is_receipt": True,
            "confidence": score_result["confidence"],
            "message": "Ticket de caisse détecté et analysé avec succès",
            "recognition_details": {
                "main_keywords_found": keyword_result["main_keywords_found"],
                "secondary_keywords_found": keyword_result["secondary_keywords_found"],
                "keyword_details": keyword_result["keyword_details"],
                "text_preview": extracted_text[:300] + "..." if len(extracted_text) > 300 else extracted_text
            },
            "extracted_data": extraction_result,
            "filename": file.filename
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors du traitement : {str(e)}"
        )


@app.post("/check-receipt")
async def check_receipt(file: UploadFile = File(...)):
    """
    Endpoint pour SEULEMENT vérifier si une image est un ticket (sans extraction).
    Équivalent au BLOC 1 original.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400, 
            detail=f"Le fichier doit être une image (reçu : {file.content_type})"
        )
    
    content = await file.read()
    
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Le fichier est vide")
    
    try:
        extracted_text = extract_text_from_image(content)
        
        if not extracted_text or len(extracted_text) < 5:
            return {
                "is_receipt": False,
                "confidence": 0.0,
                "main_keywords_found": [],
                "secondary_keywords_found": [],
                "keyword_details": {},
                "extracted_text_preview": "",
                "message": "Aucun texte détecté dans l'image"
            }
        
        keyword_result = find_keywords_in_text(extracted_text)
        score_result = calculate_receipt_score(keyword_result, len(extracted_text))
        
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


@app.post("/extract-receipt-data")
async def extract_only(file: UploadFile = File(...)):
    """
    Endpoint pour SEULEMENT extraire les données d'un ticket (sans vérification).
    Équivalent au BLOC 2 original.
    
    ⚠️ Attention : N'utilise pas ce endpoint si tu n'es pas sûr que c'est un ticket.
    Utilise plutôt /process-receipt qui fait la vérification automatique.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Le fichier doit être une image")
    
    content = await file.read()
    
    try:
        result = extract_receipt_data(content)
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'extraction : {str(e)}"
        )


@app.get("/keywords")
async def get_keywords():
    """Retourne la liste des mots-clés surveillés."""
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
        "secondary_keywords_count": len(SECONDARY_KEYWORDS),
        "azure_configured": bool(AZURE_ENDPOINT and AZURE_KEY),
        "mindee_configured": bool(MINDEE_API_KEY)
    }


# ============================================================================
# DÉMARRAGE DU SERVEUR
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    print("=" * 80)
    print("🚀 Serveur FastAPI - Reconnaissance et Extraction de tickets de caisse")
    print("=" * 80)
    print()
    print("📝 RÈGLE DE DÉTECTION :")
    print("   → Au moins UN de ces mots doit être présent :")
    print("     • Ticket (ou reçu)")
    print("     • Facture (ou invoice)")
    print("     • TVA (ou T.V.A)")
    print("     • TTC (ou T.T.C)")
    print()
    print("✅ Endpoints disponibles :")
    print()
    print("   🎯 PRINCIPAL (recommandé) :")
    print("   • POST /process-receipt       → Vérification + Extraction automatique")
    print()
    print("   ⚙️  ENDPOINTS SÉPARÉS :")
    print("   • POST /check-receipt         → Vérification seulement (Bloc 1)")
    print("   • POST /extract-receipt-data  → Extraction seulement (Bloc 2)")
    print()
    print("   📊 UTILITAIRES :")
    print("   • GET  /keywords              → Voir les mots-clés")
    print("   • GET  /health                → Status du serveur")
    print()
    print("=" * 80)
    print()
    print("💡 CONSEIL : Utilise /process-receipt pour tout faire en une seule fois !")
    print()
    uvicorn.run(app, host="0.0.0.0", port=8000)