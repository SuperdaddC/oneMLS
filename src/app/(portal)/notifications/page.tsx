"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Notification, NotificationType } from "@/lib/types";

const typeLabels: Record<NotificationType, string> = {
  showing_request: "Showing Requests",
  showing_approved: "Approved Showings",
  showing_denied: "Denied Showings",
  new_message: "Messages",
  listing_view_milestone: "View Milestones",
  open_house_reminder: "Open House Reminders",
  price_change: "Price Changes",
  new_save: "Saves",
  new_lead: "Leads",
  system: "System",
};

function getTypeIcon(type: NotificationType) {
  const iconMap: Record<NotificationType, { color: string; path: string }> = {
    showing_request: {
      color: "text-blue-400",
      path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    showing_approved: {
      color: "text-green-400",
      path: "M5 13l4 4L19 7",
    },
    showing_denied: {
      color: "text-red-400",
      path: "M6 18L18 6M6 6l12 12",
    },
    new_message: {
      color: "text-blue-400",
      path: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
    },
    listing_view_milestone: {
      color: "text-[#c9a962]",
      path: "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
    },
    open_house_reminder: {
      color: "text-[#c9a962]",
      path: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    },
    price_change: {
      color: "text-green-400",
      path: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1",
    },
    new_save: {
      color: "text-red-400",
      path: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    },
    new_lead: {
      color: "text-green-400",
      path: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
    },
    system: {
      color: "text-gray-400",
      path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    },
  };

  const icon = iconMap[type];
  return (
    <svg className={`w-5 h-5 ${icon.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={icon.path} />
    </svg>
  );
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

type FilterTab = "all" | "unread";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>("all");
  const [typeFilter, setTypeFilter] = useState<NotificationType | "all">("all");
  const router = useRouter();
  const supabase = createClient();

  const fetchNotifications = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setLoading(true);

    let query = supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (tab === "unread") {
      query = query.eq("read", false);
    }
    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }

    const { data } = await query;
    setNotifications(data ?? []);
    setLoading(false);
  }, [supabase, tab, typeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAllRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.read) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
      );
    }
    if (notification.link) {
      router.push(notification.link);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#c9a962]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/notifications/preferences")}
            className="px-4 py-2 text-sm border border-[#2a2a3a] text-[#94a3b8] rounded-lg hover:bg-[#1c1c2e] transition-colors"
          >
            Preferences
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-4 py-2 text-sm bg-[#c9a962] text-black font-medium rounded-lg hover:bg-[#d4b872] transition-colors"
            >
              Mark All Read
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex bg-[#1c1c2e] rounded-lg p-1 border border-[#2a2a3a]">
          <button
            onClick={() => setTab("all")}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              tab === "all"
                ? "bg-[#c9a962] text-black font-medium"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTab("unread")}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
              tab === "unread"
                ? "bg-[#c9a962] text-black font-medium"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            Unread
          </button>
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as NotificationType | "all")}
          className="bg-[#1c1c2e] border border-[#2a2a3a] text-sm text-[#94a3b8] rounded-lg px-3 py-2 focus:outline-none focus:border-[#c9a962]"
        >
          <option value="all">All Types</option>
          {(Object.keys(typeLabels) as NotificationType[]).map((type) => (
            <option key={type} value={type}>
              {typeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-12 text-[#94a3b8]">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-[#2a2a3a] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-[#94a3b8] text-sm">
              {tab === "unread"
                ? "No unread notifications"
                : typeFilter !== "all"
                ? `No ${typeLabels[typeFilter].toLowerCase()} notifications`
                : "No notifications yet"}
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => handleClick(notification)}
              className={`w-full text-left p-4 rounded-xl border transition-colors flex gap-4 items-start ${
                !notification.read
                  ? "bg-[#1c1c2e] border-l-2 border-l-[#c9a962] border-t-[#2a2a3a] border-r-[#2a2a3a] border-b-[#2a2a3a]"
                  : "bg-[#161620] border-[#2a2a3a] hover:bg-[#1c1c2e]"
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {getTypeIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={`text-sm ${
                      !notification.read
                        ? "font-semibold text-white"
                        : "text-[#94a3b8]"
                    }`}
                  >
                    {notification.title}
                  </p>
                  <span className="text-xs text-[#94a3b8]/60 flex-shrink-0">
                    {relativeTime(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-[#94a3b8] mt-1">{notification.body}</p>
              </div>
              {!notification.read && (
                <div className="w-2 h-2 rounded-full bg-[#c9a962] mt-2 flex-shrink-0" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
