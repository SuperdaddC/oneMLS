"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { BrandKit } from "@/lib/types";

const supabase = createClient();

export default function BrandKitPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    primary_color: "#c9a962",
    secondary_color: "#0f172a",
    logo_url: "",
    tagline: "",
    website_url: "",
    social_instagram: "",
    social_facebook: "",
    social_linkedin: "",
    social_twitter: "",
  });

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchBrandKit();
  }, []);

  async function fetchBrandKit() {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("brand_kits")
        .select("*")
        .eq("user_id", userData.user.id)
        .single();

      if (data && !error) {
        setForm({
          primary_color: data.primary_color || "#c9a962",
          secondary_color: data.secondary_color || "#0f172a",
          logo_url: data.logo_url || "",
          tagline: data.tagline || "",
          website_url: data.website_url || "",
          social_instagram: data.social_instagram || "",
          social_facebook: data.social_facebook || "",
          social_linkedin: data.social_linkedin || "",
          social_twitter: data.social_twitter || "",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const payload = {
        user_id: userData.user.id,
        primary_color: form.primary_color,
        secondary_color: form.secondary_color,
        logo_url: form.logo_url || null,
        tagline: form.tagline || null,
        website_url: form.website_url || null,
        social_instagram: form.social_instagram || null,
        social_facebook: form.social_facebook || null,
        social_linkedin: form.social_linkedin || null,
        social_twitter: form.social_twitter || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("brand_kits")
        .upsert(payload, { onConflict: "user_id" });

      if (error) {
        console.error("Error saving brand kit:", error);
        setToast("Error saving brand kit");
        return;
      }

      setToast("Brand kit saved");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogoUpload(file: File) {
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const ext = file.name.split(".").pop();
      const fileName = `${userData.user.id}/brand-logo-${Date.now()}.${ext}`;

      const { error } = await supabase.storage.from("avatars").upload(fileName, file);
      if (error) {
        console.error("Logo upload error:", error);
        setToast("Error uploading logo");
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setForm((prev) => ({ ...prev, logo_url: urlData.publicUrl }));
      setToast("Logo uploaded");
    } finally {
      setUploading(false);
    }
  }

  function removeLogo() {
    setForm((prev) => ({ ...prev, logo_url: "" }));
  }

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass =
    "w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a962] transition-colors";
  const labelClass = "block text-sm font-medium text-[#94a3b8] mb-1";

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center text-[#94a3b8] py-12">Loading brand kit...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1c1c2e] border border-[#c9a962] text-[#c9a962] px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 12.87 8.13 16 12 16C12.55 16 13 15.55 13 15C13 14.76 12.89 14.55 12.73 14.39C12.57 14.23 12.46 14.01 12.46 13.76C12.46 13.21 12.91 12.76 13.46 12.76H14.76C17.1 12.76 19 10.86 19 8.52C19 4.92 15.87 2 12 2Z" />
          <circle cx="7.5" cy="8.5" r="1.5" fill="#c9a962" />
          <circle cx="10.5" cy="5.5" r="1.5" fill="#c9a962" />
          <circle cx="14.5" cy="5.5" r="1.5" fill="#c9a962" />
          <circle cx="16.5" cy="8.5" r="1.5" fill="#c9a962" />
        </svg>
        <div>
          <h1 className="text-2xl font-bold text-white">Brand Kit</h1>
          <p className="text-[#94a3b8] text-sm">Customize your branding for marketing materials</p>
        </div>
      </div>

      {/* Brand Colors */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Brand Colors</h2>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Primary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primary_color}
                onChange={(e) => update("primary_color", e.target.value)}
                className="w-12 h-10 rounded border border-[#2a2a3a] cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={form.primary_color}
                onChange={(e) => update("primary_color", e.target.value)}
                placeholder="#c9a962"
                className={`${inputClass} flex-1`}
              />
              <div
                className="w-10 h-10 rounded-lg border border-[#2a2a3a]"
                style={{ backgroundColor: form.primary_color }}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Secondary Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.secondary_color}
                onChange={(e) => update("secondary_color", e.target.value)}
                className="w-12 h-10 rounded border border-[#2a2a3a] cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={form.secondary_color}
                onChange={(e) => update("secondary_color", e.target.value)}
                placeholder="#0f172a"
                className={`${inputClass} flex-1`}
              />
              <div
                className="w-10 h-10 rounded-lg border border-[#2a2a3a]"
                style={{ backgroundColor: form.secondary_color }}
              />
            </div>
          </div>
        </div>

        {/* Social Card Preview */}
        <div>
          <label className={labelClass}>Preview - Social Media Card</label>
          <div
            className="rounded-xl overflow-hidden max-w-sm border border-[#2a2a3a]"
            style={{ backgroundColor: form.secondary_color }}
          >
            <div className="h-2" style={{ backgroundColor: form.primary_color }} />
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: form.primary_color, color: form.secondary_color }}
                  >
                    O
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-semibold">Agent Name</p>
                  <p style={{ color: form.primary_color }} className="text-xs">
                    {form.tagline || "Your Trusted Real Estate Partner"}
                  </p>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg h-28 flex items-center justify-center mb-3">
                <span className="text-white/40 text-xs">Property Photo</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">123 Main St</p>
                  <p className="text-white/60 text-xs">Denver, CO 80202</p>
                </div>
                <p style={{ color: form.primary_color }} className="text-sm font-bold">
                  $750,000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Logo</h2>
        <div className="flex items-center gap-6">
          {form.logo_url ? (
            <div className="relative">
              <img
                src={form.logo_url}
                alt="Brand Logo"
                className="w-24 h-24 rounded-xl object-cover border border-[#2a2a3a]"
              />
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                X
              </button>
            </div>
          ) : (
            <div className="w-24 h-24 rounded-xl border-2 border-dashed border-[#2a2a3a] flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          )}
          <div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]);
                e.target.value = "";
              }}
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              disabled={uploading}
              className="bg-[#161620] hover:bg-[#2a2a3a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-[#2a2a3a]"
            >
              {uploading ? "Uploading..." : "Upload Logo"}
            </button>
            <p className="text-[#94a3b8] text-xs mt-2">PNG, JPG, or SVG. Recommended 200x200px.</p>
          </div>
        </div>
      </div>

      {/* Contact & Social */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Contact & Social</h2>
        <div>
          <label className={labelClass}>Tagline</label>
          <input
            type="text"
            value={form.tagline}
            onChange={(e) => update("tagline", e.target.value)}
            placeholder="Your Trusted Real Estate Partner"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Website URL</label>
          <input
            type="url"
            value={form.website_url}
            onChange={(e) => update("website_url", e.target.value)}
            placeholder="https://yoursite.com"
            className={inputClass}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Instagram Handle</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">@</span>
              <input
                type="text"
                value={form.social_instagram}
                onChange={(e) => update("social_instagram", e.target.value)}
                placeholder="yourusername"
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Facebook URL</label>
            <input
              type="url"
              value={form.social_facebook}
              onChange={(e) => update("social_facebook", e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>LinkedIn URL</label>
            <input
              type="url"
              value={form.social_linkedin}
              onChange={(e) => update("social_linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/yourprofile"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Twitter / X Handle</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">@</span>
              <input
                type="text"
                value={form.social_twitter}
                onChange={(e) => update("social_twitter", e.target.value)}
                placeholder="yourusername"
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Agent Card Preview */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-white">Preview - Agent Card</h2>
        <div
          className="rounded-xl max-w-sm border border-[#2a2a3a] overflow-hidden"
          style={{ backgroundColor: form.secondary_color }}
        >
          <div className="p-5 flex items-center gap-4">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold"
                style={{ backgroundColor: form.primary_color, color: form.secondary_color }}
              >
                O
              </div>
            )}
            <div>
              <p className="text-white font-bold text-lg">Agent Name</p>
              <p style={{ color: form.primary_color }} className="text-sm font-medium">
                {form.tagline || "Your Trusted Real Estate Partner"}
              </p>
              {form.website_url && (
                <p className="text-white/50 text-xs mt-1">{form.website_url}</p>
              )}
            </div>
          </div>
          <div className="px-5 pb-4 flex gap-3">
            {form.social_instagram && (
              <span className="text-white/50 text-xs">IG: @{form.social_instagram}</span>
            )}
            {form.social_twitter && (
              <span className="text-white/50 text-xs">X: @{form.social_twitter}</span>
            )}
          </div>
          <div className="h-1.5" style={{ backgroundColor: form.primary_color }} />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#c9a962] hover:bg-[#b8994f] disabled:opacity-50 text-black px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          {saving ? "Saving..." : "Save Brand Kit"}
        </button>
      </div>
    </div>
  );
}
