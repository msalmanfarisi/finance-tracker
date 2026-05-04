"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import CrudPage from "@/components/CrudPage";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

export default function IncomePlansPage() {
  const { t, currency } = useApp();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    description: "", targetAmount: "", source: "", targetDate: "", notes: "",
  });

  const fmt = (n: number) => new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: "description", header: t.common.description },
    { key: "targetAmount", header: t.incomePlans.targetAmount, render: (item: Record<string, unknown>) => fmt(Number(item.targetAmount)) },
    { key: "currentAmount", header: t.incomePlans.currentAmount, render: (item: Record<string, unknown>) => fmt(Number(item.currentAmount)) },
    {
      key: "progress", header: t.incomePlans.progress,
      render: (item: Record<string, unknown>) => {
        const pct = Number(item.targetAmount) > 0 ? Math.min((Number(item.currentAmount) / Number(item.targetAmount)) * 100, 100) : 0;
        return (
          <div className="w-24">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500">{pct.toFixed(0)}%</span>
          </div>
        );
      },
    },
    {
      key: "status", header: t.common.status,
      render: (item: Record<string, unknown>) => {
        const s = item.status as string;
        return s === "achieved" ? <Badge variant="success">{t.incomePlans.achieved}</Badge> :
          s === "in_progress" ? <Badge variant="info">{t.incomePlans.inProgress}</Badge> :
          <Badge>{t.incomePlans.planned}</Badge>;
      },
    },
    { key: "targetDate", header: t.incomePlans.targetDate, render: (item: Record<string, unknown>) => new Date(item.targetDate as string).toLocaleDateString() },
  ];

  const formFields = (
    <>
      <Input label={t.common.description} value={formData.description as string} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
      <Input label={t.incomePlans.targetAmount} type="number" value={formData.targetAmount as string} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} required />
      <Input label={t.incomePlans.source} value={formData.source as string} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
      <Input label={t.incomePlans.targetDate} type="date" value={formData.targetDate as string} onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })} required />
      <Input label={t.common.notes} value={formData.notes as string} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
    </>
  );

  return (
    <CrudPage
      title={t.incomePlans.title}
      apiEndpoint="/api/income-plans"
      dataKey="plans"
      columns={columns}
      formFields={formFields}
      formData={formData}
      setFormData={setFormData}
      initialFormData={{ description: "", targetAmount: "", source: "", targetDate: "", notes: "" }}
      addButtonLabel={t.incomePlans.addPlan}
      editButtonLabel={t.incomePlans.editPlan}
    />
  );
}
