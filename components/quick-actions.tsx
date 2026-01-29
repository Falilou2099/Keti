"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Camera, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReceiptScanner } from "@/components/receipt-scanner";

export function QuickActions() {
  const router = useRouter();
  const [showScanner, setShowScanner] = useState(false);

  const handleAddTicket = () => {
    setShowScanner(true);
  };

  const handleScanner = () => {
    setShowScanner(true);
  };

  const handleWarranties = () => {
    router.push("/dashboard/alerts");
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          <Button className="flex-col h-20 gap-2" onClick={handleAddTicket}>
            <PlusCircle className="w-5 h-5" />
            Ajouter un ticket
          </Button>
          <Button variant="outline" className="flex-col h-20 gap-2" onClick={handleScanner}>
            <Camera className="w-5 h-5" />
            Scanner
          </Button>
          <Button variant="outline" className="flex-col h-20 gap-2 col-span-2" onClick={handleWarranties}>
            <AlertTriangle className="w-5 h-5" />
            Garanties bientôt expirées
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scanner un ticket</DialogTitle>
          </DialogHeader>
          <ReceiptScanner />
        </DialogContent>
      </Dialog>
    </>
  );
}
