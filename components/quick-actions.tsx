"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, AlertTriangle } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button className="flex-col h-20 gap-2">
          <PlusCircle className="w-5 h-5" />
          Ajouter un ticket
        </Button>
        <Button variant="outline" className="flex-col h-20 gap-2">
          <Camera className="w-5 h-5" />
          Scanner
        </Button>
        <Button variant="outline" className="flex-col h-20 gap-2 col-span-2">
          <AlertTriangle className="w-5 h-5" />
          Garanties bientôt expirées
        </Button>
      </CardContent>
    </Card>
  );
}
