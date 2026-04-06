"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Property } from "@/lib/types";

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family",
  condo: "Condo",
  townhouse: "Townhouse",
  multi_family: "Multi-Family",
  land: "Land",
  commercial: "Commercial",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-900/50 text-green-400 border-green-700/50",
  pending: "bg-yellow-900/50 text-yellow-400 border-yellow-700/50",
  sold: "bg-blue-900/50 text-blue-400 border-blue-700/50",
  withdrawn: "bg-gray-900/50 text-gray-400 border-gray-700/50",
  cancelled: "bg-red-900/50 text-red-400 border-red-700/50",
  draft: "bg-gray-900/50 text-gray-400 border-gray-600/50",
};

export default function PropertyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      if (error) {
        console.error("Error loading property:", error);
      } else {
        setProperty(data as Property);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) {
      alert("Error deleting property: " + error.message);
      setDeleting(false);
      return;
    }
    router.push("/my-listings");
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading property...</div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-400 mb-4">Property not found.</p>
        <button
          onClick={() => router.push("/my-listings")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Back to Listings
        </button>
      </div>
    );
  }

  const daysOnMarket = property.days_on_market ?? Math.floor(
    (Date.now() - new Date(property.listing_date || property.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400">
        <span className="hover:text-white cursor-pointer" onClick={() => router.push("/dashboard")}>
          Dashboard
        </span>
        <span className="mx-2">/</span>
        <span className="hover:text-white cursor-pointer" onClick={() => router.push("/my-listings")}>
          My Listings
        </span>
        <span className="mx-2">/</span>
        <span className="text-white">{property.address}</span>
      </div>

      {/* Photo Gallery */}
      <div className="bg-[#1c1c2e] rounded-lg overflow-hidden">
        {property.photos && property.photos.length > 0 ? (
          <div>
            <div className="w-full h-80 bg-[#161620]">
              <img
                src={property.photos[selectedPhoto]}
                alt={property.address}
                className="w-full h-full object-cover"
              />
            </div>
            {property.photos.length > 1 && (
              <div className="flex gap-2 p-3 overflow-x-auto">
                {property.photos.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoto(i)}
                    className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-colors ${
                      i === selectedPhoto ? "border-[#c9a962]" : "border-transparent"
                    }`}
                  >
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-[#161620] text-gray-500">
            <div className="text-center">
              <svg className="mx-auto h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>No photos available</p>
            </div>
          </div>
        )}
      </div>

      {/* Header row */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{property.address}</h1>
          <p className="text-gray-400">
            {property.city}, {property.state} {property.zip}
          </p>
          {property.mls_id && (
            <p className="text-sm text-gray-500 mt-1">MLS# {property.mls_id}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">${property.price.toLocaleString()}</p>
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mt-2 ${
              STATUS_STYLES[property.status] || STATUS_STYLES.draft
            }`}
          >
            {property.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-[#1c1c2e] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Bedrooms</p>
            <p className="text-white text-lg font-semibold">{property.bedrooms}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Bathrooms</p>
            <p className="text-white text-lg font-semibold">{property.bathrooms}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Square Feet</p>
            <p className="text-white text-lg font-semibold">{property.sqft.toLocaleString()}</p>
          </div>
          {property.lot_size && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Lot Size</p>
              <p className="text-white text-lg font-semibold">{property.lot_size.toLocaleString()} sqft</p>
            </div>
          )}
          {property.year_built && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Year Built</p>
              <p className="text-white text-lg font-semibold">{property.year_built}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Property Type</p>
            <p className="text-white text-lg font-semibold">
              {PROPERTY_TYPE_LABELS[property.property_type] || property.property_type}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      {property.description && (
        <div className="bg-[#1c1c2e] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
          <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{property.description}</p>
        </div>
      )}

      {/* Features */}
      {property.features && property.features.length > 0 && (
        <div className="bg-[#1c1c2e] rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Features</h2>
          <div className="flex flex-wrap gap-2">
            {property.features.map((f, i) => (
              <span
                key={i}
                className="bg-[#161620] border border-gray-700 px-3 py-1.5 rounded-full text-sm text-gray-300"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Info */}
      <div className="bg-[#1c1c2e] rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Additional Info</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {property.commission_rate !== null && property.commission_rate !== undefined && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Commission Rate</p>
              <p className="text-white text-lg font-semibold">{property.commission_rate}%</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">Days on Market</p>
            <p className="text-white text-lg font-semibold">{daysOnMarket}</p>
          </div>
          {property.showing_instructions && (
            <div className="col-span-full">
              <p className="text-xs text-gray-500 uppercase tracking-wider">Showing Instructions</p>
              <p className="text-gray-300 mt-1">{property.showing_instructions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/my-listings/${id}/edit`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          Delete
        </button>
        <button
          onClick={() => router.push("/my-listings")}
          className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          Back to Listings
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
          <div className="bg-[#1c1c2e] rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Listing</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete &quot;{property.address}&quot;? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
