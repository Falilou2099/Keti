"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Receipt, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReceiptRecord {
  id: number;
  merchant_name: string | null;
  transaction_date: string | null;
  total_amount: number | null;
  is_authentic: boolean;
  confidence_score: number;
  items: Array<{ name: string; quantity?: number; price?: number }>;
  suspicious_elements: string[];
  analysis: string;
  created_at: string;
}

export function ReceiptHistory() {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReceipts();
  }, []);

  /**
   * Récupère l'historique des tickets scannés
   */
  const fetchReceipts = async () => {
    try {
      const response = await fetch("/api/receipts/scan");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la récupération");
      }

      setReceipts(data.receipts);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (receipts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Aucun ticket scanné pour le moment
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Scannez votre premier ticket pour commencer
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Historique des scans</CardTitle>
          <CardDescription>
            {receipts.length} ticket{receipts.length > 1 ? "s" : ""} scanné{receipts.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
      </Card>

      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <Card key={receipt.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {receipt.is_authentic ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      {receipt.merchant_name || "Commerçant inconnu"}
                    </CardTitle>
                    <CardDescription>
                      Scanné le {new Date(receipt.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={receipt.is_authentic ? "default" : "destructive"}
                  >
                    {receipt.confidence_score}% confiance
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Informations principales */}
                <div className="grid grid-cols-2 gap-4">
                  {receipt.transaction_date && (
                    <div>
                      <p className="text-sm text-muted-foreground">Date du ticket</p>
                      <p className="font-medium">
                        {new Date(receipt.transaction_date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  )}
                  {receipt.total_amount !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground">Montant</p>
                      <p className="font-medium text-lg">
                        {receipt.total_amount.toFixed(2)} €
                      </p>
                    </div>
                  )}
                </div>

                {/* Articles */}
                {receipt.items && receipt.items.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">
                        Articles ({receipt.items.length})
                      </h4>
                      <div className="space-y-1">
                        {receipt.items.slice(0, 3).map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm p-2 bg-accent/30 rounded"
                          >
                            <span>{item.name}</span>
                            {item.price !== undefined && (
                              <span className="font-medium">
                                {item.price.toFixed(2)} €
                              </span>
                            )}
                          </div>
                        ))}
                        {receipt.items.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center pt-1">
                            +{receipt.items.length - 3} article(s) supplémentaire(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Éléments suspects */}
                {receipt.suspicious_elements && receipt.suspicious_elements.length > 0 && (
                  <>
                    <Separator />
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-semibold mb-1">Éléments suspects :</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {receipt.suspicious_elements.map((element, index) => (
                            <li key={index}>{element}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </>
                )}

                {/* Analyse */}
                {receipt.analysis && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">Analyse</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {receipt.analysis}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
