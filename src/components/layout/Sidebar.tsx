"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  HandCoins,
  Target,
  Users,
  Shield,
  Settings,
  User,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  labelKey: string;
  group: string;
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, labelKey: "dashboard", group: "main" },
  { href: "/budgets", icon: <Wallet className="w-5 h-5" />, labelKey: "budgets", group: "financial" },
  { href: "/incomes", icon: <TrendingUp className="w-5 h-5" />, labelKey: "incomes", group: "financial" },
  { href: "/expenses", icon: <TrendingDown className="w-5 h-5" />, labelKey: "expenses", group: "financial" },
  { href: "/debts", icon: <CreditCard className="w-5 h-5" />, labelKey: "debts", group: "financial" },
  { href: "/receivables", icon: <HandCoins className="w-5 h-5" />, labelKey: "receivables", group: "financial" },
  { href: "/income-plans", icon: <Target className="w-5 h-5" />, labelKey: "incomePlans", group: "financial" },
  { href: "/users", icon: <Users className="w-5 h-5" />, labelKey: "users", group: "management" },
  { href: "/roles", icon: <Shield className="w-5 h-5" />, labelKey: "roles", group: "management" },
  { href: "/profile", icon: <User className="w-5 h-5" />, labelKey: "profile", group: "system" },
  { href: "/settings", icon: <Settings className="w-5 h-5" />, labelKey: "settings", group: "system" },
];

const groupLabels: Record<string, string> = {
  main: "",
  financial: "financial",
  management: "management",
  system: "system",
};

export default function Sidebar() {
  const { t, sidebarCollapsed, setSidebarCollapsed, appName } = useApp();
  const pathname = usePathname();

  const nav = t.nav as Record<string, string>;

  const groups = Object.keys(groupLabels);

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-40 flex flex-col ${
        sidebarCollapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex-shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        {!sidebarCollapsed && (
          <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent truncate">
            {appName}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {groups.map((group) => {
          const items = navItems.filter((item) => item.group === group);
          if (items.length === 0) return null;

          return (
            <div key={group}>
              {!sidebarCollapsed && groupLabels[group] && (
                <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600">
                  {nav[groupLabels[group]] || groupLabels[group]}
                </p>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                      }`}
                      title={sidebarCollapsed ? nav[item.labelKey] : undefined}
                    >
                      <span className={`flex-shrink-0 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"}`}>
                        {item.icon}
                      </span>
                      {!sidebarCollapsed && <span className="truncate">{nav[item.labelKey]}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={() => {
            setSidebarCollapsed(!sidebarCollapsed);
            localStorage.setItem("sidebarCollapsed", String(!sidebarCollapsed));
          }}
          className="flex items-center justify-center w-full px-3 py-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-all duration-200"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
