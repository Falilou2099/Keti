"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, ShoppingCart, Coffee, Car } from "lucide-react";

export function RecentTransactions({ onViewReceipt }: { onViewReceipt: () => void }) {
  const data = [
    { merchant: "Carrefour", amount: -87.54, icon: ShoppingCart },
    { merchant: "Starbucks", amount: -5.9, icon: Coffee },
    { merchant: "Total", amount: -65, icon: Car },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transactions récentes</CardTitle>
        <Button variant="outline" size="sm" onClick={onViewReceipt}>Voir tickets</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((t, i) => (
          <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/50">
            <div className="flex items-center gap-3">
              <t.icon className="w-5 h-5 text-primary" />
              <span>{t.merchant}</span>
            </div>
            <span className="font-semibold">{t.amount.toFixed(2)} €</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
