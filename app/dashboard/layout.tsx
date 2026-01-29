"use client";

import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar onLogout={() => fetch("/api/auth/logout")} />
      <main className="flex-1 bg-white">
        {children}
        <MobileNav />
      </main>
    </div>
  );
}
