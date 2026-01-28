"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Send, QrCode } from "lucide-react";

export function QuickActions({ onAddReceipt }: { onAddReceipt: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions rapides</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Button onClick={onAddReceipt} className="flex-col h-20 gap-2">
          <Receipt className="w-5 h-5" />
          Ticket
        </Button>
        <Button variant="outline" className="flex-col h-20 gap-2">
          <Send className="w-5 h-5" />
          Virement
        </Button>
        <Button variant="outline" className="flex-col h-20 gap-2 col-span-2">
          <QrCode className="w-5 h-5" />
          QR Code
        </Button>
      </CardContent>
    </Card>
  );
}
