import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyAuth } from "@/lib/auth";

/**
 * GET /api/receipts
 * Récupère tous les tickets de caisse de l'utilisateur
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || !authResult.userId) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        // Récupérer les tickets de l'utilisateur
        const query = `
      SELECT 
        id,
        merchant_name,
        transaction_date,
        total_amount,
        is_authentic,
        confidence_score,
        yann_extraction,
        created_at
      FROM receipts
      WHERE user_id = $1
      ORDER BY transaction_date DESC, created_at DESC
      LIMIT $2 OFFSET $3
    `;

        const result = await db.query(query, [authResult.userId, limit, offset]);

        // Compter le total
        const countQuery = `SELECT COUNT(*) as total FROM receipts WHERE user_id = $1`;
        const countResult = await db.query(countQuery, [authResult.userId]);

        // Formater les résultats
        const receipts = result.rows.map((row: any) => {
            // Parser yann_extraction si c'est une chaîne
            let items = [];
            if (row.yann_extraction) {
                const extraction = typeof row.yann_extraction === 'string' 
                    ? JSON.parse(row.yann_extraction) 
                    : row.yann_extraction;
                items = extraction.items || [];
            }

            return {
                id: row.id,
                merchant_name: row.merchant_name,
                transaction_date: row.transaction_date,
                total_amount: parseFloat(row.total_amount),
                is_authentic: row.is_authentic,
                confidence_score: row.confidence_score,
                items: items,
                created_at: row.created_at,
            };
        });

        return NextResponse.json({
            receipts,
            total: parseInt(countResult.rows[0].total),
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
