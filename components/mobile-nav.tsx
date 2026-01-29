"use client";

import { Home, Receipt, History, User } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Accueil", href: "/dashboard", id: "home" },
    { icon: Receipt, label: "Scanner", href: "/dashboard", id: "scanner" },
    { icon: History, label: "Historique", href: "/dashboard/receipts", id: "history" },
    { icon: User, label: "Profil", href: "/dashboard/profile", id: "profile" },
  ];

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché sous la nav */}
      <div className="h-20 md:hidden" />
      
      {/* Navigation bottom fixe - Style app bancaire */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
        <div className="flex items-center justify-around h-20 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`relative ${isActive ? "scale-110" : ""} transition-transform`}>
                  <item.icon className="w-6 h-6" />
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
