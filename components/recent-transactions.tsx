"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ReceiptItem {
  id: number;
  merchant_name: string;
  transaction_date: string;
  total_amount: number;
  is_authentic: boolean;
}

export function RecentTransactions() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchReceipts() {
      try {
        const response = await fetch("/api/receipts?limit=5");
        if (response.ok) {
          const data = await response.json();
          setReceipts(data.receipts || []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des tickets:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReceipts();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Derniers tickets scannés</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push("/dashboard/receipts")}
        >
          Voir tous
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4 text-muted-foreground">Chargement...</div>
        ) : receipts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Aucun ticket scanné</p>
            <p className="text-xs mt-1">Commencez par scanner votre premier ticket</p>
          </div>
        ) : (
          receipts.map((receipt) => (
            <div 
              key={receipt.id} 
              className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/50 cursor-pointer"
              onClick={() => router.push("/dashboard/receipts")}
            >
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">{receipt.merchant_name || "Commerçant inconnu"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(receipt.transaction_date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {receipt.total_amount ? receipt.total_amount.toFixed(2) : "0.00"}€
                </p>
                {receipt.is_authentic && (
                  <p className="text-xs text-green-600">✓ Authentique</p>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
