"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Clock, FileText, CreditCard } from "lucide-react";

export function AccountOverview({ userName }: { userName: string }) {
  const cards = [
    { title: "Tickets enregistrés", value: "18", subtitle: "Total ajoutés", icon: FileText },
    { title: "Garanties actives", value: "12", subtitle: "Liées à cette carte", icon: ShieldCheck },
    { title: "Bientôt expirées", value: "3", subtitle: "Dans les 30 jours", icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Carte bancaire sélectionnée */}
      <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-sm opacity-80">
            <CreditCard className="w-4 h-4" />
            Carte sélectionnée
          </div>

          <p className="text-2xl font-bold mt-1">**** **** **** 4532</p>

          <div className="mt-4 space-y-1 text-sm">
            <p>Titulaire : {userName}</p>
            <p>Garanties actives sur cette carte : 12</p>
            <p>Prochaine expiration : 14/02/2026</p>
          </div>
        </CardContent>
      </Card>

      {/* Cartes KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs mt-1 text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
