"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  CreditCard,
  Receipt,
  PieChart,
  Settings,
  HelpCircle,
  LogOut,
  User,
  Bell,
} from "lucide-react";
import { NotificationBell } from "@/components/notification-bell";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Accueil", href: "/dashboard" },
    { icon: Receipt, label: "Tickets de caisse", href: "/dashboard/receipts" },
    { icon: CreditCard, label: "Cartes", href: "/dashboard/cards" },
    { icon: PieChart, label: "Statistiques", href: "/dashboard/stats" },
    { icon: Bell, label: "Alertes", href: "/dashboard/alerts" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden md:flex w-64 flex-col bg-green-100 text-gray-900">
      {/* Logo + cloche */}
      <div className="pt-2 pb-3 px-4 flex items-center justify-between">
        <img src="/KETI-LOGO.png" alt="KETI" className="h-16 object-contain" />
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.href)
                    ? "bg-green-300 text-green-900 font-semibold"
                    : "hover:bg-green-200"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bas du menu */}
      <div className="p-4 border-t border-green-200 space-y-1">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-200"
        >
          <User className="w-5 h-5" />
          <span>Mon profil</span>
        </Link>

        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-200">
          <Settings className="w-5 h-5" />
          <span>Paramètres</span>
        </button>

        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-green-200">
          <HelpCircle className="w-5 h-5" />
          <span>Aide</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-100 text-red-600"
        >
          <LogOut className="w-5 h-5" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
