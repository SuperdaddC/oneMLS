"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import type { OpenHouse } from "@/lib/types";

type Tab = "upcoming" | "past" | "cancelled";

interface OpenHouseWithProperty extends Omit<OpenHouse, 'property'> {
  property?: {
    address: string;
    city: string;
    state: string;
    zip: string;
    photos: string[];
    price: number;
  };
}

function formatTime12h(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${m} ${ampm}`;
}

function formatEventDate(dateStr: string) {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function OpenHousesPage() {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [openHouses, setOpenHouses] = useState<OpenHouseWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [properties, setProperties] = useState<{ id: string; address: string; city: string; state: string }[]>([]);
  const [formPropertyId, setFormPropertyId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formStartTime, setFormStartTime] = useState("13:00");
  const [formEndTime, setFormEndTime] = useState("16:00");
  const [formNotes, setFormNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchOpenHouses = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from("open_houses")
      .select("*, property:properties(address, city, state, zip, photos, price)")
      .eq("agent_id", uid)
      .order("event_date", { ascending: true });
    setOpenHouses((data as OpenHouseWithProperty[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        fetchOpenHouses(data.user.id);
        // Fetch agent's properties for the form
        supabase
          .from("properties")
          .select("id, address, city, state")
          .eq("owner_id", data.user.id)
          .order("address")
          .then(({ data: props }) => {
            setProperties(props || []);
          });
      }
    });
  }, [supabase, fetchOpenHouses]);

  const filtered = openHouses.filter((oh) => {
    const today = todayStr();
    if (tab === "upcoming") return oh.status === "scheduled" && oh.event_date >= today;
    if (tab === "past") return oh.status === "completed" || (oh.status === "scheduled" && oh.event_date < today);
    return oh.status === "cancelled";
  });

  const resetForm = () => {
    setFormPropertyId("");
    setFormDate("");
    setFormStartTime("13:00");
    setFormEndTime("16:00");
    setFormNotes("");
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formPropertyId || !formDate || !formStartTime || !formEndTime || !userId) return;
    setSaving(true);

    if (editingId) {
      await supabase
        .from("open_houses")
        .update({
          property_id: formPropertyId,
          event_date: formDate,
          start_time: formStartTime,
          end_time: formEndTime,
          notes: formNotes || null,
        })
        .eq("id", editingId);
    } else {
      await supabase.from("open_houses").insert({
        property_id: formPropertyId,
        agent_id: userId,
        event_date: formDate,
        start_time: formStartTime,
        end_time: formEndTime,
        notes: formNotes || null,
        status: "scheduled",
      });
    }

    setSaving(false);
    setShowForm(false);
    resetForm();
    fetchOpenHouses(userId);
  };

  const handleCancel = async (id: string) => {
    if (!userId) return;
    await supabase.from("open_houses").update({ status: "cancelled" }).eq("id", id);
    fetchOpenHouses(userId);
  };

  const handleDelete = async (id: string) => {
    if (!userId) return;
    await supabase.from("open_houses").delete().eq("id", id);
    fetchOpenHouses(userId);
  };

  const handleEdit = (oh: OpenHouseWithProperty) => {
    setEditingId(oh.id);
    setFormPropertyId(oh.property_id);
    setFormDate(oh.event_date);
    setFormStartTime(oh.start_time);
    setFormEndTime(oh.end_time);
    setFormNotes(oh.notes || "");
    setShowForm(true);
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: "upcoming", label: "Upcoming" },
    { key: "past", label: "Past" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="4" width="18" height="17" rx="2" stroke="#c9a962" strokeWidth="1.5" />
            <path d="M3 9H21" stroke="#c9a962" strokeWidth="1.5" />
            <path d="M8 2V5" stroke="#c9a962" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M16 2V5" stroke="#c9a962" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="12" cy="15" r="2" stroke="#c9a962" strokeWidth="1.5" />
          </svg>
          <h1 className="text-2xl font-bold text-white">Open Houses</h1>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="flex items-center gap-2 rounded-lg bg-[#c9a962] px-4 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-colors hover:bg-[#d4b872]"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3V13M3 8H13" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Schedule Open House
        </button>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="mb-6 rounded-xl border border-[#2a2a3a] bg-[#161620] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {editingId ? "Edit Open House" : "Schedule New Open House"}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#94a3b8] mb-1">Property</label>
              <select
                value={formPropertyId}
                onChange={(e) => setFormPropertyId(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] px-4 py-2.5 text-sm text-white focus:border-[#c9a962] focus:outline-none"
              >
                <option value="">Select a property...</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address}, {p.city}, {p.state}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1">Date</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] px-4 py-2.5 text-sm text-white focus:border-[#c9a962] focus:outline-none"
              />
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-[#94a3b8] mb-1">Start Time</label>
                <input
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                  className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] px-4 py-2.5 text-sm text-white focus:border-[#c9a962] focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-[#94a3b8] mb-1">End Time</label>
                <input
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                  className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] px-4 py-2.5 text-sm text-white focus:border-[#c9a962] focus:outline-none"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-[#94a3b8] mb-1">Notes (optional)</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] px-4 py-2.5 text-sm text-white focus:border-[#c9a962] focus:outline-none resize-none"
                placeholder="e.g. Refreshments provided, enter through side gate..."
              />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || !formPropertyId || !formDate}
              className="rounded-lg bg-[#c9a962] px-6 py-2.5 text-sm font-semibold text-[#0a0a0f] transition-colors hover:bg-[#d4b872] disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Update" : "Save"}
            </button>
            <button
              onClick={() => { setShowForm(false); resetForm(); }}
              className="rounded-lg border border-[#2a2a3a] px-6 py-2.5 text-sm font-semibold text-[#94a3b8] transition-colors hover:border-[#94a3b8] hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 rounded-lg bg-[#161620] p-1 border border-[#2a2a3a] w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-md px-5 py-2 text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-[#c9a962] text-[#0a0a0f]"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c9a962] border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-4 text-[#2a2a3a]">
            <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M9 21V12H15V21" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <p className="text-lg font-semibold text-[#94a3b8]">No open houses {tab === "upcoming" ? "scheduled" : tab === "past" ? "in the past" : "cancelled"}</p>
          {tab === "upcoming" && (
            <p className="mt-1 text-sm text-[#94a3b8]/60">Click &quot;Schedule Open House&quot; to create one.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((oh) => (
            <div
              key={oh.id}
              className="flex items-center gap-4 rounded-xl border border-[#2a2a3a] bg-[#161620] p-4 transition-colors hover:border-[#c9a962]/30"
            >
              {/* Thumbnail */}
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-[#0a0a0f]">
                {oh.property?.photos?.[0] ? (
                  <Image
                    src={oh.property.photos[0]}
                    alt={oh.property?.address || "Property"}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#2a2a3a]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M3 9L12 2L21 9V20H3V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {oh.property ? `${oh.property.address}, ${oh.property.city}, ${oh.property.state} ${oh.property.zip}` : "Unknown Property"}
                </p>
                {oh.property?.price && (
                  <p className="text-xs text-[#c9a962] font-medium">{formatPrice(oh.property.price)}</p>
                )}
                <p className="text-sm text-[#94a3b8] mt-0.5">
                  {formatEventDate(oh.event_date)} &middot; {formatTime12h(oh.start_time)} - {formatTime12h(oh.end_time)}
                </p>
                {oh.notes && (
                  <p className="text-xs text-[#94a3b8]/60 mt-0.5 truncate">{oh.notes}</p>
                )}
              </div>

              {/* Status + Actions */}
              <div className="flex flex-shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    oh.status === "scheduled"
                      ? "bg-green-500/10 text-green-400"
                      : oh.status === "cancelled"
                      ? "bg-red-500/10 text-red-400"
                      : "bg-[#94a3b8]/10 text-[#94a3b8]"
                  }`}
                >
                  {oh.status.charAt(0).toUpperCase() + oh.status.slice(1)}
                </span>
                {oh.status === "scheduled" && (
                  <>
                    <button
                      onClick={() => handleEdit(oh)}
                      className="rounded-lg border border-[#2a2a3a] px-3 py-1.5 text-xs text-[#94a3b8] transition-colors hover:border-[#c9a962] hover:text-[#c9a962]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancel(oh.id)}
                      className="rounded-lg border border-[#2a2a3a] px-3 py-1.5 text-xs text-[#94a3b8] transition-colors hover:border-red-500 hover:text-red-400"
                    >
                      Cancel
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleDelete(oh.id)}
                  className="rounded-lg border border-[#2a2a3a] px-3 py-1.5 text-xs text-[#94a3b8] transition-colors hover:border-red-500 hover:text-red-400"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
