import { NextRequest, NextResponse } from "next/server";
import { analyzeReceipt } from "@/lib/gemini";
import pool from "@/lib/db";
import { cookies } from "next/headers";

/**
 * POST /api/receipts/scan
 * Analyse un ticket de caisse uploadé et vérifie son authenticité
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer la session et l'utilisateur
    const sessions = await pool.query(
      "SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()",
      [sessionToken.value]
    );

    if (!sessions.rows || sessions.rows.length === 0) {
      return NextResponse.json(
        { error: "Session invalide" },
        { status: 401 }
      );
    }

    const userId = sessions.rows[0].user_id;

    // Récupérer l'image depuis le body
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json(
        { error: "Image manquante" },
        { status: 400 }
      );
    }

    // Analyser le ticket avec Gemini
    const analysisResult = await analyzeReceipt(image);

    // Sauvegarder le résultat dans la base de données
    const result = await pool.query(
      `INSERT INTO receipts 
       (user_id, merchant_name, transaction_date, total_amount, is_authentic, confidence_score, items, suspicious_elements, analysis, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING id`,
      [
        userId,
        analysisResult.merchantName || null,
        analysisResult.date || null,
        analysisResult.totalAmount || null,
        analysisResult.isAuthentic,
        analysisResult.confidence,
        JSON.stringify(analysisResult.items || []),
        JSON.stringify(analysisResult.suspiciousElements || []),
        analysisResult.analysis,
      ]
    );

    const receiptId = result.rows[0].id;

    return NextResponse.json({
      success: true,
      receiptId,
      analysis: analysisResult,
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
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session_token");

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer la session et l'utilisateur
    const sessions = await pool.query(
      "SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()",
      [sessionToken.value]
    );

    if (!sessions.rows || sessions.rows.length === 0) {
      return NextResponse.json(
        { error: "Session invalide" },
        { status: 401 }
      );
    }

    const userId = sessions.rows[0].user_id;

    // Récupérer tous les tickets de l'utilisateur
    const receipts = await pool.query(
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
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );

    // Parser les champs JSON
    const formattedReceipts = receipts.rows.map((receipt: any) => ({
      ...receipt,
      items: typeof receipt.items === 'string' ? JSON.parse(receipt.items) : receipt.items,
      suspicious_elements: typeof receipt.suspicious_elements === 'string' 
        ? JSON.parse(receipt.suspicious_elements) 
        : receipt.suspicious_elements,
    }));

    return NextResponse.json({
      success: true,
      receipts: formattedReceipts,
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
