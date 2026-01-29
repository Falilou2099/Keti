"use client";

import { useState } from "react";
import { CreditCard, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BankCard = {
  id: string;
  brand: string;
  last4: string;
  holder: string;
  gradient: string;
};

export default function CardsPage() {
  const cards: BankCard[] = [
    {
      id: "1",
      brand: "VISA",
      last4: "4532",
      holder: "Nathan Bouche",
      gradient: "from-emerald-500 via-green-400 to-lime-300",
    },
    {
      id: "2",
      brand: "MASTERCARD",
      last4: "1128",
      holder: "Nathan Bouche",
      gradient: "from-sky-500 via-blue-400 to-cyan-300",
    },
    {
      id: "3",
      brand: "AMEX",
      last4: "9981",
      holder: "Nathan Bouche",
      gradient: "from-purple-500 via-fuchsia-400 to-pink-300",
    },
  ];

  const [index, setIndex] = useState(0);
  const card = cards[index];

  const next = () => setIndex((i) => (i + 1) % cards.length);
  const prev = () => setIndex((i) => (i - 1 + cards.length) % cards.length);

  return (
    <div className="p-8 flex flex-col items-center justify-center space-y-8">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold">Mes cartes bancaires</h1>
        <p className="text-muted-foreground text-sm">
          Double-clique (PC) ou double-tap (mobile) pour changer de carte
        </p>
      </div>

      {/* Carte */}
      <div
        onDoubleClick={next}
        className="cursor-pointer transition-transform hover:scale-105"
      >
        <div
          className={cn(
            "relative w-[340px] h-[210px] rounded-2xl shadow-2xl",
            "bg-gradient-to-br",
            card.gradient
          )}
        >
          {/* Effet lumière */}
          <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-sm" />

          {/* Contenu */}
          <div className="relative z-10 h-full p-5 flex flex-col justify-between text-white">
            <div className="flex justify-between items-start">
              <CreditCard className="w-6 h-6 opacity-90" />
              <span className="text-xs font-semibold tracking-widest">
                {card.brand}
              </span>
            </div>

            <div className="text-lg tracking-widest font-mono">
              •••• •••• •••• {card.last4}
            </div>

            <div className="flex justify-between items-end text-sm">
              <span className="font-medium">{card.holder}</span>
              <span className="opacity-80">12/28</span>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="flex gap-2">
        {cards.map((_, i) => (
          <span
            key={i}
            className={cn(
              "w-2.5 h-2.5 rounded-full transition",
              i === index ? "bg-green-500 scale-125" : "bg-gray-300"
            )}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="flex gap-6 text-sm text-muted-foreground">
        <button onClick={prev} className="flex items-center gap-1 hover:text-black">
          <ChevronLeft className="w-4 h-4" />
          Précédente
        </button>
        <button onClick={next} className="flex items-center gap-1 hover:text-black">
          Suivante
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
