"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Laptop, ShoppingBag, Car } from "lucide-react";

export function RecentTransactions() {
  const data = [
    { merchant: "Darty", info: "Garantie jusqu'au 12/2026", icon: Laptop },
    { merchant: "Fnac", info: "Garantie jusqu'au 05/2025", icon: ShoppingBag },
    { merchant: "Norauto", info: "Garantie jusqu'au 08/2027", icon: Car },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Derniers tickets ajoutés</CardTitle>
        <Button variant="outline" size="sm">Voir tous</Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((t, i) => (
          <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-secondary/50">
            <div className="flex items-center gap-3">
              <t.icon className="w-5 h-5 text-primary" />
              <span>{t.merchant}</span>
            </div>
            <span className="text-sm text-muted-foreground">{t.info}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
