"use client";

import { AccountOverview } from "@/components/account-overview";
import { RecentTransactions } from "@/components/recent-transactions";
import { QuickActions } from "@/components/quick-actions";
import { SpendingChart } from "@/components/spending-chart";

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <AccountOverview userName="Nathan" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <RecentTransactions />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <SpendingChart />
        </div>
      </div>
    </div>
  );
}
