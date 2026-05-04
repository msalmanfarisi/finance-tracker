"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/contexts/AppContext";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Settings, Database, Save, Download, Archive } from "lucide-react";

const CURRENCIES = [
  { value: "IDR", label: "IDR - Indonesian Rupiah" },
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "JPY", label: "JPY - Japanese Yen" },
  { value: "SGD", label: "SGD - Singapore Dollar" },
  { value: "MYR", label: "MYR - Malaysian Ringgit" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

export default function SettingsPage() {
  const { t } = useApp();
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState("");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({
    appName: "Finance Tracker",
    currency: "IDR",
    locale: "id",
    theme: "default",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.tenant) {
          setSettings({
            appName: d.tenant.appName,
            currency: d.tenant.currency,
            locale: d.tenant.locale,
            theme: d.tenant.theme,
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) setMessage(t.common.success);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleBackup = async (format: string) => {
    setBackupLoading(format);
    try {
      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Backup created: ${data.filename}`);
      }
    } catch { /* ignore */ }
    setBackupLoading("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.settings.title}</h1>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.general}</h2>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label={t.settings.appName}
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              required
            />
            <Select
              label={t.settings.currency}
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              options={CURRENCIES}
            />
            <Select
              label={t.settings.locale}
              value={settings.locale}
              onChange={(e) => setSettings({ ...settings, locale: e.target.value })}
              options={[
                { value: "id", label: "Bahasa Indonesia" },
                { value: "en", label: "English" },
              ]}
            />

            {message && <p className="text-sm text-emerald-600">{message}</p>}

            <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
              {t.common.save}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.settings.backup}</h2>
          </div>
        </CardHeader>
        <CardBody>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Create database backups in various formats. Admin access required.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => handleBackup("sql")}
              loading={backupLoading === "sql"}
              icon={<Download className="w-4 h-4" />}
            >
              {t.settings.exportSql}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBackup("zip")}
              loading={backupLoading === "zip"}
              icon={<Archive className="w-4 h-4" />}
            >
              {t.settings.exportZip}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleBackup("gz")}
              loading={backupLoading === "gz"}
              icon={<Archive className="w-4 h-4" />}
            >
              {t.settings.exportGz}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
