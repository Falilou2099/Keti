import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

/**
 * Interface représentant un article extrait d'un ticket de caisse
 */
export interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

/**
 * Interface représentant un élément suspect détecté sur le ticket
 */
export interface SuspiciousElement {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
}

/**
 * Interface représentant le résultat de l'analyse d'un ticket
 */
export interface ReceiptAnalysis {
  merchant_name: string;
  transaction_date: string;
  total_amount: number;
  items: ReceiptItem[];
  is_authentic: boolean;
  confidence_score: number;
  suspicious_elements: SuspiciousElement[];
  analysis: string;
}

/**
 * Analyse un ticket de caisse à partir d'une image en utilisant l'API Gemini
 * @param imageBase64 - Image du ticket encodée en base64
 * @returns Promesse contenant l'analyse complète du ticket
 */
export async function analyzeReceipt(
  imageBase64: string
): Promise<ReceiptAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY n'est pas configurée");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Utiliser le modèle avec support d'images (sans version)
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash"
  });

  const prompt = `Analyse ce ticket de caisse et fournis une réponse JSON structurée avec les informations suivantes :

{
  "merchant_name": "Nom du commerçant",
  "transaction_date": "Date au format YYYY-MM-DD",
  "total_amount": montant_total_en_nombre,
  "items": [
    {
      "name": "Nom de l'article",
      "quantity": quantité_en_nombre,
      "unit_price": prix_unitaire_en_nombre,
      "total_price": prix_total_en_nombre
    }
  ],
  "is_authentic": true_ou_false,
  "confidence_score": score_de_confiance_entre_0_et_100,
  "suspicious_elements": [
    {
      "type": "Type d'anomalie",
      "description": "Description détaillée",
      "severity": "low|medium|high"
    }
  ],
  "analysis": "Analyse détaillée de l'authenticité du ticket"
}

Critères d'authenticité à vérifier :
- Qualité de l'impression et alignement du texte
- Présence des informations légales obligatoires (SIRET, TVA, etc.)
- Cohérence des calculs (prix unitaires × quantités = totaux)
- Format et structure typiques d'un ticket de caisse
- Présence de logos ou éléments de sécurité
- Cohérence des dates et heures

Réponds UNIQUEMENT avec le JSON, sans texte supplémentaire.`;

  try {
    // Convertir le base64 en format compatible Gemini
    const imageParts = [
      {
        inlineData: {
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    // Extraire le JSON de la réponse
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Impossible d'extraire le JSON de la réponse");
    }

    const analysis: ReceiptAnalysis = JSON.parse(jsonMatch[0]);

    // Validation des données
    if (!analysis.merchant_name || !analysis.transaction_date) {
      throw new Error("Données de ticket incomplètes");
    }

    return analysis;
  } catch (error) {
    console.error("Erreur lors de l'analyse du ticket:", error);
    throw new Error(
      `Échec de l'analyse du ticket: ${
        error instanceof Error ? error.message : "Erreur inconnue"
      }`
    );
  }
}

/**
 * Valide le format d'une image base64
 * @param base64String - Chaîne base64 à valider
 * @returns true si le format est valide
 */
export function validateBase64Image(base64String: string): boolean {
  const base64Regex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  return base64Regex.test(base64String);
}
