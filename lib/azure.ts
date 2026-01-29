import { AzureKeyCredential, DocumentAnalysisClient } from "@azure/ai-form-recognizer";

/**
 * Interface représentant les données extraites par Azure Document Intelligence
 */
export interface AzureReceiptData {
    merchantName?: string;
    merchantAddress?: string;
    merchantPhoneNumber?: string;
    transactionDate?: string;
    transactionTime?: string;
    items?: Array<{
        description?: string;
        quantity?: number;
        price?: number;
        totalPrice?: number;
    }>;
    subtotal?: number;
    tax?: number;
    tip?: number;
    total?: number;
    confidence?: number;
    rawData?: any; // Données brutes d'Azure pour debugging
}

/**
 * Extrait les champs d'un ticket de caisse en utilisant Azure Document Intelligence
 * @param imageBase64 - Image du ticket encodée en base64
 * @returns Promesse contenant les données extraites
 */
export async function extractReceiptFields(
    imageBase64: string
): Promise<AzureReceiptData> {
    const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
    const apiKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

    if (!endpoint || !apiKey) {
        throw new Error(
            "AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT et AZURE_DOCUMENT_INTELLIGENCE_KEY doivent être configurés"
        );
    }

    try {
        // Initialiser le client Azure
        const client = new DocumentAnalysisClient(
            endpoint,
            new AzureKeyCredential(apiKey)
        );

        // Convertir base64 en Uint8Array (format requis par Azure)
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const uint8Array = new Uint8Array(buffer);

        console.log("📄 Analyse du ticket avec Azure Document Intelligence...");

        // Analyser le ticket avec le modèle prebuilt-receipt
        const poller = await client.beginAnalyzeDocument(
            "prebuilt-receipt",
            uint8Array
        );

        // Attendre la fin de l'analyse
        const result = await poller.pollUntilDone();

        if (!result.documents || result.documents.length === 0) {
            throw new Error("Aucun ticket détecté dans l'image");
        }

        // Extraire les données du premier document
        const receipt = result.documents[0];
        const fields = receipt.fields;

        // Construire l'objet de données structuré
        const extractedData: AzureReceiptData = {
            merchantName: fields?.MerchantName?.content,
            merchantAddress: fields?.MerchantAddress?.content,
            merchantPhoneNumber: fields?.MerchantPhoneNumber?.content,
            transactionDate: fields?.TransactionDate?.content,
            transactionTime: fields?.TransactionTime?.content,
            subtotal: (fields?.Subtotal as any)?.value,
            tax: (fields?.TotalTax as any)?.value,
            tip: (fields?.Tip as any)?.value,
            total: (fields?.Total as any)?.value,
            confidence: receipt.confidence,
            items: [],
            rawData: fields, // Conserver les données brutes pour debugging
        };

        // Extraire les articles
        if (fields?.Items && 'values' in fields.Items) {
            extractedData.items = (fields.Items as any).values.map((item: any) => {
                const itemFields = item.properties;
                return {
                    description: itemFields?.Description?.content,
                    quantity: itemFields?.Quantity?.value,
                    price: itemFields?.Price?.value,
                    totalPrice: itemFields?.TotalPrice?.value,
                };
            });
        }

        console.log(`✅ Extraction réussie avec Azure (confiance: ${(receipt.confidence * 100).toFixed(1)}%)`);

        return extractedData;
    } catch (error) {
        console.error("❌ Erreur lors de l'extraction avec Azure:", error);

        // Gestion des erreurs spécifiques
        if (error instanceof Error) {
            if (error.message.includes("401") || error.message.includes("Unauthorized")) {
                throw new Error("Clé API Azure invalide ou expirée");
            }
            if (error.message.includes("404") || error.message.includes("Not Found")) {
                throw new Error("Endpoint Azure invalide ou ressource non trouvée");
            }
            if (error.message.includes("429") || error.message.includes("Too Many Requests")) {
                throw new Error("Limite de requêtes Azure atteinte, veuillez réessayer plus tard");
            }
        }

        throw new Error(
            `Échec de l'extraction Azure: ${error instanceof Error ? error.message : "Erreur inconnue"
            }`
        );
    }
}

/**
 * Valide que les credentials Azure sont configurés
 * @returns true si les credentials sont présents
 */
export function validateAzureCredentials(): boolean {
    return !!(
        process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT &&
        process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY
    );
}
