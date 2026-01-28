"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, Scan, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { ReceiptAnalysisResult } from "@/lib/gemini";

export function ReceiptScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ReceiptAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Gère la sélection d'un fichier image
   */
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide");
      return;
    }

    // Convertir en base64 pour l'affichage et l'envoi
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setAnalysisResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Lance l'analyse du ticket via l'API
   */
  const handleScanReceipt = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setError(null);

    try {
      const response = await fetch("/api/receipts/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: selectedImage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'analyse");
      }

      setAnalysisResult(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse du ticket");
    } finally {
      setIsScanning(false);
    }
  };

  /**
   * Réinitialise le scanner
   */
  const handleReset = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="w-5 h-5" />
            Scanner un ticket de caisse
          </CardTitle>
          <CardDescription>
            Vérifiez l'authenticité de vos tickets de caisse en les scannant avec l'IA
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zone d'upload */}
          <div className="flex flex-col items-center gap-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="receipt-upload"
            />
            
            {!selectedImage ? (
              <label
                htmlFor="receipt-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
              >
                <Upload className="w-12 h-12 mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner une image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG ou JPEG (max. 10MB)
                </p>
              </label>
            ) : (
              <div className="w-full space-y-4">
                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                  <img
                    src={selectedImage}
                    alt="Ticket sélectionné"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleScanReceipt}
                    disabled={isScanning}
                    className="flex-1"
                  >
                    {isScanning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyse en cours...
                      </>
                    ) : (
                      <>
                        <Scan className="w-4 h-4 mr-2" />
                        Analyser le ticket
                      </>
                    )}
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    Nouveau scan
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Résultats de l'analyse */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {analysisResult.isAuthentic ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  Ticket authentique
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  Ticket suspect
                </>
              )}
            </CardTitle>
            <CardDescription>
              Confiance : {analysisResult.confidence}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-2 gap-4">
              {analysisResult.merchantName && (
                <div>
                  <p className="text-sm text-muted-foreground">Commerçant</p>
                  <p className="font-medium">{analysisResult.merchantName}</p>
                </div>
              )}
              {analysisResult.date && (
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {new Date(analysisResult.date).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              )}
              {analysisResult.totalAmount !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">Montant total</p>
                  <p className="font-medium text-lg">
                    {analysisResult.totalAmount.toFixed(2)} €
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Statut</p>
                <Badge
                  variant={analysisResult.isAuthentic ? "default" : "destructive"}
                  className="mt-1"
                >
                  {analysisResult.isAuthentic ? "Authentique" : "Suspect"}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Articles */}
            {analysisResult.items && analysisResult.items.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3">Articles détectés</h4>
                <div className="space-y-2">
                  {analysisResult.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-accent/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{item.name}</p>
                        {item.quantity && (
                          <p className="text-sm text-muted-foreground">
                            Quantité : {item.quantity}
                          </p>
                        )}
                      </div>
                      {item.price !== undefined && (
                        <p className="font-semibold">{item.price.toFixed(2)} €</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Éléments suspects */}
            {analysisResult.suspiciousElements &&
              analysisResult.suspiciousElements.length > 0 && (
                <>
                  <Separator />
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Éléments suspects détectés</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {analysisResult.suspiciousElements.map((element, index) => (
                          <li key={index}>{element}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                </>
              )}

            <Separator />

            {/* Analyse détaillée */}
            <div>
              <h4 className="font-semibold mb-2">Analyse détaillée</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysisResult.analysis}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
