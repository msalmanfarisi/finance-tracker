"use client";

import React, { useState } from "react";
import { useApp } from "@/contexts/AppContext";
import CrudPage from "@/components/CrudPage";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

const PERMISSIONS = [
  "users.view", "users.create", "users.edit", "users.delete",
  "roles.view", "roles.create", "roles.edit", "roles.delete",
  "budgets.view", "budgets.create", "budgets.edit", "budgets.delete",
  "incomes.view", "incomes.create", "incomes.edit", "incomes.delete",
  "expenses.view", "expenses.create", "expenses.edit", "expenses.delete",
  "debts.view", "debts.create", "debts.edit", "debts.delete",
  "receivables.view", "receivables.create", "receivables.edit", "receivables.delete",
  "settings.view", "settings.edit",
  "backup.create", "backup.download",
];

export default function RolesPage() {
  const { t } = useApp();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    name: "", description: "", permissions: {} as Record<string, boolean>,
  });

  const columns = [
    { key: "name", header: t.roles.roleName },
    { key: "description", header: t.common.description },
    { key: "isSystem", header: t.roles.systemRole, render: (item: Record<string, unknown>) => item.isSystem ? <Badge variant="warning">{t.common.yes}</Badge> : <Badge>{t.common.no}</Badge> },
    { key: "userCount", header: t.roles.userCount, render: (item: Record<string, unknown>) => String((item._count as Record<string, number>)?.users || 0) },
  ];

  const perms = (formData.permissions || {}) as Record<string, boolean>;
  const togglePerm = (perm: string) => {
    setFormData({ ...formData, permissions: { ...perms, [perm]: !perms[perm] } });
  };

  const formFields = (
    <>
      <Input label={t.roles.roleName} value={formData.name as string} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      <Input label={t.common.description} value={formData.description as string} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.roles.permissions}</label>
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto p-3 rounded-xl border border-gray-300 dark:border-gray-600">
          <label className="flex items-center gap-2 text-sm col-span-2">
            <input
              type="checkbox"
              checked={perms["*"] || false}
              onChange={() => setFormData({ ...formData, permissions: perms["*"] ? {} : { "*": true } })}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-semibold text-gray-900 dark:text-white">Full Access (*)</span>
          </label>
          {PERMISSIONS.map((perm) => (
            <label key={perm} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={perms["*"] || perms[perm] || false}
                onChange={() => togglePerm(perm)}
                disabled={perms["*"]}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              {perm}
            </label>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <CrudPage
      title={t.roles.title}
      apiEndpoint="/api/roles"
      dataKey="roles"
      columns={columns}
      formFields={formFields}
      formData={formData}
      setFormData={setFormData}
      initialFormData={{ name: "", description: "", permissions: {} }}
      addButtonLabel={t.roles.addRole}
      editButtonLabel={t.roles.editRole}
    />
  );
}
