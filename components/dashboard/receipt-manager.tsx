"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReceiptScanner } from "./receipt-scanner";
import { ReceiptHistory } from "./receipt-history";

export function ReceiptManager() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="scanner">Scanner</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="scanner" className="mt-6">
          <ReceiptScanner />
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <ReceiptHistory />
        </TabsContent>
      </Tabs>
    </div>
  );
}
