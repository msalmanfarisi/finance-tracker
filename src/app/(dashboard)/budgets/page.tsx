"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import CrudPage from "@/components/CrudPage";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";

export default function BudgetsPage() {
  const { t, currency } = useApp();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    name: "", amount: "", period: "monthly", startDate: "", endDate: "", categoryId: "", notes: "",
  });

  const fmt = (n: number) => new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: "name", header: t.budgets.budgetName },
    { key: "amount", header: t.budgets.budgetAmount, render: (item: Record<string, unknown>) => fmt(Number(item.amount)) },
    { key: "spent", header: t.budgets.spent, render: (item: Record<string, unknown>) => fmt(Number(item.spent)) },
    {
      key: "status", header: t.common.status,
      render: (item: Record<string, unknown>) => {
        const pct = Number(item.amount) > 0 ? (Number(item.spent) / Number(item.amount)) * 100 : 0;
        return pct > 100 ? <Badge variant="danger">{t.budgets.overBudget}</Badge> :
          pct > 75 ? <Badge variant="warning">{t.budgets.onTrack}</Badge> :
          <Badge variant="success">{t.budgets.underBudget}</Badge>;
      },
    },
    { key: "period", header: t.budgets.period },
    { key: "category", header: t.common.category, render: (item: Record<string, unknown>) => (item.category as Record<string, string>)?.name || "-" },
  ];

  const formFields = (
    <>
      <Input label={t.budgets.budgetName} value={formData.name as string} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      <Input label={t.budgets.budgetAmount} type="number" value={formData.amount as string} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
      <Select label={t.budgets.period} value={formData.period as string} onChange={(e) => setFormData({ ...formData, period: e.target.value })} options={[
        { value: "monthly", label: t.budgets.monthly },
        { value: "quarterly", label: t.budgets.quarterly },
        { value: "yearly", label: t.budgets.yearly },
      ]} />
      <Input label={t.budgets.startDate} type="date" value={formData.startDate as string} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
      <Input label={t.budgets.endDate} type="date" value={formData.endDate as string} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
      <Input label={t.common.notes} value={formData.notes as string} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
    </>
  );

  return (
    <CrudPage
      title={t.budgets.title}
      apiEndpoint="/api/budgets"
      dataKey="budgets"
      columns={columns}
      formFields={formFields}
      formData={formData}
      setFormData={setFormData}
      initialFormData={{ name: "", amount: "", period: "monthly", startDate: "", endDate: "", categoryId: "", notes: "" }}
      exportDataType="budgets"
      addButtonLabel={t.budgets.addBudget}
      editButtonLabel={t.budgets.editBudget}
    />
  );
}
