"use client";

import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  PlusCircle,
  ShieldCheck,
  ShieldOff,
  CalendarDays,
  Store,
  Tag,
} from "lucide-react";
import { ReceiptScanner } from "@/components/receipt-scanner";

type WarrantyFilter = "all" | "with" | "without";
type DateFilter = "7d" | "30d" | "custom";

type Ticket = {
  id: string;
  merchant: string;
  product: string;
  amount: number;
  dateISO: string;
  hasWarranty: boolean;
};

function toCurrencyEUR(value: number | null | undefined) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0,00 €";
  }
  return `${value.toFixed(2).replace(".", ",")} €`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

export default function ReceiptsPage() {
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("30d");
  const [customFrom, setCustomFrom] = useState(daysAgo(30));
  const [customTo, setCustomTo] = useState(new Date().toISOString().slice(0, 10));
  const [warrantyFilter, setWarrantyFilter] = useState<WarrantyFilter>("all");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  // Récupérer les tickets depuis la base de données
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/receipts");
        if (!response.ok) {
          console.error("Erreur API:", response.status, response.statusText);
          setTickets([]);
          return;
        }
        const data = await response.json();

        // Mapper les données de l'API vers le format attendu par le composant
        const mappedTickets: Ticket[] = (data.receipts || []).map((receipt: any) => ({
          id: receipt.id?.toString() || "0",
          merchant: receipt.merchant_name || "Magasin inconnu",
          product: receipt.items && receipt.items.length > 0
            ? receipt.items[0].name || "Produit"
            : "Divers",
          amount: parseFloat(receipt.total_amount) || 0,
          dateISO: receipt.transaction_date
            ? new Date(receipt.transaction_date).toISOString().slice(0, 10)
            : receipt.created_at
            ? new Date(receipt.created_at).toISOString().slice(0, 10)
            : new Date().toISOString().slice(0, 10),
          hasWarranty: receipt.has_warranty || false,
        }));

        setTickets(mappedTickets);
      } catch (error) {
        console.error("Erreur lors du chargement des tickets:", error);
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, []);

  const filteredTickets = useMemo(() => {
    const q = query.toLowerCase();
    return tickets.filter((t) => {
      if (warrantyFilter === "with" && !t.hasWarranty) return false;
      if (warrantyFilter === "without" && t.hasWarranty) return false;
      return (
        t.merchant.toLowerCase().includes(q) ||
        t.product.toLowerCase().includes(q) ||
        t.dateISO.includes(q)
      );
    });
  }, [query, warrantyFilter, tickets]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tickets de caisse</h1>
          <p className="text-muted-foreground">
            Rechercher et filtrer vos tickets et garanties
          </p>
        </div>
        <Button onClick={() => setScannerOpen(true)}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Ajouter un ticket
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par magasin, produit, date..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" onClick={() => setFiltersOpen(!filtersOpen)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Liste des tickets</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {loading ? (
            <div className="py-8 text-center text-muted-foreground">
              Chargement des tickets...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {query || warrantyFilter !== "all"
                ? "Aucun ticket ne correspond à vos critères de recherche"
                : "Aucun ticket trouvé. Scannez votre premier ticket pour commencer !"}
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div key={t.id} className="flex justify-between items-center py-3">
                <div>
                  <p className="font-medium">{t.merchant}</p>
                  <p className="text-sm text-muted-foreground">{t.product} – {t.dateISO}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{toCurrencyEUR(t.amount)}</span>
                  {t.hasWarranty ? (
                    <ShieldCheck className="text-green-600 w-5 h-5" />
                  ) : (
                    <ShieldOff className="text-gray-400 w-5 h-5" />
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Dialog pour scanner un ticket */}
      <Dialog open={scannerOpen} onOpenChange={(open) => {
        setScannerOpen(open);
        // Rafraîchir la liste quand on ferme le scanner
        if (!open) {
          const fetchReceipts = async () => {
            try {
              setLoading(true);
              const response = await fetch("/api/receipts");
              if (!response.ok) {
                console.error("Erreur API:", response.status);
                setTickets([]);
                return;
              }
              const data = await response.json();

              const mappedTickets: Ticket[] = (data.receipts || []).map((receipt: any) => ({
                id: receipt.id?.toString() || "0",
                merchant: receipt.merchant_name || "Magasin inconnu",
                product: receipt.items && receipt.items.length > 0
                  ? receipt.items[0].name || "Produit"
                  : "Divers",
                amount: parseFloat(receipt.total_amount) || 0,
                dateISO: receipt.transaction_date
                  ? new Date(receipt.transaction_date).toISOString().slice(0, 10)
                  : receipt.created_at
                  ? new Date(receipt.created_at).toISOString().slice(0, 10)
                  : new Date().toISOString().slice(0, 10),
                hasWarranty: receipt.has_warranty || false,
              }));

              setTickets(mappedTickets);
            } catch (error) {
              console.error("Erreur lors du chargement des tickets:", error);
              setTickets([]);
            } finally {
              setLoading(false);
            }
          };
          fetchReceipts();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Scanner un ticket de caisse</DialogTitle>
            <DialogDescription>
              Téléchargez une photo de votre ticket pour une analyse IA automatique
            </DialogDescription>
          </DialogHeader>
          <ReceiptScanner />
        </DialogContent>
      </Dialog>
    </div>
  );
}
