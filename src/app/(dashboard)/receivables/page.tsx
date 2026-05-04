"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import CrudPage from "@/components/CrudPage";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

export default function ReceivablesPage() {
  const { t, currency } = useApp();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    debtor: "", amount: "", dueDate: "", description: "",
  });

  const fmt = (n: number) => new Intl.NumberFormat(currency === "IDR" ? "id-ID" : "en-US", { style: "currency", currency, minimumFractionDigits: 0 }).format(n);

  const columns = [
    { key: "debtor", header: t.receivables.debtor },
    { key: "amount", header: t.common.amount, render: (item: Record<string, unknown>) => fmt(Number(item.amount)) },
    { key: "remaining", header: t.receivables.remaining, render: (item: Record<string, unknown>) => <span className="font-semibold text-blue-600">{fmt(Number(item.remaining))}</span> },
    {
      key: "status", header: t.common.status,
      render: (item: Record<string, unknown>) => {
        const status = item.status as string;
        return status === "received" ? <Badge variant="success">{t.receivables.received}</Badge> :
          status === "overdue" ? <Badge variant="danger">{t.receivables.overdue}</Badge> :
          <Badge variant="info">{t.common.active}</Badge>;
      },
    },
    { key: "dueDate", header: t.receivables.dueDate, render: (item: Record<string, unknown>) => item.dueDate ? new Date(item.dueDate as string).toLocaleDateString() : "-" },
  ];

  const formFields = (
    <>
      <Input label={t.receivables.debtor} value={formData.debtor as string} onChange={(e) => setFormData({ ...formData, debtor: e.target.value })} required />
      <Input label={t.common.amount} type="number" value={formData.amount as string} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
      <Input label={t.receivables.dueDate} type="date" value={formData.dueDate as string} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
      <Input label={t.common.description} value={formData.description as string} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
    </>
  );

  return (
    <CrudPage
      title={t.receivables.title}
      apiEndpoint="/api/receivables"
      dataKey="receivables"
      columns={columns}
      formFields={formFields}
      formData={formData}
      setFormData={setFormData}
      initialFormData={{ debtor: "", amount: "", dueDate: "", description: "" }}
      exportDataType="receivables"
      addButtonLabel={t.receivables.addReceivable}
      editButtonLabel={t.receivables.editReceivable}
    />
  );
}
