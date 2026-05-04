"use client";

import React, { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import Card, { CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { Camera, Save, Lock, User } from "lucide-react";

export default function ProfilePage() {
  const { t, user, setUser, locale, setLocale, theme, setTheme } = useApp();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [pwMessage, setPwMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: (user as unknown as Record<string, string>)?.phone || "",
    address: (user as unknown as Record<string, string>)?.address || "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...profile, locale, theme }),
      });
      if (res.ok) {
        setMessage(t.common.success);
        if (user) setUser({ ...user, name: profile.name });
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwMessage("Passwords do not match");
      return;
    }
    setPasswordLoading(true);
    setPwMessage("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword }),
      });
      if (res.ok) {
        setPwMessage(t.common.success);
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        const data = await res.json();
        setPwMessage(data.error || t.common.error);
      }
    } catch { /* ignore */ }
    setPasswordLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        if (user) setUser({ ...user, avatar: data.avatar });
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.profile.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Section */}
        <Card>
          <CardBody className="flex flex-col items-center py-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {user?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || "U"
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">{user?.role?.name}</p>
          </CardBody>
        </Card>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.profile.personalInfo}</h2>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <Input label={t.common.name} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required />
                <Input label={t.common.email} type="email" value={profile.email} disabled />
                <Input label={t.common.phone} value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                <Input label={t.common.address} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label={t.profile.language}
                    value={locale}
                    onChange={(e) => setLocale(e.target.value as "id" | "en")}
                    options={[{ value: "id", label: "Bahasa Indonesia" }, { value: "en", label: "English" }]}
                  />
                  <Select
                    label={t.profile.theme}
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    options={[{ value: "system", label: t.themes.system }, { value: "light", label: t.themes.light }, { value: "dark", label: t.themes.dark }]}
                  />
                </div>

                {message && <p className={`text-sm ${message === t.common.success ? "text-emerald-600" : "text-red-600"}`}>{message}</p>}
                <Button type="submit" loading={loading} icon={<Save className="w-4 h-4" />}>
                  {t.common.save}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.profile.changePassword}</h2>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <Input label={t.profile.currentPassword} type="password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} required />
                <Input label={t.profile.newPassword} type="password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} required />
                <Input label={t.profile.confirmPassword} type="password" value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} required />
                {pwMessage && <p className={`text-sm ${pwMessage === t.common.success ? "text-emerald-600" : "text-red-600"}`}>{pwMessage}</p>}
                <Button type="submit" loading={passwordLoading} icon={<Lock className="w-4 h-4" />}>
                  {t.profile.changePassword}
                </Button>
              </form>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
