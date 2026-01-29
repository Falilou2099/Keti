"use client";

import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { ReceiptAnalysis } from "@/lib/gemini";

interface AnalysisResult extends ReceiptAnalysis {
  id: number;
  created_at: string;
}

export function ReceiptScanner() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Convertit un fichier image en base64
   */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Compresse une image pour optimiser l'upload
   */
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/jpeg' as const,
    };

    try {
      console.log(`📦 Compression de l'image (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
      const compressedFile = await imageCompression(file, options);
      console.log(`✅ Image compressée (${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`);
      return compressedFile;
    } catch (error) {
      console.error('Erreur lors de la compression:', error);
      return file; // Retourne le fichier original en cas d'erreur
    }
  };

  /**
   * Gère la sélection d'un fichier image
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation du type de fichier
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner une image valide");
      return;
    }

    // Validation de la taille (max 10MB avant compression)
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10MB");
      return;
    }

    try {
      setError(null);
      setResult(null);
      setIsCompressing(true);

      // Compresser l'image avant de la convertir en base64
      const compressedFile = await compressImage(file);
      setIsCompressing(false);

      const base64 = await fileToBase64(compressedFile);
      setPreviewImage(base64);
      await analyzeReceipt(base64);
    } catch (err) {
      setIsCompressing(false);
      setError("Erreur lors du chargement de l'image");
      console.error(err);
    }
  };

  /**
   * Envoie l'image au backend pour analyse
   */
  const analyzeReceipt = async (imageBase64: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/receipts/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageBase64 }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de l'analyse");
      }

      const data = await response.json();
      setResult(data.receipt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'analyse du ticket");
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  /**
   * Réinitialise le scanner pour une nouvelle analyse
   */
  const resetScanner = () => {
    setResult(null);
    setError(null);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /**
   * Obtient la couleur du badge en fonction du score de confiance
   */
  const getConfidenceBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scanner un ticket de caisse</CardTitle>
          <CardDescription>
            Téléchargez une photo de votre ticket pour une analyse IA automatique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Zone d'upload */}
          {!previewImage && (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <div className="p-4 bg-primary/10 rounded-full">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-medium">Cliquez pour télécharger</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    JPEG, PNG, GIF ou WebP (max 5MB)
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Prévisualisation de l'image */}
          {previewImage && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={previewImage}
                  alt="Ticket de caisse"
                  className="w-full h-auto max-h-96 object-contain bg-muted"
                />
              </div>
              {!isAnalyzing && !result && (
                <Button onClick={resetScanner} variant="outline" className="w-full">
                  Changer d'image
                </Button>
              )}
            </div>
          )}

          {/* État de chargement */}
          {(isCompressing || isAnalyzing) && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                {isCompressing ? "Compression de l'image..." : "Analyse en cours... L'IA examine votre ticket."}
              </AlertDescription>
            </Alert>
          )}

          {/* Erreur */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Résultats de l'analyse */}
      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Résultats de l'analyse</CardTitle>
              <Badge variant={result.is_authentic ? "default" : "destructive"}>
                {result.is_authentic ? (
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                ) : (
                  <AlertTriangle className="w-4 h-4 mr-1" />
                )}
                {result.is_authentic ? "Authentique" : "Suspect"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations principales */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Commerçant</p>
                <p className="font-medium">{result.merchant_name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {new Date(result.transaction_date).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Montant total</p>
                <p className="font-medium text-lg">{result.total_amount.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Score de confiance</p>
                <Badge variant={getConfidenceBadgeVariant(result.confidence_score)}>
                  {result.confidence_score}%
                </Badge>
              </div>
            </div>

            {/* Articles */}
            {result.items.length > 0 && (
              <div>
                <h4 className="font-medium mb-3">Articles détectés</h4>
                <div className="space-y-2">
                  {result.items.map((item, index) => (
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
            {result.suspicious_elements.length > 0 && (
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Éléments suspects détectés
                </h4>
                <div className="space-y-2">
                  {result.suspicious_elements.map((element, index) => (
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

            {/* Analyse détaillée */}
            <div>
              <h4 className="font-medium mb-2">Analyse détaillée</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {result.analysis}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={resetScanner} className="flex-1">
                <Camera className="w-4 h-4 mr-2" />
                Scanner un autre ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
