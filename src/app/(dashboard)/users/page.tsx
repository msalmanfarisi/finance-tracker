"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import CrudPage from "@/components/CrudPage";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";

export default function UsersPage() {
  const { t } = useApp();
  const [formData, setFormData] = useState<Record<string, unknown>>({
    name: "", email: "", password: "", phone: "", address: "", roleId: "",
  });
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetch("/api/roles?limit=100").then((r) => r.json()).then((d) => setRoles(d.roles || [])).catch(() => {});
  }, []);

  const columns = [
    {
      key: "avatar", header: "", className: "w-12",
      render: (item: Record<string, unknown>) => (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
          {(item.name as string)?.charAt(0)?.toUpperCase() || "U"}
        </div>
      ),
    },
    { key: "name", header: t.common.name },
    { key: "email", header: t.common.email },
    { key: "role", header: t.users.role, render: (item: Record<string, unknown>) => <Badge variant="info">{(item.role as Record<string, string>)?.name}</Badge> },
    {
      key: "isActive", header: t.common.status,
      render: (item: Record<string, unknown>) => item.isActive ? <Badge variant="success">{t.common.active}</Badge> : <Badge variant="danger">{t.common.inactive}</Badge>,
    },
    {
      key: "lastLoginAt", header: t.users.lastLogin,
      render: (item: Record<string, unknown>) => item.lastLoginAt ? new Date(item.lastLoginAt as string).toLocaleString() : "-",
    },
  ];

  const formFields = (
    <>
      <Input label={t.common.name} value={formData.name as string} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
      <Input label={t.common.email} type="email" value={formData.email as string} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
      <Input label={t.auth.password} type="password" value={formData.password as string} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Leave empty to keep current" />
      <Input label={t.common.phone} value={formData.phone as string} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
      <Input label={t.common.address} value={formData.address as string} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
      <Select
        label={t.users.role}
        value={formData.roleId as string}
        onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
        options={[{ value: "", label: "-- Select --" }, ...roles.map((r) => ({ value: r.id, label: r.name }))]}
      />
    </>
  );

  return (
    <CrudPage
      title={t.users.title}
      apiEndpoint="/api/users"
      dataKey="users"
      columns={columns}
      formFields={formFields}
      formData={formData}
      setFormData={setFormData}
      initialFormData={{ name: "", email: "", password: "", phone: "", address: "", roleId: "" }}
      addButtonLabel={t.users.addUser}
      editButtonLabel={t.users.editUser}
    />
  );
}
