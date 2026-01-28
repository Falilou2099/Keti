"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export function AccountOverview({ userName }: { userName: string }) {
  const cards = [
    { title: "Solde actuel", value: "12 458,32 €", change: "+2.5%", trend: "up", icon: Wallet },
    { title: "Dépenses du mois", value: "2 341,00 €", change: "-12%", trend: "down", icon: TrendingDown },
    { title: "Revenus du mois", value: "4 200,00 €", change: "+5%", trend: "up", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground border-0">
        <CardContent className="p-6">
          <p className="text-sm opacity-80">Carte principale</p>
          <p className="text-2xl font-bold mt-1">**** **** **** 4532</p>
          <p className="mt-4 text-sm">Titulaire : {userName}</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className={`text-xs mt-1 ${card.trend === "up" ? "text-primary" : "text-destructive"}`}>
                {card.change} vs mois dernier
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
