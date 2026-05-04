"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import CrudPage from "@/components/CrudPage";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

export default function DebtsPage() {
  const { t, currency } = useApp();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    creditor: "", amount: "", interest: "0", dueDate: "", description: "",
  });

  const fmt = (n: number) => new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: "creditor", header: t.debts.creditor },
    { key: "amount", header: t.common.amount, render: (item: Record<string, unknown>) => fmt(Number(item.amount)) },
    { key: "remaining", header: t.debts.remaining, render: (item: Record<string, unknown>) => <span className="font-semibold text-amber-600">{fmt(Number(item.remaining))}</span> },
    { key: "interest", header: t.debts.interest, render: (item: Record<string, unknown>) => `${item.interest}%` },
    {
      key: "status", header: t.common.status,
      render: (item: Record<string, unknown>) => {
        const status = item.status as string;
        return status === "paid" ? <Badge variant="success">{t.debts.paid}</Badge> :
          status === "overdue" ? <Badge variant="danger">{t.debts.overdue}</Badge> :
          <Badge variant="warning">{t.common.active}</Badge>;
      },
    },
    { key: "dueDate", header: t.debts.dueDate, render: (item: Record<string, unknown>) => item.dueDate ? new Date(item.dueDate as string).toLocaleDateString() : "-" },
  ];

  const formFields = (
    <>
      <Input label={t.debts.creditor} value={formData.creditor as string} onChange={(e) => setFormData({ ...formData, creditor: e.target.value })} required />
      <Input label={t.common.amount} type="number" value={formData.amount as string} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
      <Input label={t.debts.interest} type="number" step="0.01" value={formData.interest as string} onChange={(e) => setFormData({ ...formData, interest: e.target.value })} />
      <Input label={t.debts.dueDate} type="date" value={formData.dueDate as string} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
      <Input label={t.common.description} value={formData.description as string} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
    </>
  );

  return (
    <CrudPage
      title={t.debts.title}
      apiEndpoint="/api/debts"
      dataKey="debts"
      columns={columns}
      formFields={formFields}
      formData={formData}
      setFormData={setFormData}
      initialFormData={{ creditor: "", amount: "", interest: "0", dueDate: "", description: "" }}
      exportDataType="debts"
      addButtonLabel={t.debts.addDebt}
      editButtonLabel={t.debts.editDebt}
    />
  );
}
