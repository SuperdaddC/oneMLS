"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import { getStateRequirements } from "@/lib/state-disclosures";
import type { Disclosure } from "@/lib/state-disclosures";
import type { ContractType, ContractStatus } from "@/lib/types";

interface PropertyOption {
  id: string;
  address: string;
  city: string;
  state: string;
  year_built: number | null;
}

interface ContractRow {
  id: string;
  property_id: string;
  agent_id: string;
  client_id: string;
  contract_type: ContractType;
  state: string;
  status: ContractStatus;
  document_url: string | null;
  created_at: string;
  signed_at: string | null;
  property?: { address: string; city: string; state: string };
}

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  listing_agreement: "Listing Agreement",
  purchase_offer: "Purchase Offer",
  counteroffer: "Counteroffer",
};

const STATUS_STYLES: Record<ContractStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: "bg-gray-900/50", text: "text-gray-400", border: "border-gray-700/50" },
  sent: { bg: "bg-blue-900/50", text: "text-blue-400", border: "border-blue-700/50" },
  signed: { bg: "bg-green-900/50", text: "text-green-400", border: "border-green-700/50" },
  executed: { bg: "bg-[#c9a962]/10", text: "text-[#c9a962]", border: "border-[#c9a962]/30" },
  expired: { bg: "bg-red-900/50", text: "text-red-400", border: "border-red-700/50" },
};

