"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { PropertyType, PropertyStatus } from "@/lib/types";

const supabase = createClient();

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
  open_house_enabled: boolean;
  open_house_date: string;
  open_house_start_time: string;
  open_house_end_time: string;
  open_house_notes: string;
}

const initialForm: FormData = {
  address: "",
  city: "",
  state: "",
  zip: "",
  county: "",
  property_type: "single_family",
  bedrooms: 0,
  bathrooms: 0,
  sqft: 0,
  lot_size: "",
  year_built: "",
  description: "",
  features: "",
  photos: [],
  price: "",
  commission_rate: "",
  open_house_enabled: false,
  open_house_date: "",
  open_house_start_time: "",
  open_house_end_time: "",
  open_house_notes: "",
};

export default function CreateListingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragOver, setDragOver] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const totalSteps = 5;

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const update = (field: keyof FormData, value: string | number | string[] | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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

  const buildPayload = (userId: string, status: PropertyStatus) => {
    const featuresArray = form.features
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    // Build open house JSON to store in description metadata
    const openHouseData = form.open_house_enabled
      ? {
          enabled: true,
          date: form.open_house_date,
          start_time: form.open_house_start_time,
          end_time: form.open_house_end_time,
          notes: form.open_house_notes,
        }
      : null;

    // Append open house info to description if enabled
    let description = form.description || null;
    if (openHouseData && openHouseData.date) {
      const ohInfo = `\n\n[OPEN_HOUSE:${JSON.stringify(openHouseData)}]`;
      description = (description || "") + ohInfo;
    }

    return {
      owner_id: userId,
      status,
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
      description,
      features: featuresArray,
      photos: form.photos,
      price: form.price ? parseFloat(form.price) : 0,
      commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
    };
  };

  const saveDraft = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const payload = buildPayload(userData.user.id, "draft");

      if (draftId) {
        // Update existing draft
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", draftId);
        if (error) {
          console.error("Draft update error:", error);
          return;
        }
      } else {
        // Insert new draft
        const { data, error } = await supabase
          .from("properties")
          .insert(payload)
          .select("id")
          .single();
        if (error) {
          console.error("Draft insert error:", error);
          return;
        }
        if (data) {
          setDraftId(data.id);
        }
      }
      setToast("Draft saved");
    } catch (err) {
      console.error("Draft save error:", err);
    }
  };

  const nextStep = async () => {
    if (validateStep(step)) {
      await saveDraft();
      setStep((s) => Math.min(s + 1, totalSteps));
    }
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      if (fileArray.length === 0) return;

      setUploading(true);
      setUploadProgress(`Uploading 1 of ${fileArray.length}...`);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;
        const userId = userData.user.id;

        const newUrls: string[] = [];
        for (let i = 0; i < fileArray.length; i++) {
          setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}...`);
          const file = fileArray[i];
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
        setForm((prev) => ({ ...prev, photos: [...prev.photos, ...newUrls] }));
        setUploadProgress(`${newUrls.length} photo${newUrls.length !== 1 ? "s" : ""} uploaded`);
        setTimeout(() => setUploadProgress(""), 3000);
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const removePhoto = (index: number) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const setPrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setForm((prev) => {
      const newPhotos = [...prev.photos];
      const [photo] = newPhotos.splice(index, 1);
      newPhotos.unshift(photo);
      return { ...prev, photos: newPhotos };
    });
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const submit = async (status: PropertyStatus) => {
    setSubmitting(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        alert("You must be logged in to create a listing.");
        return;
      }

      const payload = buildPayload(userData.user.id, status);

      if (draftId) {
        // Update the existing draft with final status
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", draftId);
        if (error) {
          alert("Error updating listing: " + error.message);
          return;
        }
      } else {
        const { error } = await supabase.from("properties").insert(payload);
        if (error) {
          alert("Error creating listing: " + error.message);
          return;
        }
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

  const stepLabels = ["Address & Type", "Details", "Photos", "Pricing & Commission", "Review & Submit"];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#1c1c2e] border border-[#c9a962] text-[#c9a962] px-4 py-2 rounded-lg shadow-lg text-sm font-medium animate-fade-in">
          {toast}
        </div>
      )}

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
        <span className="text-white">Create New Listing</span>
      </div>

      <h1 className="text-2xl font-bold text-white">Create New Listing</h1>

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
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                  // Reset so same file can be re-selected
                  e.target.value = "";
                }}
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
                {uploading ? uploadProgress : "Drag & drop photos here or click to browse"}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 10MB each</p>
            </div>

            {/* Upload progress / count */}
            {!uploading && uploadProgress && (
              <p className="text-sm text-[#c9a962]">{uploadProgress}</p>
            )}

            {/* Photo thumbnails */}
            {form.photos.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {form.photos.map((url, i) => (
                  <div key={url} className="relative group bg-[#161620] rounded-lg overflow-hidden border border-gray-700">
                    <img
                      src={url}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-28 object-cover"
                    />
                    {/* Position number */}
                    <span className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      #{i + 1}
                    </span>
                    {/* Primary star (gold) */}
                    {i === 0 && (
                      <span className="absolute top-1 left-8 text-[#c9a962] text-lg" title="Primary photo">
                        &#9733;
                      </span>
                    )}
                    {/* Set as primary button for non-primary */}
                    {i !== 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimaryPhoto(i);
                        }}
                        title="Set as primary"
                        className="absolute top-1 left-8 text-gray-500 hover:text-[#c9a962] text-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &#9734;
                      </button>
                    )}
                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(i);
                      }}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      X
                    </button>
                    {/* Primary label */}
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#c9a962]/90 text-black text-xs text-center py-0.5 font-medium">
                        PRIMARY
                      </div>
                    )}
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

            {/* Open House Section */}
            <div className="border-t border-gray-700 pt-4 mt-4">
              <h3 className="text-md font-semibold text-white mb-3">Open House</h3>
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => update("open_house_enabled", !form.open_house_enabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    form.open_house_enabled ? "bg-[#c9a962]" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      form.open_house_enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <span className="text-sm text-gray-300">Schedule Open House</span>
              </div>

              {form.open_house_enabled && (
                <div className="space-y-4 pl-2">
                  <div>
                    <label className={labelClass}>Open House Date</label>
                    <input
                      type="date"
                      value={form.open_house_date}
                      onChange={(e) => update("open_house_date", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Start Time</label>
                      <input
                        type="time"
                        value={form.open_house_start_time}
                        onChange={(e) => update("open_house_start_time", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>End Time</label>
                      <input
                        type="time"
                        value={form.open_house_end_time}
                        onChange={(e) => update("open_house_end_time", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Notes (optional)</label>
                    <input
                      type="text"
                      value={form.open_house_notes}
                      onChange={(e) => update("open_house_notes", e.target.value)}
                      placeholder="e.g., Ring doorbell on arrival"
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review & Submit */}
        {step === 5 && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white mb-4">Review & Submit</h2>

            <div className="grid grid-cols-2 gap-6">
              {/* Address */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Address</h3>
                <p className="text-white">{form.address}</p>
                <p className="text-gray-400">
                  {form.city}, {form.state} {form.zip}
                </p>
                {form.county && <p className="text-gray-400">County: {form.county}</p>}
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Property Type</h3>
                <p className="text-white">
                  {PROPERTY_TYPES.find((pt) => pt.value === form.property_type)?.label}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Details</h3>
                <p className="text-gray-300">
                  {form.bedrooms} bed / {form.bathrooms} bath / {form.sqft.toLocaleString()} sqft
                </p>
                {form.lot_size && <p className="text-gray-400">Lot: {parseFloat(form.lot_size).toLocaleString()} sqft</p>}
                {form.year_built && <p className="text-gray-400">Built: {form.year_built}</p>}
              </div>

              {/* Pricing */}
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

            {/* Open House */}
            {form.open_house_enabled && form.open_house_date && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Open House</h3>
                <p className="text-gray-300">
                  {form.open_house_date}
                  {form.open_house_start_time && ` from ${form.open_house_start_time}`}
                  {form.open_house_end_time && ` to ${form.open_house_end_time}`}
                </p>
                {form.open_house_notes && (
                  <p className="text-gray-400">Notes: {form.open_house_notes}</p>
                )}
              </div>
            )}

            {/* Description */}
            {form.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">Description</h3>
                <p className="text-gray-300 whitespace-pre-wrap">{form.description}</p>
              </div>
            )}

            {/* Features */}
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

            {/* Photos */}
            {form.photos.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">
                  Photos ({form.photos.length})
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {form.photos.map((url, i) => (
                    <div key={url} className="relative">
                      <img
                        src={url}
                        alt={`Photo ${i + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      {i === 0 && (
                        <span className="absolute top-1 left-1 text-[#c9a962] text-sm" title="Primary">
                          &#9733; Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4 border-t border-gray-700">
              <button
                onClick={() => submit("active")}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {submitting ? "Publishing..." : "Publish Listing"}
              </button>
              <button
                onClick={() => submit("draft")}
                disabled={submitting}
                className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                {submitting ? "Saving..." : "Save as Draft"}
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
