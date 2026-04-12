"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";
import type { Collection, CollectionItem, Property } from "@/lib/types";
import PropertyCard from "@/components/PropertyCard";

const supabase = createClient();

interface CollectionWithItems extends Collection {
  items: (CollectionItem & { property: Property })[];
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Create form state
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createClientName, setCreateClientName] = useState("");
  const [createClientEmail, setCreateClientEmail] = useState("");
  const [createSaving, setCreateSaving] = useState(false);

  // Add property state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingToCollection, setAddingToCollection] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    fetchCollections();
  }, []);

  async function fetchCollections() {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: cols, error } = await supabase
        .from("collections")
        .select("*")
        .eq("agent_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching collections:", error);
        return;
      }

      // Fetch items for each collection
      const collectionsWithItems: CollectionWithItems[] = [];
      for (const col of cols || []) {
        const { data: items } = await supabase
          .from("collection_items")
          .select("*, property:properties(*)")
          .eq("collection_id", col.id)
          .order("position", { ascending: true });

        collectionsWithItems.push({
          ...col,
          items: (items || []) as (CollectionItem & { property: Property })[],
        });
      }

      setCollections(collectionsWithItems);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!createName.trim()) return;
    setCreateSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase.from("collections").insert({
        agent_id: userData.user.id,
        name: createName.trim(),
        description: createDescription.trim() || null,
        client_name: createClientName.trim() || null,
        client_email: createClientEmail.trim() || null,
      });

      if (error) {
        console.error("Error creating collection:", error);
        setToast("Error creating collection");
        return;
      }

      setToast("Collection created");
      setCreateName("");
      setCreateDescription("");
      setCreateClientName("");
      setCreateClientEmail("");
      setShowCreate(false);
      fetchCollections();
    } finally {
      setCreateSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this collection? This cannot be undone.")) return;

    const { error } = await supabase.from("collections").delete().eq("id", id);
    if (error) {
      console.error("Error deleting:", error);
      return;
    }
    setToast("Collection deleted");
    fetchCollections();
  }

  async function copyShareLink(token: string) {
    const url = `${window.location.origin}/shared/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setToast("Share link copied to clipboard");
    } catch {
      setToast("Could not copy link");
    }
  }

  async function searchProperties(query: string) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", userData.user.id)
        .eq("status", "active")
        .ilike("address", `%${query}%`)
        .limit(10);

      setSearchResults(data || []);
    } finally {
      setSearching(false);
    }
  }

  async function addPropertyToCollection(collectionId: string, propertyId: string) {
    const { error } = await supabase.from("collection_items").insert({
      collection_id: collectionId,
      property_id: propertyId,
      position: 0,
    });

    if (error) {
      if (error.code === "23505") {
        setToast("Property already in collection");
      } else {
        console.error("Error adding property:", error);
        setToast("Error adding property");
      }
      return;
    }

    setToast("Property added");
    setSearchQuery("");
    setSearchResults([]);
    fetchCollections();
  }

  async function removePropertyFromCollection(itemId: string) {
    const { error } = await supabase.from("collection_items").delete().eq("id", itemId);
    if (error) {
      console.error("Error removing property:", error);
      return;
    }
    setToast("Property removed");
    fetchCollections();
  }

  async function updateNotes(itemId: string, notes: string) {
    const { error } = await supabase
      .from("collection_items")
      .update({ agent_notes: notes || null })
      .eq("id", itemId);

    if (error) {
      console.error("Error updating notes:", error);
      return;
    }
    setToast("Notes saved");
    fetchCollections();
  }

  const inputClass =
    "w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a962] transition-colors";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1c1c2e] border border-[#c9a962] text-[#c9a962] px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 5C3 4.44772 3.44772 4 4 4H9L11 6H20C20.5523 6 21 6.44772 21 7V18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18V5Z" />
          </svg>
          <h1 className="text-2xl font-bold text-white">Collections</h1>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-[#c9a962] hover:bg-[#b8994f] text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
        >
          + Create Collection
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">New Collection</h2>
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Name *</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              placeholder="e.g., Colyer Family Home Search"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#94a3b8] mb-1">Description</label>
            <textarea
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Client Name</label>
              <input
                type="text"
                value={createClientName}
                onChange={(e) => setCreateClientName(e.target.value)}
                placeholder="John Doe"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-1">Client Email</label>
              <input
                type="email"
                value={createClientEmail}
                onChange={(e) => setCreateClientEmail(e.target.value)}
                placeholder="john@example.com"
                className={inputClass}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={createSaving || !createName.trim()}
              className="bg-[#c9a962] hover:bg-[#b8994f] disabled:opacity-50 text-black px-5 py-2 rounded-lg font-semibold text-sm transition-colors"
            >
              {createSaving ? "Saving..." : "Create Collection"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Collections Grid */}
      {loading ? (
        <div className="text-center text-[#94a3b8] py-12">Loading collections...</div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="mx-auto mb-4">
            <path d="M3 5C3 4.44772 3.44772 4 4 4H9L11 6H20C20.5523 6 21 6.44772 21 7V18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18V5Z" />
          </svg>
          <h3 className="text-white text-lg font-semibold mb-2">No Collections Yet</h3>
          <p className="text-[#94a3b8] mb-4">Curate lists of properties to share with your clients.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#c9a962] hover:bg-[#b8994f] text-black px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
          >
            + Create Your First Collection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((col) => (
            <div
              key={col.id}
              className={`bg-[#1c1c2e] border rounded-xl overflow-hidden transition-colors cursor-pointer ${
                expandedId === col.id ? "border-[#c9a962]" : "border-[#2a2a3a] hover:border-[#3a3a4a]"
              }`}
              onClick={() => setExpandedId(expandedId === col.id ? null : col.id)}
            >
              {/* Thumbnail strip */}
              <div className="flex h-20 bg-[#161620]">
                {col.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex-1 relative">
                    {item.property?.photos?.[0] ? (
                      <img
                        src={item.property.photos[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#2a2a3a] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
                {col.items.length === 0 && (
                  <div className="flex-1 bg-[#2a2a3a] flex items-center justify-center">
                    <span className="text-[#94a3b8] text-xs">No properties</span>
                  </div>
                )}
              </div>

              {/* Card content */}
              <div className="p-4">
                <h3 className="text-white font-semibold text-base mb-1">{col.name}</h3>
                {col.client_name && (
                  <p className="text-[#94a3b8] text-sm mb-1">For: {col.client_name}</p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[#94a3b8] text-xs">
                    {col.items.length} {col.items.length === 1 ? "property" : "properties"}
                  </span>
                  <span className="text-[#94a3b8] text-xs">
                    {new Date(col.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-[#2a2a3a]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyShareLink(col.share_token);
                    }}
                    className="flex-1 bg-[#161620] hover:bg-[#2a2a3a] text-[#c9a962] py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Share Link
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId(col.id);
                    }}
                    className="flex-1 bg-[#161620] hover:bg-[#2a2a3a] text-white py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(col.id);
                    }}
                    className="bg-[#161620] hover:bg-red-900/30 text-red-400 py-1.5 px-3 rounded-lg text-xs font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expanded Collection Detail */}
      {expandedId && (
        <div className="bg-[#1c1c2e] border border-[#c9a962] rounded-xl p-6 space-y-6">
          {(() => {
            const col = collections.find((c) => c.id === expandedId);
            if (!col) return null;

            return (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{col.name}</h2>
                    {col.description && <p className="text-[#94a3b8] text-sm mt-1">{col.description}</p>}
                    {col.client_name && (
                      <p className="text-[#94a3b8] text-sm mt-1">
                        Client: {col.client_name}
                        {col.client_email && ` (${col.client_email})`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyShareLink(col.share_token)}
                      className="bg-[#c9a962] hover:bg-[#b8994f] text-black px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                      </svg>
                      Copy Share Link
                    </button>
                    <button
                      onClick={() => setExpandedId(null)}
                      className="bg-[#2a2a3a] hover:bg-[#3a3a4a] text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>

                {/* Add Properties */}
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">Add Properties</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={addingToCollection === col.id ? searchQuery : ""}
                      onFocus={() => setAddingToCollection(col.id)}
                      onChange={(e) => {
                        setAddingToCollection(col.id);
                        searchProperties(e.target.value);
                      }}
                      placeholder="Search your active listings by address..."
                      className={inputClass}
                    />
                    {searching && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-xs">
                        Searching...
                      </div>
                    )}
                    {addingToCollection === col.id && searchResults.length > 0 && (
                      <div className="absolute z-10 top-full mt-1 w-full bg-[#161620] border border-[#2a2a3a] rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        {searchResults.map((prop) => (
                          <button
                            key={prop.id}
                            onClick={() => addPropertyToCollection(col.id, prop.id)}
                            className="w-full text-left px-4 py-3 hover:bg-[#2a2a3a] flex items-center gap-3 transition-colors"
                          >
                            {prop.photos?.[0] && (
                              <img src={prop.photos[0]} alt="" className="w-10 h-10 rounded object-cover" />
                            )}
                            <div>
                              <p className="text-white text-sm font-medium">{prop.address}</p>
                              <p className="text-[#94a3b8] text-xs">
                                {prop.city}, {prop.state} - $
                                {prop.price.toLocaleString()}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Properties in Collection */}
                {col.items.length === 0 ? (
                  <div className="text-center py-8 text-[#94a3b8]">
                    No properties in this collection yet. Search above to add some.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {col.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#161620] border border-[#2a2a3a] rounded-lg p-4 flex gap-4"
                      >
                        {/* Property thumbnail */}
                        <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
                          {item.property?.photos?.[0] ? (
                            <img
                              src={item.property.photos[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#2a2a3a]" />
                          )}
                        </div>

                        {/* Property info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white font-semibold text-sm truncate">
                            {item.property?.address || "Unknown Property"}
                          </h4>
                          <p className="text-[#94a3b8] text-xs mt-0.5">
                            {item.property?.city}, {item.property?.state} {item.property?.zip}
                          </p>
                          <p className="text-[#c9a962] font-semibold text-sm mt-1">
                            ${item.property?.price?.toLocaleString()}
                          </p>
                          <p className="text-[#94a3b8] text-xs mt-0.5">
                            {item.property?.bedrooms} bed / {item.property?.bathrooms} bath /{" "}
                            {item.property?.sqft?.toLocaleString()} sqft
                          </p>

                          {/* Agent Notes */}
                          <div className="mt-2">
                            <input
                              type="text"
                              defaultValue={item.agent_notes || ""}
                              onBlur={(e) => {
                                if (e.target.value !== (item.agent_notes || "")) {
                                  updateNotes(item.id, e.target.value);
                                }
                              }}
                              placeholder="Add agent notes..."
                              className="w-full bg-[#0a0a0f] border border-[#2a2a3a] rounded px-2 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a962]"
                            />
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removePropertyFromCollection(item.id)}
                          className="self-start text-red-400 hover:text-red-300 p-1"
                          title="Remove from collection"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
