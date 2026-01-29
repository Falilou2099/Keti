"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertTriangle, ChevronRight, Calendar, Store, Euro } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ReceiptAnalysis } from "@/lib/gemini";

interface Receipt extends ReceiptAnalysis {
  id: number;
  created_at: string;
}

export function ReceiptHistory() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReceipts();
  }, []);

  /**
   * Récupère l'historique des tickets depuis l'API
   */
  const fetchReceipts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/receipts/scan?limit=50&offset=0");
      
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des tickets");
      }

      const data = await response.json();
      setReceipts(data.receipts);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Obtient la variante du badge en fonction de l'authenticité
   */
  const getAuthBadgeVariant = (isAuthentic: boolean) => {
    return isAuthentic ? "default" : "destructive";
  };

  /**
   * Obtient la variante du badge en fonction du score de confiance
   */
  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (receipts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des tickets</CardTitle>
          <CardDescription>Aucun ticket scanné pour le moment</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Commencez par scanner votre premier ticket dans l'onglet "Scanner"
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Historique des tickets</CardTitle>
          <CardDescription>
            {total} ticket{total > 1 ? "s" : ""} scanné{total > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setSelectedReceipt(receipt)}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <Store className="w-4 h-4 text-muted-foreground" />
                    <p className="font-medium">{receipt.merchant_name}</p>
                    <Badge variant={getAuthBadgeVariant(receipt.is_authentic)}>
                      {receipt.is_authentic ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 mr-1" />
                      )}
                      {receipt.is_authentic ? "Authentique" : "Suspect"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(receipt.transaction_date).toLocaleDateString("fr-FR")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="w-3 h-3" />
                      {receipt.total_amount.toFixed(2)} €
                    </div>
                    <Badge variant={getConfidenceBadgeVariant(receipt.confidence_score)} className="text-xs">
                      {receipt.confidence_score}%
                    </Badge>
                  </div>
                </div>
                
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de détails */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedReceipt && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedReceipt.merchant_name}
                  <Badge variant={getAuthBadgeVariant(selectedReceipt.is_authentic)}>
                    {selectedReceipt.is_authentic ? (
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertTriangle className="w-3 h-3 mr-1" />
                    )}
                    {selectedReceipt.is_authentic ? "Authentique" : "Suspect"}
                  </Badge>
                </DialogTitle>
                <DialogDescription>
                  Scanné le {new Date(selectedReceipt.created_at).toLocaleDateString("fr-FR")} à{" "}
                  {new Date(selectedReceipt.created_at).toLocaleTimeString("fr-FR")}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Informations principales */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Date de transaction</p>
                    <p className="font-medium">
                      {new Date(selectedReceipt.transaction_date).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Montant total</p>
                    <p className="font-medium text-lg">{selectedReceipt.total_amount.toFixed(2)} €</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Score de confiance</p>
                    <Badge variant={getConfidenceBadgeVariant(selectedReceipt.confidence_score)}>
                      {selectedReceipt.confidence_score}%
                    </Badge>
                  </div>
                </div>

                {/* Articles */}
                {selectedReceipt.items.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3">Articles</h4>
                    <div className="space-y-2">
                      {selectedReceipt.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} × {item.unit_price.toFixed(2)} €
                            </p>
                          </div>
                          <p className="font-medium">{item.total_price.toFixed(2)} €</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Éléments suspects */}
                {selectedReceipt.suspicious_elements.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-destructive" />
                      Éléments suspects
                    </h4>
                    <div className="space-y-2">
                      {selectedReceipt.suspicious_elements.map((element, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertDescription>
                            <p className="font-medium">{element.type}</p>
                            <p className="text-sm mt-1">{element.description}</p>
                            <Badge variant="outline" className="mt-2">
                              Gravité: {element.severity}
                            </Badge>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analyse */}
                <div>
                  <h4 className="font-medium mb-2">Analyse détaillée</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedReceipt.analysis}
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
