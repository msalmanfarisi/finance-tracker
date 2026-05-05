"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/AppContext";
import {
  Bell,
  Sun,
  Moon,
  Globe,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Check,
  CheckCheck,
  Palette,
} from "lucide-react";
import type { Locale } from "@/i18n";

export default function Header() {
  const { t, locale, setLocale, theme, setTheme, user, sidebarCollapsed, unreadCount, setUnreadCount, colorTheme, setColorTheme } = useApp();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ id: string; title: string; message: string; isRead: boolean; createdAt: string }>>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(event.target as Node)) setShowUserMenu(false);
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) setShowThemeMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=5");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch { /* ignore */ }
  }, [setUnreadCount]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleMarkAll = async (markAs: "read" | "unread") => {
    try {
      await fetch("/api/notifications/mark-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAs }),
      });
      fetchNotifications();
    } catch { /* ignore */ }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const colorThemes = [
    { id: "default", name: t.themes.default, color: "bg-indigo-500" },
    { id: "ocean", name: t.themes.ocean, color: "bg-cyan-500" },
    { id: "sunset", name: t.themes.sunset, color: "bg-orange-500" },
    { id: "forest", name: t.themes.forest, color: "bg-emerald-500" },
    { id: "midnight", name: t.themes.midnight, color: "bg-violet-500" },
    { id: "rose", name: t.themes.rose, color: "bg-rose-500" },
  ];

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 z-30 flex items-center justify-between px-6 transition-all duration-300 ${
        sidebarCollapsed ? "left-[72px]" : "left-64"
      }`}
    >
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {/* Page title can be set dynamically */}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <button
          onClick={() => setLocale(locale === "id" ? "en" : ("id" as Locale))}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
          title={t.profile.language}
        >
          <Globe className="w-4 h-4" />
          <span className="uppercase text-xs font-bold">{locale}</span>
        </button>

        {/* Dark/Light Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
          title={theme === "dark" ? t.themes.light : t.themes.dark}
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Color Theme */}
        <div ref={themeRef} className="relative">
          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all"
            title={t.profile.theme}
          >
            <Palette className="w-5 h-5" />
          </button>
          {showThemeMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2">
              {colorThemes.map((ct) => (
                <button
                  key={ct.id}
                  onClick={() => { setColorTheme(ct.id); setShowThemeMenu(false); }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className={`w-4 h-4 rounded-full ${ct.color}`} />
                  <span className="text-gray-700 dark:text-gray-300">{ct.name}</span>
                  {colorTheme === ct.id && <Check className="w-4 h-4 ml-auto text-indigo-600" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) fetchNotifications(); }}
            className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-all relative"
            title={t.nav.notifications}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t.nav.notifications}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleMarkAll("read")}
                    className="p-1 rounded text-xs text-gray-500 hover:text-indigo-600 transition-colors"
                    title={t.notifications.markAllRead}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-500">{t.notifications.noNotifications}</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                        !notif.isRead ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                      }`}
                    >
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        {new Date(notif.createdAt).toLocaleDateString(locale === "id" ? "id-ID" : "en-US")}
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => { router.push("/notifications"); setShowNotifications(false); }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {t.common.view} {t.common.all.toLowerCase()}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
              {user?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0)?.toUpperCase() || "U"
              )}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name || "User"}</p>
              <p className="text-[10px] text-gray-500">{user?.role?.name || "Member"}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 animate-in fade-in slide-in-from-top-2">
              <button
                onClick={() => { router.push("/profile"); setShowUserMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <User className="w-4 h-4" /> {t.nav.profile}
              </button>
              <button
                onClick={() => { router.push("/settings"); setShowUserMenu(false); }}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <Settings className="w-4 h-4" /> {t.nav.settings}
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="w-4 h-4" /> {t.auth.logout}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
