"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import CrudPage from "@/components/CrudPage";
import Input from "@/components/ui/Input";

export default function ExpensesPage() {
  const { t, currency } = useApp();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    description: "", amount: "", date: "", vendor: "", notes: "",
  });

  const fmt = (n: number) => new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: "description", header: t.common.description },
    { key: "amount", header: t.common.amount, render: (item: Record<string, unknown>) => <span className="text-red-600 font-semibold">{fmt(Number(item.amount))}</span> },
    { key: "date", header: t.common.date, render: (item: Record<string, unknown>) => new Date(item.date as string).toLocaleDateString() },
    { key: "vendor", header: t.expenses.vendor },
    { key: "category", header: t.common.category, render: (item: Record<string, unknown>) => (item.category as Record<string, string>)?.name || "-" },
  ];

  const formFields = (
    <>
      <Input label={t.common.description} value={formData.description as string} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
      <Input label={t.common.amount} type="number" value={formData.amount as string} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
      <Input label={t.common.date} type="date" value={formData.date as string} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
      <Input label={t.expenses.vendor} value={formData.vendor as string} onChange={(e) => setFormData({ ...formData, vendor: e.target.value })} />
      <Input label={t.common.notes} value={formData.notes as string} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
    </>
  );

  return (
    <CrudPage
      title={t.expenses.title}
      apiEndpoint="/api/expenses"
      dataKey="expenses"
      columns={columns}
      formFields={formFields}
      formData={formData}
      setFormData={setFormData}
      initialFormData={{ description: "", amount: "", date: "", vendor: "", notes: "" }}
      exportDataType="expenses"
      addButtonLabel={t.expenses.addExpense}
      editButtonLabel={t.expenses.editExpense}
    />
  );
}
