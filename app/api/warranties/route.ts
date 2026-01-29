import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

/**
 * GET /api/warranties
 * API désactivée - Table warranties non disponible
 */
export async function GET(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité garanties non disponible" },
        { status: 501 }
    );
}

/**
 * GET /api/warranties (version originale désactivée)
 * Récupère toutes les garanties de l'utilisateur
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
        const status = searchParams.get("status") || "all"; // all, active, expired
        const limit = parseInt(searchParams.get("limit") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");

        let query = `
      SELECT 
        w.*,
        r.merchant_name,
        r.total_amount,
        (w.expiration_date - CURRENT_DATE) as days_remaining
      FROM warranties w
      LEFT JOIN receipts r ON w.receipt_id = r.id
      WHERE w.user_id = $1
    `;

        const params: any[] = [authResult.userId];

        // Filtrer par statut
        if (status === "active") {
            query += ` AND w.expiration_date >= CURRENT_DATE`;
        } else if (status === "expired") {
            query += ` AND w.expiration_date < CURRENT_DATE`;
        }

        query += ` ORDER BY w.expiration_date ASC LIMIT $2 OFFSET $3`;
        params.push(limit, offset);

        const result = await db.query(query, params);

        // Compter le total
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM warranties 
      WHERE user_id = $1
      ${status === "active" ? "AND expiration_date >= CURRENT_DATE" : ""}
      ${status === "expired" ? "AND expiration_date < CURRENT_DATE" : ""}
    `;
        const countResult = await db.query(countQuery, [authResult.userId]);

        return NextResponse.json({
            warranties: result.rows,
            total: parseInt(countResult.rows[0].total),
            limit,
            offset,
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des garanties:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la récupération des garanties",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}

/**
 * POST /api/warranties
 * API désactivée - Table warranties non disponible
 */
export async function POST(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité garanties non disponible" },
        { status: 501 }
    );
}

/**
 * POST /api/warranties (version originale désactivée)
 * Crée une nouvelle garantie
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
        const {
            receipt_id,
            product_name,
            purchase_date,
            warranty_duration_months,
            notes,
        } = body;

        // Validation
        if (!product_name || !purchase_date || !warranty_duration_months) {
            return NextResponse.json(
                { error: "Champs requis: product_name, purchase_date, warranty_duration_months" },
                { status: 400 }
            );
        }

        // Calculer la date d'expiration
        const expirationDate = new Date(purchase_date);
        expirationDate.setMonth(expirationDate.getMonth() + warranty_duration_months);

        const result = await db.query(
            `INSERT INTO warranties (
        user_id,
        receipt_id,
        product_name,
        purchase_date,
        warranty_duration_months,
        expiration_date,
        notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
            [
                authResult.userId,
                receipt_id || null,
                product_name,
                purchase_date,
                warranty_duration_months,
                expirationDate.toISOString().split('T')[0],
                notes || null,
            ]
        );

        return NextResponse.json({
            success: true,
            warranty: result.rows[0],
        });
    } catch (error) {
        console.error("Erreur lors de la création de la garantie:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la création de la garantie",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/warranties/:id
 * API désactivée - Table warranties non disponible
 */
export async function PUT(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité garanties non disponible" },
        { status: 501 }
    );
}

/**
 * PUT /api/warranties/:id (version originale désactivée)
 * Met à jour une garantie
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
        const {
            id,
            product_name,
            purchase_date,
            warranty_duration_months,
            notes,
        } = body;

        if (!id) {
            return NextResponse.json(
                { error: "ID de garantie requis" },
                { status: 400 }
            );
        }

        // Vérifier que la garantie appartient à l'utilisateur
        const checkResult = await db.query(
            `SELECT id FROM warranties WHERE id = $1 AND user_id = $2`,
            [id, authResult.userId]
        );

        if (checkResult.rows.length === 0) {
            return NextResponse.json(
                { error: "Garantie non trouvée" },
                { status: 404 }
            );
        }

        // Recalculer la date d'expiration si nécessaire
        let expirationDate = null;
        if (purchase_date && warranty_duration_months) {
            expirationDate = new Date(purchase_date);
            expirationDate.setMonth(expirationDate.getMonth() + warranty_duration_months);
        }

        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (product_name) {
            updates.push(`product_name = $${paramIndex++}`);
            values.push(product_name);
        }
        if (purchase_date) {
            updates.push(`purchase_date = $${paramIndex++}`);
            values.push(purchase_date);
        }
        if (warranty_duration_months) {
            updates.push(`warranty_duration_months = $${paramIndex++}`);
            values.push(warranty_duration_months);
        }
        if (expirationDate) {
            updates.push(`expiration_date = $${paramIndex++}`);
            values.push(expirationDate.toISOString().split('T')[0]);
        }
        if (notes !== undefined) {
            updates.push(`notes = $${paramIndex++}`);
            values.push(notes);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: "Aucune mise à jour fournie" },
                { status: 400 }
            );
        }

        values.push(id, authResult.userId);
        const result = await db.query(
            `UPDATE warranties 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
       RETURNING *`,
            values
        );

        return NextResponse.json({
            success: true,
            warranty: result.rows[0],
        });
    } catch (error) {
        console.error("Erreur lors de la mise à jour de la garantie:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la mise à jour de la garantie",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/warranties/:id
 * API désactivée - Table warranties non disponible
 */
export async function DELETE(request: NextRequest) {
    return NextResponse.json(
        { error: "Fonctionnalité garanties non disponible" },
        { status: 501 }
    );
}

/**
 * DELETE /api/warranties/:id (version originale désactivée)
 * Supprime une garantie
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
                { error: "ID de garantie requis" },
                { status: 400 }
            );
        }

        const result = await db.query(
            `DELETE FROM warranties 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
            [id, authResult.userId]
        );

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: "Garantie non trouvée" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Garantie supprimée avec succès",
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de la garantie:", error);
        return NextResponse.json(
            {
                error: "Erreur lors de la suppression de la garantie",
                details: error instanceof Error ? error.message : "Erreur inconnue",
            },
            { status: 500 }
        );
    }
}
