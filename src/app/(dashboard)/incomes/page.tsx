"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import CrudPage from "@/components/CrudPage";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";

export default function IncomesPage() {
  const { t, currency } = useApp();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    description: "", amount: "", date: "", source: "", notes: "", categoryId: "", isRecurring: false, recurType: "",
  });
  const [categories, setCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    fetch("/api/categories?type=income")
      .then((res) => res.json())
      .then((data) => {
        setCategories([
          { value: "", label: `-- ${t.common.category} --` },
          ...(data.categories || []).map((c: { id: string; name: string }) => ({ value: c.id, label: c.name })),
        ]);
      })
      .catch(() => {});
  }, [t.common.category]);

  const fmt = (n: number) => new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: "description", header: t.common.description },
    { key: "amount", header: t.common.amount, render: (item: Record<string, unknown>) => <span className="text-emerald-600 font-semibold">{fmt(Number(item.amount))}</span> },
    { key: "date", header: t.common.date, render: (item: Record<string, unknown>) => new Date(item.date as string).toLocaleDateString() },
    { key: "source", header: t.incomes.source },
    { key: "recurring", header: t.incomes.recurring, render: (item: Record<string, unknown>) => item.isRecurring ? <Badge variant="info">{t.incomes.recurring}</Badge> : "-" },
    { key: "category", header: t.common.category, render: (item: Record<string, unknown>) => (item.category as Record<string, string>)?.name || "-" },
  ];

  const formFields = (
    <>
      <Input label={t.common.description} value={formData.description as string} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
      <Input label={t.common.amount} type="number" value={formData.amount as string} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
      <Select label={t.common.category} value={formData.categoryId as string} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} options={categories} required />
      <Input label={t.common.date} type="date" value={formData.date as string} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
      <Input label={t.incomes.source} value={formData.source as string} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
      <Input label={t.common.notes} value={formData.notes as string} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
    </>
  );

  return (
    <CrudPage
      title={t.incomes.title}
      apiEndpoint="/api/incomes"
      dataKey="incomes"
      columns={columns}
      formFields={formFields}
      formData={formData}
      setFormData={setFormData}
      initialFormData={{ description: "", amount: "", date: "", source: "", notes: "", categoryId: "", isRecurring: false, recurType: "" }}
      exportDataType="incomes"
      addButtonLabel={t.incomes.addIncome}
      editButtonLabel={t.incomes.editIncome}
    />
  );
}
