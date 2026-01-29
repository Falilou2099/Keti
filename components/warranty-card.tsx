"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ShieldCheck,
    Calendar,
    Store,
    Bell,
    Trash2,
} from "lucide-react";

type Warranty = {
    id: number;
    product_name: string;
    purchase_date: string;
    expiration_date: string;
    warranty_duration_months: number;
    merchant_name?: string;
    days_remaining: number;
    notes?: string;
};

type WarrantyCardProps = {
    warranty: Warranty;
    onRefresh: () => void;
};

export function WarrantyCard({ warranty, onRefresh }: WarrantyCardProps) {
    const getUrgencyColor = (daysRemaining: number) => {
        if (daysRemaining < 0) return "text-gray-500";
        if (daysRemaining <= 7) return "text-red-600";
        if (daysRemaining <= 30) return "text-orange-600";
        return "text-green-600";
    };

    const getUrgencyBadge = (daysRemaining: number) => {
        if (daysRemaining < 0) return <Badge variant="secondary">Expirée</Badge>;
        if (daysRemaining <= 7) return <Badge variant="destructive">Urgent</Badge>;
        if (daysRemaining <= 30) return <Badge className="bg-orange-500">Bientôt</Badge>;
        return <Badge className="bg-green-500">Actif</Badge>;
    };

    const handleCreateAlert = async () => {
        try {
            const res = await fetch("/api/alerts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    warranty_id: warranty.id,
                    alert_days_before: 30,
                }),
            });

            if (res.ok) {
                alert("Alerte créée avec succès !");
                onRefresh();
            } else {
                const data = await res.json();
                alert(data.error || "Erreur lors de la création de l'alerte");
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la création de l'alerte");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette garantie ?")) {
            return;
        }

        try {
            const res = await fetch(`/api/warranties?id=${warranty.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                onRefresh();
            } else {
                alert("Erreur lors de la suppression de la garantie");
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la suppression de la garantie");
        }
    };

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
                <div className="space-y-3">
                    {/* En-tête avec badge */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className={`w-5 h-5 ${getUrgencyColor(warranty.days_remaining)}`} />
                            <div>
                                <h3 className="font-semibold">{warranty.product_name}</h3>
                                {warranty.merchant_name && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Store className="w-3 h-3" />
                                        {warranty.merchant_name}
                                    </p>
                                )}
                            </div>
                        </div>
                        {getUrgencyBadge(warranty.days_remaining)}
                    </div>

                    {/* Informations */}
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                                Achat: {new Date(warranty.purchase_date).toLocaleDateString("fr-FR")}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>
                                Expire: {new Date(warranty.expiration_date).toLocaleDateString("fr-FR")}
                            </span>
                        </div>
                        <div className={`font-semibold ${getUrgencyColor(warranty.days_remaining)}`}>
                            {warranty.days_remaining >= 0
                                ? `${warranty.days_remaining} jours restants`
                                : "Expirée"}
                        </div>
                    </div>

                    {/* Notes */}
                    {warranty.notes && (
                        <p className="text-sm text-muted-foreground border-t pt-2">
                            {warranty.notes}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={handleCreateAlert}
                        >
                            <Bell className="w-4 h-4 mr-1" />
                            Créer alerte
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                        >
                            <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
