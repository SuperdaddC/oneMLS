"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { PropertyType, PropertyStatus } from "@/lib/types";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "single_family", label: "Single Family" },
  { value: "condo", label: "Condo" },
  { value: "townhouse", label: "Townhouse" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "land", label: "Land" },
  { value: "commercial", label: "Commercial" },
];

interface FormData {
  address: string;
  city: string;
  state: string;
  zip: string;
  county: string;
  property_type: PropertyType;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  lot_size: string;
  year_built: string;
  description: string;
  features: string;
  photos: string[];
  price: string;
  commission_rate: string;
  status: PropertyStatus;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);

  const totalSteps = 5;

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        console.error("Error loading property:", error);
        setLoading(false);
        return;
      }
      setForm({
        address: data.address || "",
        city: data.city || "",
        state: data.state || "",
        zip: data.zip || "",
        county: data.county || "",
        property_type: data.property_type || "single_family",
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        sqft: data.sqft || 0,
        lot_size: data.lot_size ? String(data.lot_size) : "",
        year_built: data.year_built ? String(data.year_built) : "",
        description: data.description || "",
        features: (data.features || []).join(", "),
        photos: data.photos || [],
        price: data.price ? String(data.price) : "",
        commission_rate: data.commission_rate ? String(data.commission_rate) : "",
        status: data.status || "draft",
      });
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-gray-400">Loading property...</div>
      </div>
    );
  }

  if (!form) {
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

  const update = (field: keyof FormData, value: string | number | string[]) => {
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};
    if (s === 1) {
      if (!form.address.trim()) errs.address = "Address is required";
      if (!form.city.trim()) errs.city = "City is required";
      if (!form.state) errs.state = "State is required";
      if (!form.zip.trim()) errs.zip = "ZIP is required";
    } else if (s === 2) {
      if (form.bedrooms < 0) errs.bedrooms = "Invalid bedrooms";
      if (form.bathrooms < 0) errs.bathrooms = "Invalid bathrooms";
      if (form.sqft <= 0) errs.sqft = "Square feet is required";
    } else if (s === 4) {
      if (!form.price || parseFloat(form.price) <= 0) errs.price = "Price is required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFiles = async (files: FileList | File[]) => {
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const userId = userData.user.id;

      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage
          .from("property-photos")
          .upload(fileName, file);
        if (error) {
          console.error("Upload error:", error);
          continue;
        }
        const { data: urlData } = supabase.storage
          .from("property-photos")
          .getPublicUrl(fileName);
        newUrls.push(urlData.publicUrl);
      }
      setForm((prev) => prev ? { ...prev, photos: [...prev.photos, ...newUrls] } : prev);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setForm((prev) =>
      prev ? { ...prev, photos: prev.photos.filter((_, i) => i !== index) } : prev
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const featuresArray = form.features
        .split(",")
        .map((f) => f.trim())
        .filter(Boolean);

      const payload = {
        address: form.address,
        city: form.city,
        state: form.state,
        zip: form.zip,
        county: form.county || null,
        property_type: form.property_type,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        sqft: form.sqft,
        lot_size: form.lot_size ? parseFloat(form.lot_size) : null,
        year_built: form.year_built ? parseInt(form.year_built) : null,
        description: form.description || null,
        features: featuresArray,
        photos: form.photos,
        price: parseFloat(form.price),
        commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
        status: form.status,
      };

      const { error } = await supabase.from("properties").update(payload).eq("id", id);
      if (error) {
        alert("Error updating listing: " + error.message);
        return;
      }
      router.push("/my-listings");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full bg-[#161620] border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";
  const errorClass = "text-red-400 text-xs mt-1";

  const stepLabels = ["Address & Type", "Details", "Photos", "Pricing & Commission", "Review & Save"];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
        <span className="text-white">Edit Listing</span>
      </div>

      <h1 className="text-2xl font-bold text-white">Edit Listing</h1>

      {/* Step Indicator */}
      <div className="bg-[#1c1c2e] rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-[#c9a962] font-medium">{stepLabels[step - 1]}</span>
        </div>
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i < step ? "bg-[#c9a962]" : "bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Form Steps */}
      <div className="bg-[#1c1c2e] rounded-lg p-6">
        {/* Step 1: Address & Type */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Address & Property Type</h2>
            <div>
              <label className={labelClass}>Address *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="123 Main St"
                className={inputClass}
              />
              {errors.address && <p className={errorClass}>{errors.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City *</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Denver"
                  className={inputClass}
                />
                {errors.city && <p className={errorClass}>{errors.city}</p>}
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <select
                  value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select State</option>
                  {US_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                {errors.state && <p className={errorClass}>{errors.state}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>ZIP Code *</label>
                <input
                  type="text"
                  value={form.zip}
                  onChange={(e) => update("zip", e.target.value)}
                  placeholder="80202"
                  className={inputClass}
                />
                {errors.zip && <p className={errorClass}>{errors.zip}</p>}
              </div>
              <div>
                <label className={labelClass}>County</label>
                <input
                  type="text"
                  value={form.county}
                  onChange={(e) => update("county", e.target.value)}
                  placeholder="Denver County"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Property Type *</label>
              <select
                value={form.property_type}
                onChange={(e) => update("property_type", e.target.value)}
                className={inputClass}
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Property Details</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Bedrooms *</label>
                <input
                  type="number"
                  min="0"
                  value={form.bedrooms}
                  onChange={(e) => update("bedrooms", parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
                {errors.bedrooms && <p className={errorClass}>{errors.bedrooms}</p>}
              </div>
              <div>
                <label className={labelClass}>Bathrooms *</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.bathrooms}
                  onChange={(e) => update("bathrooms", parseFloat(e.target.value) || 0)}
                  className={inputClass}
                />
                {errors.bathrooms && <p className={errorClass}>{errors.bathrooms}</p>}
              </div>
              <div>
                <label className={labelClass}>Square Feet *</label>
                <input
                  type="number"
                  min="0"
                  value={form.sqft}
                  onChange={(e) => update("sqft", parseInt(e.target.value) || 0)}
                  className={inputClass}
                />
                {errors.sqft && <p className={errorClass}>{errors.sqft}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Lot Size (sq ft)</label>
                <input
                  type="number"
                  min="0"
                  value={form.lot_size}
                  onChange={(e) => update("lot_size", e.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Year Built</label>
                <input
                  type="number"
                  min="1800"
                  max="2030"
                  value={form.year_built}
                  onChange={(e) => update("year_built", e.target.value)}
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Describe the property..."
                rows={4}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Features (comma-separated)</label>
              <input
                type="text"
                value={form.features}
                onChange={(e) => update("features", e.target.value)}
                placeholder="Granite counters, Hardwood floors, Pool"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Photos</h2>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
                dragOver
                  ? "border-[#c9a962] bg-[#c9a962]/10"
                  : "border-gray-600 hover:border-gray-500"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 16v-8m0 0l-3 3m3-3l3 3M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1"
                />
              </svg>
              <p className="text-gray-400">
                {uploading ? "Uploading..." : "Drag & drop photos here or click to browse"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB each</p>
            </div>

            {form.photos.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {form.photos.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Pricing & Commission */}
        {step === 4 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white mb-4">Pricing & Commission</h2>
            <div>
              <label className={labelClass}>Price *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                <input
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="0"
                  className={`${inputClass} pl-7`}
                />
              </div>
              {errors.price && <p className={errorClass}>{errors.price}</p>}
            </div>
            <div>
              <label className={labelClass}>Commission Rate</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.commission_rate}
                  onChange={(e) => update("commission_rate", e.target.value)}
                  placeholder="2.5"
                  className={`${inputClass} pr-8`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">%</span>
              </div>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        )}

        {/* Step 5: Review & Save */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">Review & Save</h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Address</h3>
                <p className="text-white">{form.address}</p>
                <p className="text-gray-400">
                  {form.city}, {form.state} {form.zip}
                </p>
                {form.county && <p className="text-gray-400">County: {form.county}</p>}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Property Type</h3>
                <p className="text-white">
                  {PROPERTY_TYPES.find((pt) => pt.value === form.property_type)?.label}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Details</h3>
                <p className="text-gray-300">
                  {form.bedrooms} bed / {form.bathrooms} bath / {form.sqft.toLocaleString()} sqft
                </p>
                {form.lot_size && <p className="text-gray-400">Lot: {parseFloat(form.lot_size).toLocaleString()} sqft</p>}
                {form.year_built && <p className="text-gray-400">Built: {form.year_built}</p>}
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Pricing</h3>
                <p className="text-white text-xl font-bold">
                  ${form.price ? parseFloat(form.price).toLocaleString() : "0"}
                </p>
                {form.commission_rate && (
                  <p className="text-gray-400">Commission: {form.commission_rate}%</p>
                )}
              </div>
            </div>

            {form.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{form.description}</p>
              </div>
            )}

            {form.features && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {form.features
                    .split(",")
                    .map((f) => f.trim())
                    .filter(Boolean)
                    .map((f, i) => (
                      <span
                        key={i}
                        className="bg-[#161620] border border-gray-700 px-3 py-1 rounded-full text-sm text-gray-300"
                      >
                        {f}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {form.photos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">
                  Photos ({form.photos.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {form.photos.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t border-gray-700">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => router.push("/my-listings")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-700">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className="bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={nextStep}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Next
            </button>
          </div>
        )}
        {step === 5 && (
          <div className="mt-4">
            <button
              onClick={prevStep}
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
