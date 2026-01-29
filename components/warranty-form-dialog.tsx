"use client";

import { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";

type Receipt = {
    id: number;
    merchant_name: string;
    transaction_date: string;
    total_amount: number;
    has_warranty: boolean;
};

type WarrantyFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
};

export function WarrantyFormDialog({
    open,
    onOpenChange,
    onSuccess,
}: WarrantyFormDialogProps) {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [selectedReceiptId, setSelectedReceiptId] = useState<string>("");
    const [productName, setProductName] = useState<string>("");
    const [warrantyMonths, setWarrantyMonths] = useState<string>("24");
    const [notes, setNotes] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [loadingReceipts, setLoadingReceipts] = useState(true);

    useEffect(() => {
        if (open) {
            fetchReceipts();
        }
    }, [open]);

    const fetchReceipts = async () => {
        try {
            setLoadingReceipts(true);
            const res = await fetch("/api/receipts?limit=100");
            if (res.ok) {
                const data = await res.json();
                setReceipts(data.receipts || []);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des tickets:", error);
        } finally {
            setLoadingReceipts(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedReceiptId || !productName || !warrantyMonths) {
            alert("Veuillez remplir tous les champs requis");
            return;
        }

        setLoading(true);

        try {
            // Trouver le ticket sélectionné pour obtenir la date d'achat
            const selectedReceipt = receipts.find(
                (r) => r.id.toString() === selectedReceiptId
            );

            if (!selectedReceipt) {
                alert("Ticket non trouvé");
                return;
            }

            const res = await fetch("/api/warranties", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    receipt_id: parseInt(selectedReceiptId),
                    product_name: productName,
                    purchase_date: selectedReceipt.transaction_date,
                    warranty_duration_months: parseInt(warrantyMonths),
                    notes: notes || null,
                }),
            });

            if (res.ok) {
                onSuccess();
                onOpenChange(false);
                // Réinitialiser le formulaire
                setSelectedReceiptId("");
                setProductName("");
                setWarrantyMonths("24");
                setNotes("");
            } else {
                const data = await res.json();
                alert(data.error || "Erreur lors de la création de la garantie");
            }
        } catch (error) {
            console.error("Erreur:", error);
            alert("Erreur lors de la création de la garantie");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Créer une garantie à partir d'un ticket</DialogTitle>
                    <DialogDescription>
                        Sélectionnez un ticket de caisse et ajoutez les informations de garantie du produit.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="receipt">Ticket de caisse *</Label>
                            {loadingReceipts ? (
                                <p className="text-sm text-muted-foreground">Chargement des tickets...</p>
                            ) : (
                                <Select
                                    value={selectedReceiptId}
                                    onValueChange={setSelectedReceiptId}
                                >
                                    <SelectTrigger id="receipt">
                                        <SelectValue placeholder="Sélectionner un ticket" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {receipts.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">
                                                Aucun ticket disponible
                                            </div>
                                        ) : (
                                            receipts.map((receipt) => (
                                                <SelectItem
                                                    key={receipt.id}
                                                    value={receipt.id.toString()}
                                                    disabled={receipt.has_warranty}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {receipt.merchant_name} - {receipt.total_amount.toFixed(2)} €
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(receipt.transaction_date).toLocaleDateString("fr-FR")}
                                                            {receipt.has_warranty && " (Garantie déjà créée)"}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="product">Nom du produit *</Label>
                            <Input
                                id="product"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="Ex: Aspirateur Dyson V11"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="months">Durée de la garantie (mois) *</Label>
                            <Input
                                id="months"
                                type="number"
                                min="1"
                                max="120"
                                value={warrantyMonths}
                                onChange={(e) => setWarrantyMonths(e.target.value)}
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Durée typique : 12 mois (1 an), 24 mois (2 ans), 36 mois (3 ans)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optionnel)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Ex: Garantie constructeur, extension de garantie incluse..."
                                rows={3}
                            />
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
                        <Button type="submit" disabled={loading || !selectedReceiptId || !productName}>
                            {loading ? "Création..." : "Créer la garantie"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
