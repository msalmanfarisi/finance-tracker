"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import Card, { CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import DataTable from "@/components/ui/DataTable";
import Input from "@/components/ui/Input";
import { Plus, Search, Download, Upload, FileSpreadsheet, FileText, Trash2, Pencil } from "lucide-react";

interface Column {
  key: string;
  header: string;
  render?: (item: Record<string, unknown>) => React.ReactNode;
}

interface CrudPageProps {
  title: string;
  apiEndpoint: string;
  dataKey: string;
  columns: Column[];
  formFields: React.ReactNode;
  formData: Record<string, unknown>;
  setFormData: (data: Record<string, unknown>) => void;
  initialFormData: Record<string, unknown>;
  exportDataType?: string;
  addButtonLabel: string;
  editButtonLabel?: string;
}

export default function CrudPage({
  title,
  apiEndpoint,
  dataKey,
  columns,
  formFields,
  formData,
  setFormData,
  initialFormData,
  exportDataType,
  addButtonLabel,
  editButtonLabel,
}: CrudPageProps) {
  const { t } = useApp();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiEndpoint}?page=${page}&limit=10&search=${search}`);
      const json = await res.json();
      setData(json[dataKey] || []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch { /* ignore */ }
    setLoading(false);
  }, [apiEndpoint, dataKey, page, search]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `${apiEndpoint}/${editingId}` : apiEndpoint;

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      setEditingId(null);
      setFormData(initialFormData);
      fetchData();
    } catch { /* ignore */ }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.common.confirm + "?")) return;
    await fetch(`${apiEndpoint}/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleEdit = (item: Record<string, unknown>) => {
    setFormData(item);
    setEditingId(item.id as string);
    setShowModal(true);
  };

  const handleExport = async (format: "xlsx" | "docx") => {
    if (!exportDataType) return;
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataType: exportDataType, format }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${exportDataType}-${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* ignore */ }
  };

  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!exportDataType) return;
    form.append("dataType", exportDataType);

    try {
      const res = await fetch("/api/import", { method: "POST", body: form });
      const result = await res.json();
      if (result.success) {
        setShowImport(false);
        fetchData();
      }
    } catch { /* ignore */ }
  };

  const allColumns = [
    ...columns,
    {
      key: "actions",
      header: t.common.actions,
      className: "w-24",
      render: (item: Record<string, unknown>) => (
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleEdit(item)}
            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item.id as string)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <div className="flex items-center gap-2">
          {exportDataType && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleExport("xlsx")} icon={<FileSpreadsheet className="w-4 h-4" />}>
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("docx")} icon={<FileText className="w-4 h-4" />}>
                Word
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowImport(true)} icon={<Upload className="w-4 h-4" />}>
                {t.common.import}
              </Button>
            </>
          )}
          <Button
            onClick={() => { setFormData(initialFormData); setEditingId(null); setShowModal(true); }}
            icon={<Plus className="w-4 h-4" />}
          >
            {addButtonLabel}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={t.common.search + "..."}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-white text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              />
            </div>
          </div>
        </CardHeader>
        <DataTable
          columns={allColumns}
          data={data}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          loading={loading}
          emptyMessage={t.common.noData}
        />
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingId(null); }}
        title={editingId ? (editButtonLabel || t.common.edit) : addButtonLabel}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formFields}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" type="button" onClick={() => setShowModal(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={saving}>
              {t.common.save}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title={t.common.import}>
        <form onSubmit={handleImport} className="space-y-4">
          <Input type="file" name="file" accept=".xlsx,.xls,.csv" label={t.common.upload} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" type="button" onClick={() => setShowImport(false)}>
              {t.common.cancel}
            </Button>
            <Button type="submit" icon={<Download className="w-4 h-4" />}>
              {t.common.import}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
