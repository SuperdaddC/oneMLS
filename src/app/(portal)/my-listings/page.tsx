"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Property } from "@/lib/types";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-900/50 text-green-400 border-green-700/50",
  pending: "bg-yellow-900/50 text-yellow-400 border-yellow-700/50",
  sold: "bg-blue-900/50 text-blue-400 border-blue-700/50",
  withdrawn: "bg-gray-900/50 text-gray-400 border-gray-700/50",
  cancelled: "bg-red-900/50 text-red-400 border-red-700/50",
  draft: "bg-gray-900/50 text-gray-400 border-gray-600/50",
};

export default function MyListingsPageWrapper() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-400">Loading...</div>}>
      <MyListingsPage />
    </Suspense>
  );
}

function MyListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const initialFilter = searchParams.get("status") || "";
  const [claimSearch, setClaimSearch] = useState("");
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(initialFilter);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", userData.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading listings:", error);
    } else {
      setListings((data as Property[]) || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      alert("Error deleting listing: " + error.message);
    } else {
      setListings((prev) => prev.filter((l) => l.id !== id));
    }
    setDeleteId(null);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400">
        <span className="hover:text-white cursor-pointer" onClick={() => router.push("/dashboard")}>
          Dashboard
        </span>
        <span className="mx-2">/</span>
        <span className="text-white">My Listings</span>
      </div>

      <h1 className="text-2xl font-bold text-white">My Listings</h1>

      {/* Top Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Create New */}
        <div className="bg-[#1c1c2e] rounded-lg p-6 flex items-center">
          <button
            onClick={() => router.push("/my-listings/create")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <span className="text-xl">+</span> Create New Listing
          </button>
        </div>

        {/* Right - Claim Existing */}
        <div className="bg-[#1c1c2e] rounded-lg p-6 space-y-3">
          <h3 className="text-lg font-semibold text-white">Claim an Existing Listing</h3>
          <p className="text-sm text-gray-400">
            Already have a property listed? Enter your MLS ID or property address to claim it.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={claimSearch}
              onChange={(e) => setClaimSearch(e.target.value)}
              placeholder="MLS ID or Address"
              className="flex-1 bg-[#161620] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors">
              Search &amp; Claim
            </button>
          </div>
        </div>
      </div>

      {/* Status Filter Bar */}
      {listings.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "", label: "All", color: "bg-gray-600" },
            { key: "draft", label: "Drafts", color: "bg-[#c9a962] text-black" },
            { key: "active", label: "Active", color: "bg-blue-600" },
            { key: "pending", label: "Pending", color: "bg-green-600" },
            { key: "withdrawn", label: "Withdrawn", color: "bg-red-600" },
            { key: "sold", label: "Sold", color: "bg-gray-500" },
            { key: "cancelled", label: "Cancelled", color: "bg-gray-700" },
          ].map((f) => {
            const count = f.key ? listings.filter((l) => l.status === f.key).length : listings.length;
            if (f.key && count === 0) return null;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === f.key
                    ? `${f.color} text-white ring-2 ring-white/30`
                    : "bg-[#161620] text-gray-400 hover:text-white"
                }`}
              >
                {f.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Listings Table */}
      <div className="bg-[#1c1c2e] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4"
              />
            </svg>
            <p className="text-gray-400 text-lg mb-2">No listings yet</p>
            <p className="text-gray-500 text-sm mb-4">
              Create your first property listing to get started.
            </p>
            <button
              onClick={() => router.push("/my-listings/create")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Create New Listing
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#0d4f4f] text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Photo</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">City</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">State</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Zip</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {listings.filter((l) => !statusFilter || l.status === statusFilter).map((listing) => (
                  <tr key={listing.id} className="hover:bg-[#1e1e32] transition-colors">
                    <td className="px-4 py-3">
                      {listing.photos && listing.photos.length > 0 ? (
                        <img
                          src={listing.photos[0]}
                          alt={listing.address}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                          No Photo
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white text-sm">{listing.address}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{listing.city}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{listing.state}</td>
                    <td className="px-4 py-3 text-gray-300 text-sm">{listing.zip}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">
                      ${listing.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          STATUS_STYLES[listing.status] || STATUS_STYLES.draft
                        }`}
                      >
                        {listing.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/my-listings/${listing.id}/edit`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => router.push(`/my-listings/${listing.id}`)}
                          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => setDeleteId(listing.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-[#1c1c2e] rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Listing</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
