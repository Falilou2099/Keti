import { NextRequest, NextResponse } from "next/server";
import { analyzeReceipt, validateBase64Image } from "@/lib/gemini";
import db from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// URL de l'API Python Mindee (déjà en cours d'exécution)
const MINDEE_API_URL = process.env.MINDEE_API_URL || "http://localhost:8000";


/**
 * POST /api/receipts/scan
 * Analyse un ticket de caisse et enregistre les résultats en base de données
 */
export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image requise" },
        { status: 400 }
      );
    }

    // Validation du format de l'image
    if (!validateBase64Image(image)) {
      return NextResponse.json(
        { error: "Format d'image invalide. Utilisez JPEG, PNG, GIF ou WebP" },
        { status: 400 }
      );
    }

    // ÉTAPE 1 : Analyse du ticket avec Gemini (vérification d'authenticité + extraction)
    console.log("🔍 Analyse du ticket avec Gemini AI...");
    const analysis = await analyzeReceipt(image);

    if (analysis.is_authentic) {
      console.log("✅ Ticket authentique détecté !");
    } else {
      console.log("❌ Ticket non authentique");
    }

    // ÉTAPE 2 : Enregistrement en base de données
    // D'abord insérer le ticket
    const receiptResult: any = await db.query(
      `INSERT INTO receipts (
        user_id, 
        merchant_name, 
        transaction_date, 
        total_amount, 
        is_authentic, 
        confidence_score, 
        suspicious_elements, 
        analysis,
        image_data,
        yann_extraction
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, created_at`,
      [
        authResult.userId,
        analysis.merchant_name,
        analysis.transaction_date,
        analysis.total_amount,
        analysis.is_authentic,
        analysis.confidence_score,
        JSON.stringify(analysis.suspicious_elements),
        analysis.analysis,
        image,
        null, // Pas de données externes, Gemini suffit
      ]
    );

    const receiptId = receiptResult.rows[0].id;
    const createdAt = receiptResult.rows[0].created_at;

    // Ensuite insérer les articles dans receipt_items
    if (analysis.items && analysis.items.length > 0) {
      console.log(`📦 Insertion de ${analysis.items.length} articles...`);

      for (const item of analysis.items) {
        await db.query(
          `INSERT INTO receipt_items (receipt_id, name, quantity, unit_price, total_price)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            receiptId,
            item.name || item.description || 'Article sans nom',
            item.quantity || null,
            item.price || null,
            item.total || null,
          ]
        );
      }

      console.log(`✅ ${analysis.items.length} articles insérés`);
    }

    return NextResponse.json({
      success: true,
      receipt: {
        id: receiptId,
        created_at: createdAt,
        ...analysis,
      },
    });
  } catch (error) {
    console.error("Erreur lors du scan du ticket:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de l'analyse du ticket",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/receipts/scan
 * Récupère l'historique des tickets scannés par l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Vérification de l'authentification
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.userId) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Paramètres de pagination
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Récupération des tickets avec comptage total (OPTIMISATION: une seule requête)
    const result: any = await db.query(
      `SELECT 
        id,
        merchant_name,
        transaction_date,
        total_amount,
        is_authentic,
        confidence_score,
        items,
        suspicious_elements,
        analysis,
        created_at,
        COUNT(*) OVER() as total_count
      FROM receipts 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3`,
      [authResult.userId, limit, offset]
    );

    const rows = result.rows || [];
    const total = rows.length > 0 ? parseInt(rows[0].total_count) : 0;

    return NextResponse.json({
      receipts: rows.map((row: any) => ({
        id: row.id,
        merchant_name: row.merchant_name,
        transaction_date: row.transaction_date,
        total_amount: row.total_amount,
        is_authentic: row.is_authentic,
        confidence_score: row.confidence_score,
        analysis: row.analysis,
        created_at: row.created_at,
        items: row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : [],
        suspicious_elements: row.suspicious_elements ? (typeof row.suspicious_elements === 'string' ? JSON.parse(row.suspicious_elements) : row.suspicious_elements) : [],
      })),
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tickets:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la récupération des tickets",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
