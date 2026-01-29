"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldOff } from "lucide-react";

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

type Alert = {
    id: number;
    warranty_id: number;
    alert_days_before: number;
    is_active: boolean;
    product_name: string;
    expiration_date: string;
    days_remaining: number;
    merchant_name?: string;
};

export default function AlertsPage() {

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Alertes de garanties</h1>
                    <p className="text-muted-foreground">
                        Fonctionnalité temporairement indisponible
                    </p>
                </div>
            </div>

            <Card>
                <CardContent className="py-16">
                    <div className="text-center text-muted-foreground">
                        <ShieldOff className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Fonctionnalité en cours de développement</h3>
                        <p>La gestion des garanties et des alertes sera bientôt disponible.</p>
                        <p className="text-sm mt-2">Pour l'instant, concentrez-vous sur le scan et la gestion de vos tickets de caisse.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
