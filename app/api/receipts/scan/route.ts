import { NextRequest, NextResponse } from "next/server";
import { analyzeReceipt, validateBase64Image } from "@/lib/gemini";
import db from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

// URL de l'API FastAPI de Yann (à configurer selon l'environnement)
const YANN_API_URL = process.env.YANN_API_URL || "http://localhost:8000";

/**
 * Appelle l'API de Yann pour extraire les champs détaillés du ticket
 */
async function callYannAPI(imageBase64: string) {
  try {
    // Convertir base64 en Blob pour l'upload
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Créer FormData pour l'upload
    const formData = new FormData();
    const blob = new Blob([buffer], { type: "image/jpeg" });
    formData.append("file", blob, "ticket.jpg");

    // Appeler l'API de Yann
    const response = await fetch(`${YANN_API_URL}/process-receipt`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Erreur API Yann: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erreur lors de l'appel à l'API de Yann:", error);
    return null;
  }
}

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

    // ÉTAPE 1 : Analyse du ticket avec Gemini (vérification d'authenticité)
    console.log("🔍 Étape 1 : Vérification d'authenticité avec Gemini AI...");
    const analysis = await analyzeReceipt(image);

    // Variable pour stocker les données extraites par Yann
    let yannData = null;

    // ÉTAPE 2 : Si le ticket est authentique, appeler l'API de Yann
    if (analysis.is_authentic) {
      console.log("✅ Ticket authentique ! Appel de l'API de Yann pour extraction détaillée...");
      yannData = await callYannAPI(image);

      if (yannData) {
        console.log("✅ Extraction réussie par l'API de Yann");
      } else {
        console.warn("⚠️ L'API de Yann n'a pas pu extraire les données");
      }
    } else {
      console.log("❌ Ticket non authentique, extraction détaillée ignorée");
    }

    // ÉTAPE 3 : Enregistrement en base de données
    const [result]: any = await db.query(
      `INSERT INTO receipts (
        user_id, 
        merchant_name, 
        transaction_date, 
        total_amount, 
        is_authentic, 
        confidence_score, 
        items, 
        suspicious_elements, 
        analysis,
        image_data,
        yann_extraction
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id, created_at`,
      [
        authResult.userId,
        analysis.merchant_name,
        analysis.transaction_date,
        analysis.total_amount,
        analysis.is_authentic,
        analysis.confidence_score,
        JSON.stringify(analysis.items),
        JSON.stringify(analysis.suspicious_elements),
        analysis.analysis,
        image,
        yannData ? JSON.stringify(yannData) : null,
      ]
    );

    return NextResponse.json({
      success: true,
      receipt: {
        id: result[0].id,
        created_at: result[0].created_at,
        ...analysis,
        yann_extraction: yannData,
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

    // Récupération des tickets
    const [rows]: any = await db.query(
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
        created_at
      FROM receipts 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?`,
      [authResult.userId, limit, offset]
    );

    // Comptage total
    const [countRows]: any = await db.query(
      `SELECT COUNT(*) as total FROM receipts WHERE user_id = ?`,
      [authResult.userId]
    );

    return NextResponse.json({
      receipts: rows.map((row: any) => ({
        ...row,
        items: row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : [],
        suspicious_elements: row.suspicious_elements ? (typeof row.suspicious_elements === 'string' ? JSON.parse(row.suspicious_elements) : row.suspicious_elements) : [],
      })),
      total: parseInt(countRows[0].total),
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
