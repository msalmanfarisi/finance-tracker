"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useApp } from "@/contexts/AppContext";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { Bell, CheckCheck, Eye } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { t, locale, setUnreadCount } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?limit=50");
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch { /* ignore */ }
    setLoading(false);
  }, [setUnreadCount]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchNotifications(); }, []);

  const toggleMarkAll = async (markAs: "read" | "unread") => {
    await fetch("/api/notifications/mark-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAs }),
    });
    fetchNotifications();
  };

  const typeVariant = (type: string) => {
    switch (type) {
      case "success": return "success";
      case "warning": return "warning";
      case "error": return "danger";
      default: return "info";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.notifications.title}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => toggleMarkAll("read")} icon={<CheckCheck className="w-4 h-4" />}>
            {t.notifications.markAllRead}
          </Button>
          <Button variant="outline" size="sm" onClick={() => toggleMarkAll("unread")} icon={<Eye className="w-4 h-4" />}>
            {t.notifications.markAllUnread}
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-gray-400">
              <Bell className="w-12 h-12 mb-3 opacity-50" />
              <p>{t.notifications.noNotifications}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`flex items-start gap-4 px-6 py-4 transition-colors ${!notif.isRead ? "bg-indigo-50/50 dark:bg-indigo-950/20" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"}`}
                >
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.isRead ? "bg-indigo-500" : "bg-transparent"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{notif.title}</p>
                      <Badge variant={typeVariant(notif.type)}>{notif.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notif.createdAt).toLocaleString(locale === "id" ? "id-ID" : "en-US")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
