import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

/**
 * GET /api/alerts
 * API désactivée - Table warranty_alerts non disponible
 */
export async function GET(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité alertes non disponible" },
        { status: 501 }
    );
}

/**
 * GET /api/alerts (version originale désactivée)
 * Récupère toutes les alertes de l'utilisateur
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

        const query = `
      SELECT 
        wa.*,
        w.product_name,
        w.purchase_date,
        w.expiration_date,
        w.warranty_duration_months,
        (w.expiration_date - CURRENT_DATE) as days_remaining,
        r.merchant_name
      FROM warranty_alerts wa
      JOIN warranties w ON wa.warranty_id = w.id
      LEFT JOIN receipts r ON w.receipt_id = r.id
      WHERE wa.user_id = $1
      ORDER BY w.expiration_date ASC
    `;

        const result = await db.query(query, [authResult.userId]);

        return NextResponse.json({
            alerts: result.rows,
            total: result.rows.length,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des alertes:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la récupération des alertes",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/alerts
 * API désactivée - Table warranty_alerts non disponible
 */
export async function POST(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité alertes non disponible" },
        { status: 501 }
    );
}

/**
 * POST /api/alerts (version originale désactivée)
 * Crée une nouvelle alerte pour une garantie
 */
export async function POST_DISABLED(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || !authResult.userId) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { warranty_id, alert_days_before } = body;

        // Validation
        if (!warranty_id) {
            return NextResponse.json(
                { error: "warranty_id requis" },
                { status: 400 }
            );
        }

        // Vérifier que la garantie appartient à l'utilisateur
        const warrantyCheck = await db.query(
            `SELECT id FROM warranties WHERE id = $1 AND user_id = $2`,
            [warranty_id, authResult.userId]
        );

        if (warrantyCheck.rows.length === 0) {
            return NextResponse.json(
                { error: "Garantie non trouvée" },
                { status: 404 }
            );
        }

        // Vérifier si une alerte existe déjà pour cette garantie
        const existingAlert = await db.query(
            `SELECT id FROM warranty_alerts WHERE warranty_id = $1 AND user_id = $2`,
            [warranty_id, authResult.userId]
        );

        if (existingAlert.rows.length > 0) {
            return NextResponse.json(
                { error: "Une alerte existe déjà pour cette garantie" },
                { status: 409 }
            );
        }

        const result = await db.query(
            `INSERT INTO warranty_alerts (
        user_id,
        warranty_id,
        alert_days_before,
        is_active
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
            [
                authResult.userId,
                warranty_id,
                alert_days_before || 30,
                true,
            ]
        );

        return NextResponse.json({
            success: true,
            alert: result.rows[0],
        });
    } catch (error) {
        console.error("Erreur lors de la création de l'alerte:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la création de l'alerte",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/alerts/:id
 * API désactivée - Table warranty_alerts non disponible
 */
export async function PUT(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité alertes non disponible" },
        { status: 501 }
    );
}

/**
 * PUT /api/alerts/:id (version originale désactivée)
 * Met à jour une alerte
 */
export async function PUT_DISABLED(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || !authResult.userId) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { id, alert_days_before, is_active } = body;

        if (!id) {
            return NextResponse.json(
                { error: "ID d'alerte requis" },
                { status: 400 }
            );
        }

        // Vérifier que l'alerte appartient à l'utilisateur
        const checkResult = await db.query(
            `SELECT id FROM warranty_alerts WHERE id = $1 AND user_id = $2`,
            [id, authResult.userId]
        );

        if (checkResult.rows.length === 0) {
            return NextResponse.json(
                { error: "Alerte non trouvée" },
                { status: 404 }
            );
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (alert_days_before !== undefined) {
            updates.push(`alert_days_before = $${paramIndex++}`);
            values.push(alert_days_before);
        }
        if (is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(is_active);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: "Aucune mise à jour fournie" },
                { status: 400 }
            );
        }

        values.push(id, authResult.userId);
        const result = await db.query(
            `UPDATE warranty_alerts 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
       RETURNING *`,
            values
        );

        return NextResponse.json({
            success: true,
            alert: result.rows[0],
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'alerte:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la mise à jour de l'alerte",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/alerts/:id
 * API désactivée - Table warranty_alerts non disponible
 */
export async function DELETE(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité alertes non disponible" },
        { status: 501 }
    );
}

/**
 * DELETE /api/alerts/:id (version originale désactivée)
 * Supprime une alerte
 */
export async function DELETE_DISABLED(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (!authResult.authenticated || !authResult.userId) {
            return NextResponse.json(
                { error: "Non authentifié" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "ID d'alerte requis" },
                { status: 400 }
            );
        }

        const result = await db.query(
            `DELETE FROM warranty_alerts 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
            [id, authResult.userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Alerte non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Alerte supprimée avec succès",
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'alerte:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la suppression de l'alerte",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}
