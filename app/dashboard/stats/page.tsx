"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, PieChart, ShieldAlert, Brain } from "lucide-react";

export default function StatsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Statistiques & Analyses</h1>
        <p className="text-muted-foreground">
          Visualisez l’évolution de vos achats et l’efficacité réelle de vos garanties.
        </p>
      </div>

      {/* Graphe principal */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <CardTitle>Valeur des achats sous garantie dans le temps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            (Courbe montrant les pics d’achats et périodes à forte valeur garantie)
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" />
            <CardTitle>Répartition des garanties par catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              (Camembert : Électroménager, High-tech, Auto, Autres…)
            </div>
          </CardContent>
        </Card>

        {/* Statut garanties */}
        <Card>
          <CardHeader className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <CardTitle>Garanties actives vs expirées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              (Barres : Actives, Expirent bientôt, Expirées)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse intelligente */}
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <CardTitle>Analyse intelligente KETI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            🔍 <strong>Aspirateur Darty (2024)</strong> : ce type de produit présente un taux de panne
            inférieur à 5% sur 3 ans. L’extension de garantie achetée a peu de chances d’être utilisée.
          </p>
          <p>
            ⚠️ <strong>Batterie auto Norauto</strong> : statistiquement, 32% des batteries similaires
            montrent une défaillance après 18 à 24 mois. Votre garantie expire dans 2 mois.
          </p>
          <p>
            💳 <strong>Carte Visa Pro</strong> : votre carte offre déjà une extension de garantie d’un an
            sur l’électroménager. Une garantie payante supplémentaire pourrait être redondante.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
