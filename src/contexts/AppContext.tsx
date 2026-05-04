"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { Locale, TranslationKeys } from "@/i18n";
import { getTranslation } from "@/i18n";

interface UserData {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  locale: string;
  theme: string;
  role: { id: string; name: string; permissions: Record<string, boolean> };
  tenant: { id: string; name: string; appName: string; currency: string; slug: string };
}

interface AppContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationKeys;
  theme: string;
  setTheme: (theme: string) => void;
  colorTheme: string;
  setColorTheme: (theme: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  user: UserData | null;
  setUser: (user: UserData | null) => void;
  currency: string;
  appName: string;
  unreadCount: number;
  setUnreadCount: (count: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("id");
  const [theme, setThemeState] = useState("system");
  const [colorTheme, setColorThemeState] = useState("default");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const translations = getTranslation(locale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    document.documentElement.lang = newLocale;
    localStorage.setItem("locale", newLocale);
  }, []);

  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (newTheme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemDark ? "dark" : "light");
    } else {
      root.classList.add(newTheme);
    }
  }, []);

  const setColorTheme = useCallback((newTheme: string) => {
    setColorThemeState(newTheme);
    localStorage.setItem("colorTheme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  }, []);

  useEffect(() => {
    const savedLocale = localStorage.getItem("locale") as Locale | null;
    const savedTheme = localStorage.getItem("theme");
    const savedColorTheme = localStorage.getItem("colorTheme");
    const savedSidebar = localStorage.getItem("sidebarCollapsed");

    if (savedLocale) setLocaleState(savedLocale);
    if (savedTheme) setThemeState(savedTheme);
    if (savedColorTheme) setColorThemeState(savedColorTheme);
    if (savedSidebar) setSidebarCollapsed(savedSidebar === "true");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.setAttribute("data-theme", colorTheme);
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.add(systemDark ? "dark" : "light");
    } else {
      root.classList.add(theme);
    }
  }, [locale, theme, colorTheme]);

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        t: translations,
        theme,
        setTheme,
        colorTheme,
        setColorTheme,
        sidebarCollapsed,
        setSidebarCollapsed,
        user,
        setUser,
        currency: user?.tenant?.currency || "IDR",
        appName: user?.tenant?.appName || "Finance Tracker",
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
