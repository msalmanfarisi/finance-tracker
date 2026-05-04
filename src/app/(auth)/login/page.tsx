"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, RefreshCw, Shield } from "lucide-react";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captcha, setCaptcha] = useState<{ id: string; display: string; type: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [locale, setLocale] = useState<"id" | "en">("id");

  const labels = {
    id: {
      title: "Masuk ke Akun Anda",
      subtitle: "Asisten Keuangan Pribadi Anda",
      email: "Email",
      password: "Kata Sandi",
      captcha: "Kode Captcha",
      mathCaptcha: "Jawab Soal Matematika",
      login: "Masuk",
      invalidCreds: "Email atau kata sandi salah",
      captchaFail: "Kode captcha salah",
      refresh: "Refresh Captcha",
    },
    en: {
      title: "Sign In to Your Account",
      subtitle: "Your Personal Financial Assistant",
      email: "Email",
      password: "Password",
      captcha: "Captcha Code",
      mathCaptcha: "Solve Math Problem",
      login: "Sign In",
      invalidCreds: "Invalid email or password",
      captchaFail: "Invalid captcha code",
      refresh: "Refresh Captcha",
    },
  };

  const t = labels[locale];

  const fetchCaptcha = useCallback(async () => {
    try {
      const res = await fetch("/api/captcha");
      const data = await res.json();
      setCaptcha(data);
      setCaptchaAnswer("");
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchCaptcha();
    const saved = localStorage.getItem("locale");
    if (saved === "en" || saved === "id") setLocale(saved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          captchaId: captcha?.id,
          captchaAnswer,
          tenantSlug: "default",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t.invalidCreds);
        fetchCaptcha();
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Connection error");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => {
              const next = locale === "id" ? "en" : "id";
              setLocale(next);
              localStorage.setItem("locale", next);
            }}
            className="px-3 py-1.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 text-white/60 text-xs font-bold uppercase hover:bg-white/10 transition-all"
          >
            {locale === "id" ? "EN" : "ID"}
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">{t.title}</h1>
            <p className="text-white/40 text-sm mt-1">{t.subtitle}</p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/60">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-white/60">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Captcha */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/60">
                <Shield className="inline-block w-4 h-4 mr-1" />
                {captcha?.type === "math" ? t.mathCaptcha : t.captcha}
              </label>
              <div className="flex items-center gap-3">
                <div className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/10 text-center">
                  <span className="text-xl font-mono font-bold tracking-[0.3em] text-white select-none" style={{ textShadow: "0 0 10px rgba(99,102,241,0.5)" }}>
                    {captcha?.display || "..."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title={t.refresh}
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all font-mono tracking-wider"
                placeholder={captcha?.type === "math" ? "42" : "AbCd1234"}
                required
              />
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-3 text-base bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25"
            >
              {t.login}
            </Button>
          </form>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Finance Tracker &copy; {new Date().getFullYear()} &mdash; Secure Financial Management
        </p>
      </div>
    </div>
  );
}
