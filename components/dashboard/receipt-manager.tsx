"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReceiptManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des tickets</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Ici tu pourras gérer, uploader et analyser tous tes tickets de caisse.
        </p>
      </CardContent>
    </Card>
  );
}
