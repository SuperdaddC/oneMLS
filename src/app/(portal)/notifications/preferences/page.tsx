"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { NotificationPreferences } from "@/lib/types";

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm text-white">{label}</p>
        {description && (
          <p className="text-xs text-[#94a3b8] mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-[#c9a962]" : "bg-[#2a2a3a]"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function PushNotificationSection({
  pushEnabled,
  onToggle,
}: {
  pushEnabled: boolean;
  onToggle: (val: boolean) => void;
}) {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | "unsupported">("default");
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionStatus(Notification.permission);
    } else {
      setPermissionStatus("unsupported");
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      setPermissionStatus("unsupported");
      return;
    }
    const result = await Notification.requestPermission();
    setPermissionStatus(result);
    if (result === "granted") {
      new Notification("OneMLS", {
        body: "Push notifications enabled!",
        icon: "/icon-192.png",
      });
    }
  };

  const sendTestNotification = () => {
    if (Notification.permission === "granted") {
      new Notification("OneMLS Test", {
        body: "This is a test notification from OneMLS.",
        icon: "/icon-192.png",
      });
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    }
  };

  return (
    <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5 mb-6">
      <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">
        Push Notifications
      </h2>
      <Toggle
        label="Enable push notifications"
        description="Receive real-time notifications in your browser"
        checked={pushEnabled}
        onChange={onToggle}
      />

      {pushEnabled && (
        <div className="mt-3 pt-3 border-t border-[#2a2a3a] space-y-3">
          {permissionStatus === "unsupported" ? (
            <p className="text-xs text-red-400">
              Your browser does not support push notifications.
            </p>
          ) : permissionStatus === "granted" ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-green-400">Notifications enabled</span>
              </div>
              <button
                onClick={sendTestNotification}
                className="px-4 py-2 bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white text-sm rounded-lg transition-colors"
              >
                {testSent ? "Test sent!" : "Send Test Notification"}
              </button>
            </>
          ) : permissionStatus === "denied" ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-sm text-red-400">
                Notifications blocked. Please enable them in your browser settings.
              </span>
            </div>
          ) : (
            <button
              onClick={requestPermission}
              className="px-4 py-2 bg-[#c9a962] hover:bg-[#d4b872] text-black text-sm font-semibold rounded-lg transition-colors"
            >
              Allow Browser Notifications
            </button>
          )}
        </div>
      )}

      {!pushEnabled && (
        <p className="text-xs text-[#94a3b8] mt-2">
          Push notifications are disabled.
        </p>
      )}
    </div>
  );
}

export default function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setPrefs(data as NotificationPreferences);
      } else {
        // Default preferences
        setPrefs({
          user_id: user.id,
          email_showing_requests: true,
          email_messages: true,
          email_listing_views: false,
          email_open_house_reminders: true,
          email_new_saves: true,
          email_marketing_tips: false,
          push_enabled: true,
        });
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  const updatePref = (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: value });
    setSaved(false);
  };

  const savePreferences = async () => {
    if (!prefs) return;
    setSaving(true);

    await supabase
      .from("notification_preferences")
      .upsert({
        ...prefs,
        updated_at: new Date().toISOString(),
      });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-[#94a3b8]">
        Loading preferences...
      </div>
    );
  }

  if (!prefs) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">
        Notification Preferences
      </h1>

      {/* Showing Activity */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">
          Showing Activity
        </h2>
        <Toggle
          label="Email me when someone requests a showing"
          checked={prefs.email_showing_requests}
          onChange={(val) => updatePref("email_showing_requests", val)}
        />
      </div>

      {/* Messages */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">
          Messages
        </h2>
        <Toggle
          label="Email me when I receive a new message"
          checked={prefs.email_messages}
          onChange={(val) => updatePref("email_messages", val)}
        />
      </div>

      {/* Listing Activity */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">
          Listing Activity
        </h2>
        <Toggle
          label="Email me when my listing hits a view milestone"
          checked={prefs.email_listing_views}
          onChange={(val) => updatePref("email_listing_views", val)}
        />
        <div className="border-t border-[#2a2a3a]" />
        <Toggle
          label="Email me when someone saves my listing"
          checked={prefs.email_new_saves}
          onChange={(val) => updatePref("email_new_saves", val)}
        />
      </div>

      {/* Open Houses */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">
          Open Houses
        </h2>
        <Toggle
          label="Email me a reminder before my open houses"
          checked={prefs.email_open_house_reminders}
          onChange={(val) => updatePref("email_open_house_reminders", val)}
        />
      </div>

      {/* Marketing */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">
          Marketing
        </h2>
        <Toggle
          label="Send me marketing tips and platform updates"
          checked={prefs.email_marketing_tips}
          onChange={(val) => updatePref("email_marketing_tips", val)}
        />
      </div>

      {/* Push Notifications */}
      <PushNotificationSection
        pushEnabled={prefs.push_enabled}
        onToggle={(val) => updatePref("push_enabled", val)}
      />

      {/* Save button */}
      <div className="flex items-center gap-3">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="px-6 py-2.5 bg-[#c9a962] text-black font-semibold rounded-lg hover:bg-[#d4b872] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
        {saved && (
          <span className="text-sm text-green-400">Preferences saved!</span>
        )}
      </div>
    </div>
  );
}
