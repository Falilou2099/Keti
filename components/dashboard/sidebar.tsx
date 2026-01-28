"use client";

import { cn } from "@/lib/utils";
import { Home, CreditCard, Receipt, PieChart, Settings, HelpCircle, LogOut } from "lucide-react";

interface SidebarProps {
  activeView: "overview" | "receipts";
  onViewChange: (view: "overview" | "receipts") => void;
  onLogout: () => void;
}

export function Sidebar({ activeView, onViewChange, onLogout }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: "Accueil", view: "overview" as const },
    { icon: Receipt, label: "Tickets de caisse", view: "receipts" as const },
    { icon: CreditCard, label: "Cartes", view: "overview" as const },
    { icon: PieChart, label: "Statistiques", view: "overview" as const },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-lg">B</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">BankApp</h1>
            <p className="text-xs text-sidebar-foreground/60">Votre banque digitale</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <button
                onClick={() => onViewChange(item.view)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                  activeView === item.view
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <ul className="space-y-1">
          <li>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Paramètres</span>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span>Aide</span>
            </button>
          </li>
          <li>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}