export default function EContractsPage() {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [contractType, setContractType] = useState<ContractType>("listing_agreement");
  const [clientFirstName, setClientFirstName] = useState("");
  const [clientLastName, setClientLastName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [checkedDisclosures, setCheckedDisclosures] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const stateCode = selectedProperty?.state || "";
  const stateReqs = stateCode ? getStateRequirements(stateCode) : null;

  const loadData = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const [contractsRes, propertiesRes] = await Promise.all([
      supabase
        .from("contracts")
        .select("*, property:properties(address, city, state)")
        .eq("agent_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("properties")
        .select("id, address, city, state, year_built")
        .eq("owner_id", user.id),
    ]);

    if (contractsRes.data) setContracts(contractsRes.data as ContractRow[]);
    if (propertiesRes.data) setProperties(propertiesRes.data as PropertyOption[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const shouldShowDisclosure = (d: Disclosure): boolean => {
    if (d.condition === "pre_1978" && selectedProperty?.year_built) {
      return selectedProperty.year_built < 1978;
    }
    if (d.condition === "pre_1978" && !selectedProperty?.year_built) {
      return true; // Show if year unknown
    }
    return true;
  };

  const resetForm = () => {
    setSelectedPropertyId("");
    setContractType("listing_agreement");
    setClientFirstName("");
    setClientLastName("");
    setClientEmail("");
    setCheckedDisclosures({});
    setShowCreate(false);
  };

  const handleCreate = async () => {
    if (!selectedPropertyId || !clientFirstName || !clientLastName || !clientEmail) return;
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("contracts").insert({
      property_id: selectedPropertyId,
      agent_id: user.id,
      client_id: user.id, // placeholder -- would be actual client id in production
      contract_type: contractType,
      state: stateCode,
      status: "draft" as ContractStatus,
    });

    if (!error) {
      resetForm();
      await loadData();
    }
    setSaving(false);
  };

  const handleStatusChange = async (contractId: string, newStatus: ContractStatus) => {
    await supabase
      .from("contracts")
      .update({ status: newStatus })
      .eq("id", contractId);
    await loadData();
  };

  const handleDelete = async (contractId: string) => {
    await supabase.from("contracts").delete().eq("id", contractId);
    await loadData();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-[#94a3b8]">Loading contracts...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2H14L20 8V22H6V2Z"
              stroke="#c9a962"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M14 2V8H20"
              stroke="#c9a962"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path d="M10 13H16" stroke="#c9a962" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M10 17H14" stroke="#c9a962" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <h1 className="text-2xl font-bold text-white">E-Contracts</h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-5 py-2.5 bg-[#c9a962] text-black font-semibold rounded-lg hover:bg-[#d4b872] transition-colors flex items-center gap-2"
        >
          <span className="text-lg">+</span> Create Contract
        </button>
      </div>

      {/* Create Contract Form */}
      {showCreate && (
        <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-6 space-y-5">
          <h2 className="text-lg font-semibold text-white">New Contract</h2>

          {/* Property Select */}
          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5">Select Property</label>
            <select
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setCheckedDisclosures({});
              }}
              className="w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a962]"
            >
              <option value="">-- Select a property --</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.address}, {p.city}, {p.state}
                </option>
              ))}
            </select>
          </div>

          {/* Contract Type */}
          <div>
            <label className="block text-sm text-[#94a3b8] mb-1.5">Contract Type</label>
            <select
              value={contractType}
              onChange={(e) => setContractType(e.target.value as ContractType)}
              className="w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a962]"
            >
              <option value="listing_agreement">Listing Agreement</option>
              <option value="purchase_offer">Purchase Offer</option>
              <option value="counteroffer">Counteroffer</option>
            </select>
          </div>

          {/* Client Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">First Name</label>
              <input
                type="text"
                value={clientFirstName}
                onChange={(e) => setClientFirstName(e.target.value)}
                className="w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a962]"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">Last Name</label>
              <input
                type="text"
                value={clientLastName}
                onChange={(e) => setClientLastName(e.target.value)}
                className="w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a962]"
                placeholder="Doe"
              />
            </div>
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#c9a962]"
                placeholder="john@example.com"
              />
            </div>
          </div>

          {/* State auto-fill */}
          {stateCode && (
            <div>
              <label className="block text-sm text-[#94a3b8] mb-1.5">State</label>
              <div className="bg-[#161620] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-white text-sm">
                {stateReqs?.stateName || stateCode} ({stateCode})
              </div>
            </div>
          )}

          {/* State-specific disclosures */}
          {stateReqs && (
            <div className="border border-[#2a2a3a] rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">
                {stateReqs.stateName} Required Disclosures
              </h3>
              <div className="space-y-2">
                {stateReqs.disclosures
                  .filter(shouldShowDisclosure)
                  .map((d) => (
                    <label
                      key={d.id}
                      className="flex items-start gap-3 py-1.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={checkedDisclosures[d.id] || false}
                        onChange={(e) =>
                          setCheckedDisclosures({
                            ...checkedDisclosures,
                            [d.id]: e.target.checked,
                          })
                        }
                        className="mt-0.5 w-4 h-4 rounded border-[#2a2a3a] bg-[#161620] text-[#c9a962] focus:ring-[#c9a962] focus:ring-offset-0"
                      />
                      <div>
                        <span className="text-sm text-white group-hover:text-[#c9a962] transition-colors">
                          {d.label}
                        </span>
                        {d.required && (
                          <span className="ml-2 text-xs text-red-400">Required</span>
                        )}
                        <p className="text-xs text-[#94a3b8] mt-0.5">{d.description}</p>
                      </div>
                    </label>
                  ))}
              </div>
              <p className="text-xs text-[#94a3b8] mt-3 pt-3 border-t border-[#2a2a3a]">
                {stateReqs.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleCreate}
              disabled={saving || !selectedPropertyId || !clientFirstName || !clientLastName || !clientEmail}
              className="px-5 py-2.5 bg-[#c9a962] text-black font-semibold rounded-lg hover:bg-[#d4b872] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Contract"}
            </button>
            <button
              onClick={resetForm}
              className="px-5 py-2.5 bg-[#2a2a3a] text-[#94a3b8] font-medium rounded-lg hover:bg-[#3a3a4a] transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contract List */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a3a]">
                <th className="px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  Property
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  Client
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  Type
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  State
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  Created
                </th>
                <th className="px-4 py-3 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]/50">
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#94a3b8] text-sm">
                    No contracts yet. Click &quot;+ Create Contract&quot; to get started.
                  </td>
                </tr>
              ) : (
                contracts.map((c) => {
                  const style = STATUS_STYLES[c.status];
                  return (
                    <tr key={c.id} className="hover:bg-[#161620] transition-colors">
                      <td className="px-4 py-3 text-sm text-white">
                        {c.property
                          ? `${c.property.address}, ${c.property.city}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {c.client_id ? c.client_id.slice(0, 8) + "..." : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {CONTRACT_TYPE_LABELS[c.contract_type]}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{c.state}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border}`}
                        >
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white rounded text-xs font-medium transition-colors">
                            View
                          </button>
                          {c.status === "draft" && (
                            <>
                              <button className="px-3 py-1 bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white rounded text-xs font-medium transition-colors">
                                Edit
                              </button>
                              <button
                                onClick={() => handleStatusChange(c.id, "sent")}
                                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                              >
                                Send
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="px-3 py-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded text-xs font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
