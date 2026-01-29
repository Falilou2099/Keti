"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type Warranty = {
    id: number;
    product_name: string;
    expiration_date: string;
    merchant_name?: string;
};

type AlertFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    warranties: Warranty[];
    onSuccess: () => void;
};

export function AlertFormDialog({
    open,
    onOpenChange,
    warranties,
    onSuccess,
}: AlertFormDialogProps) {
    const [selectedWarrantyId, setSelectedWarrantyId] = useState<string>("");
    const [alertDaysBefore, setAlertDaysBefore] = useState<string>("30");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedWarrantyId) {
            alert("Veuillez sélectionner une garantie");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/alerts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    warranty_id: parseInt(selectedWarrantyId),
                    alert_days_before: parseInt(alertDaysBefore),
                }),
            });

            if (res.ok) {
                onSuccess();
                onOpenChange(false);
                setSelectedWarrantyId("");
                setAlertDaysBefore("30");
            } else {
                const data = await res.json();
                alert(data.error || "Erreur lors de la création de l'alerte");
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la création de l'alerte");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Créer une alerte de garantie</DialogTitle>
                    <DialogDescription>
                        Sélectionnez une garantie et configurez quand vous souhaitez être alerté avant son expiration.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="warranty">Garantie</Label>
                            <Select
                                value={selectedWarrantyId}
                                onValueChange={setSelectedWarrantyId}
                            >
                                <SelectTrigger id="warranty">
                                    <SelectValue placeholder="Sélectionner une garantie" />
                                </SelectTrigger>
                                <SelectContent>
                                    {warranties.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Aucune garantie disponible
                                        </div>
                                    ) : (
                                        warranties.map((warranty) => (
                                            <SelectItem key={warranty.id} value={warranty.id.toString()}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{warranty.product_name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {warranty.merchant_name && `${warranty.merchant_name} • `}
                                                        Expire le {new Date(warranty.expiration_date).toLocaleDateString("fr-FR")}
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="days">Alerter combien de jours avant l'expiration ?</Label>
                            <Input
                                id="days"
                                type="number"
                                min="1"
                                max="365"
                                value={alertDaysBefore}
                                onChange={(e) => setAlertDaysBefore(e.target.value)}
                                placeholder="30"
                            />
                            <p className="text-xs text-muted-foreground">
                                Vous serez notifié {alertDaysBefore} jour(s) avant l'expiration de la garantie
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={loading || !selectedWarrantyId}>
                            {loading ? "Création..." : "Créer l'alerte"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
