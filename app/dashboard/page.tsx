"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { AccountOverview } from "@/components/dashboard/account-overview";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { ReceiptManager } from "@/components/dashboard/receipt-manager";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { Loader2 } from "lucide-react";

interface UserData {
  id: number;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"overview" | "receipts">("receipts");

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/auth/user");
        if (!response.ok) {
          router.push("/");
          return;
        }
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} onLogout={() => router.push("/")} />

      <div className="flex-1 flex flex-col">
        <Header userName={user?.name ?? "Utilisateur"} />

        <main className="flex-1 p-6 overflow-auto">
          {activeView === "overview" ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <AccountOverview userName={user?.name ?? "Utilisateur"} />
                <RecentTransactions onViewReceipt={() => setActiveView("receipts")} />
              </div>
              <div className="space-y-6">
                <QuickActions onAddReceipt={() => setActiveView("receipts")} />
                <SpendingChart />
              </div>
            </div>
          ) : (
            <ReceiptManager />
          )}
        </main>
      </div>
    </div>
  );
}
