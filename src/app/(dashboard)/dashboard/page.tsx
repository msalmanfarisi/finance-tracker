"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/contexts/AppContext";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  HandCoins,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Wallet,
  Heart,
} from "lucide-react";

interface DashboardData {
  overview: {
    totalIncome: number;
    totalExpense: number;
    totalDebt: number;
    totalReceivable: number;
    netBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    healthStatus: string;
  };
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    type: string;
    category?: { name: string; color: string };
  }>;
  activeBudgets: Array<{
    id: string;
    name: string;
    amount: number;
    spent: number;
    category: { name: string };
  }>;
  upcomingDebts: Array<{
    id: string;
    creditor: string;
    remaining: number;
    dueDate: string;
  }>;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const { t, currency } = useApp();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const overview = data?.overview;

  const statCards = [
    {
      label: t.dashboard.totalIncome,
      value: formatMoney(overview?.totalIncome || 0, currency),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: t.dashboard.totalExpense,
      value: formatMoney(overview?.totalExpense || 0, currency),
      icon: <TrendingDown className="w-5 h-5" />,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 dark:bg-red-900/20",
      textColor: "text-red-600 dark:text-red-400",
    },
    {
      label: t.dashboard.totalDebt,
      value: formatMoney(overview?.totalDebt || 0, currency),
      icon: <CreditCard className="w-5 h-5" />,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
    },
    {
      label: t.dashboard.totalReceivable,
      value: formatMoney(overview?.totalReceivable || 0, currency),
      icon: <HandCoins className="w-5 h-5" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
    },
  ];

  const healthVariant = overview?.healthStatus === "healthy" ? "success" : overview?.healthStatus === "warning" ? "warning" : "danger";
  const healthLabel = overview?.healthStatus === "healthy" ? t.dashboard.healthy : overview?.healthStatus === "warning" ? t.dashboard.warning : t.dashboard.critical;

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.dashboard.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t.dashboard.financialOverview}</p>
        </div>
        <div className="flex items-center gap-2">
          <Heart className={`w-5 h-5 ${healthVariant === "success" ? "text-emerald-500" : healthVariant === "warning" ? "text-amber-500" : "text-red-500"}`} />
          <Badge variant={healthVariant}>{t.dashboard.financialHealth}: {healthLabel}</Badge>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Card key={idx} hover>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <span className={stat.textColor}>{stat.icon}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Net Balance */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20">
                <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t.dashboard.netBalance}</p>
                <p className={`text-3xl font-bold ${(overview?.netBalance || 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {formatMoney(overview?.netBalance || 0, currency)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">{t.dashboard.thisMonth}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-sm text-emerald-600">
                  <ArrowUpRight className="w-4 h-4" />
                  {formatMoney(overview?.monthlyIncome || 0, currency)}
                </span>
                <span className="flex items-center gap-1 text-sm text-red-600">
                  <ArrowDownRight className="w-4 h-4" />
                  {formatMoney(overview?.monthlyExpense || 0, currency)}
                </span>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.recentTransactions}</h2>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {(!data?.recentTransactions || data.recentTransactions.length === 0) ? (
                <div className="px-6 py-8 text-center text-sm text-gray-500">{t.common.noData}</div>
              ) : (
                data.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${tx.type === "income" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description}</p>
                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold ${tx.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                      {tx.type === "income" ? "+" : "-"}{formatMoney(tx.amount, currency)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardBody>
        </Card>

        {/* Budget Usage */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.budgetUsage}</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {(!data?.activeBudgets || data.activeBudgets.length === 0) ? (
                <div className="py-8 text-center text-sm text-gray-500">{t.common.noData}</div>
              ) : (
                data.activeBudgets.map((budget) => {
                  const percentage = budget.amount > 0 ? Math.min((budget.spent / budget.amount) * 100, 100) : 0;
                  const isOver = budget.spent > budget.amount;
                  return (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{budget.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatMoney(budget.spent, currency)} / {formatMoney(budget.amount, currency)}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-red-500" : percentage > 75 ? "bg-amber-500" : "bg-indigo-500"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Upcoming Debt Payments */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.dashboard.upcomingPayments}</h2>
          </div>
        </CardHeader>
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {(!data?.upcomingDebts || data.upcomingDebts.length === 0) ? (
              <div className="px-6 py-8 text-center text-sm text-gray-500">{t.common.noData}</div>
            ) : (
              data.upcomingDebts.map((debt) => (
                <div key={debt.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{debt.creditor}</p>
                    <p className="text-xs text-gray-500">
                      Due: {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString() : "-"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-amber-600">{formatMoney(debt.remaining, currency)}</span>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
