"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { Property, Profile } from "@/lib/types";
import SocialCardGenerator from "@/components/marketing/SocialCardGenerator";
import FlyerGenerator from "@/components/marketing/FlyerGenerator";
import PropertyWebsite from "@/components/marketing/PropertyWebsite";
import QRCodeGenerator from "@/components/marketing/QRCodeGenerator";

type Tab = "social" | "pdf" | "website" | "qr";

const tabs: { key: Tab; label: string }[] = [
  { key: "social", label: "Social Cards" },
  { key: "pdf", label: "PDF Flyers" },
  { key: "website", label: "Property Website" },
  { key: "qr", label: "QR Code" },
];

export default function MarketingMaterialsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("social");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: props }, { data: prof }] = await Promise.all([
        supabase.from("properties").select("*").eq("owner_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);

      if (props) setProperties(props);
      if (prof) setProfile(prof);
      setLoading(false);
    };
    load();
  }, []);

  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;

  const agentName = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : "";
  const agentPhone = profile?.phone ?? "";
  const agentEmail = profile?.email ?? "";
  const brokerageName = profile?.brokerage_name ?? "";

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
        <span>Portal</span>
        <span>/</span>
        <span className="text-white">Marketing Materials</span>
      </div>

      <h1 className="text-2xl font-bold text-white">Marketing Materials</h1>

      {/* Property selector */}
      <div className="max-w-md">
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Select a Property
        </label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:border-[#c9a962]"
        >
          <option value="">-- Choose a listing --</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.address}, {p.city}, {p.state} {p.zip}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-[#94a3b8] text-sm">Loading properties...</p>
      )}

      {!loading && !selectedProperty && (
        <div className="bg-[#1c1c2e] rounded-lg p-12 text-center">
          <div className="text-5xl mb-4">📣</div>
          <p className="text-[#94a3b8]">
            Select a property above to generate marketing materials
          </p>
        </div>
      )}

      {selectedProperty && (
        <>
          {/* Tab buttons */}
          <div className="flex gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#c9a962] text-black"
                    : "bg-[#1c1c2e] text-[#94a3b8] hover:text-white border border-[#2a2a3a]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-2">
            {activeTab === "social" && (
              <SocialCardGenerator
                property={selectedProperty}
                agentName={agentName}
                agentPhone={agentPhone}
                brokerageName={brokerageName}
              />
            )}
            {activeTab === "pdf" && (
              <FlyerGenerator
                property={selectedProperty}
                agentName={agentName}
                agentPhone={agentPhone}
                agentEmail={agentEmail}
                brokerageName={brokerageName}
              />
            )}
            {activeTab === "website" && (
              <PropertyWebsite property={selectedProperty} />
            )}
            {activeTab === "qr" && (
              <QRCodeGenerator property={selectedProperty} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
