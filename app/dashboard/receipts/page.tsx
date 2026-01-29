"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

function toCurrencyEUR(value: number) {
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

  const tickets: Ticket[] = [
    { id: "1", merchant: "Darty", product: "Aspirateur", amount: 129.99, dateISO: daysAgo(3), hasWarranty: true },
    { id: "2", merchant: "Fnac", product: "Casque audio", amount: 199, dateISO: daysAgo(12), hasWarranty: true },
    { id: "3", merchant: "Carrefour", product: "Courses", amount: 54.2, dateISO: daysAgo(2), hasWarranty: false },
    { id: "4", merchant: "Norauto", product: "Batterie", amount: 149, dateISO: daysAgo(28), hasWarranty: true },
  ];

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
  }, [query, warrantyFilter]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Tickets de caisse</h1>
          <p className="text-muted-foreground">
            Rechercher et filtrer vos tickets et garanties
          </p>
        </div>
        <Button>
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
          {filteredTickets.map((t) => (
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
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
