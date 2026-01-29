"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Receipt, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";

interface AccountStats {
  totalReceipts: number;
  totalAmount: number;
  authenticReceipts: number;
}

export function AccountOverview({ userName }: { userName: string }) {
  const [stats, setStats] = useState<AccountStats>({
    totalReceipts: 0,
    totalAmount: 0,
    authenticReceipts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/receipts?limit=1000");
        if (response.ok) {
          const data = await response.json();
          const receipts = data.receipts || [];
          
          setStats({
            totalReceipts: receipts.length,
            totalAmount: receipts.reduce((sum: number, r: any) => {
              const amount = parseFloat(r.total_amount);
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0),
            authenticReceipts: receipts.filter((r: any) => r.is_authentic).length,
          });
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const cards = [
    { 
      title: "Tickets enregistrés", 
      value: isLoading ? "..." : stats.totalReceipts.toString(), 
      subtitle: "Total scannés", 
      icon: FileText 
    },
    { 
      title: "Tickets authentiques", 
      value: isLoading ? "..." : stats.authenticReceipts.toString(), 
      subtitle: "Vérifiés par IA", 
      icon: Receipt 
    },
    { 
      title: "Montant total", 
      value: isLoading ? "..." : `${stats.totalAmount.toFixed(2)}€`, 
      subtitle: "Tous les achats", 
      icon: Receipt 
    },
  ];

  return (
    <div className="space-y-6">
      {/* Carte bancaire */}
      <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-sm opacity-90">
              <CreditCard className="w-5 h-5" />
              <span>Carte Bancaire</span>
            </div>
            <div className="text-sm font-semibold opacity-90">VISA</div>
          </div>

          <div className="space-y-6">
            <div className="font-mono text-2xl tracking-wider">
              **** **** **** 4532
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs opacity-70 mb-1">Titulaire</p>
                <p className="font-semibold">{userName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70 mb-1">Expire</p>
                <p className="font-semibold">12/28</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs mt-1 text-muted-foreground">{card.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
