import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

/**
 * GET /api/warranties/expiring
 * API désactivée - Table warranties non disponible
 */
export async function GET(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité garanties non disponible" },
        { status: 501 }
    );
}

/**
 * GET /api/warranties/expiring (version originale désactivée)
 * Récupère les garanties qui expirent bientôt
 */
export async function GET_DISABLED(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || !authResult.userId) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const days = parseInt(searchParams.get("days") || "30");

        const query = `
      SELECT 
        w.*,
        r.merchant_name,
        r.total_amount,
        (w.expiration_date - CURRENT_DATE) as days_remaining
      FROM warranties w
      LEFT JOIN receipts r ON w.receipt_id = r.id
      WHERE w.user_id = $1
        AND w.expiration_date >= CURRENT_DATE
        AND w.expiration_date <= CURRENT_DATE + INTERVAL '1 day' * $2
      ORDER BY w.expiration_date ASC
    `;

        const result = await db.query(query, [authResult.userId, days]);

        return NextResponse.json({
            warranties: result.rows,
            total: result.rows.length,
            days,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des garanties expirantes:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la récupération des garanties expirantes",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}
