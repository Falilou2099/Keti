"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SpendingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des garanties</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-40 flex items-center justify-center text-muted-foreground">
          (Graphique par catégorie / date d’expiration à venir)
        </div>
      </CardContent>
    </Card>
  );
}
