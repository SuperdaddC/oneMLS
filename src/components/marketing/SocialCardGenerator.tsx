"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import type { Property } from "@/lib/types";
import LuxuryCard from "./templates/LuxuryCard";
import ModernCard from "./templates/ModernCard";
import MinimalCard from "./templates/MinimalCard";
import BoldCard from "./templates/BoldCard";

type Template = "luxury" | "modern" | "minimal" | "bold";
type Variant = "just_listed" | "open_house" | "price_reduced" | "just_sold";
type SizeKey = "instagram" | "facebook" | "twitter";

const templates: { key: Template; label: string; desc: string }[] = [
  { key: "luxury", label: "Luxury", desc: "Dark & elegant" },
  { key: "modern", label: "Modern", desc: "Clean & bold" },
  { key: "minimal", label: "Minimal", desc: "Simple & refined" },
  { key: "bold", label: "Bold", desc: "Vibrant & energetic" },
];

const variants: { key: Variant; label: string }[] = [
  { key: "just_listed", label: "Just Listed" },
  { key: "open_house", label: "Open House" },
  { key: "price_reduced", label: "Price Reduced" },
  { key: "just_sold", label: "Just Sold" },
];

const sizes: { key: SizeKey; label: string; w: number; h: number }[] = [
  { key: "instagram", label: "Instagram (1080x1080)", w: 1080, h: 1080 },
  { key: "facebook", label: "Facebook (1200x630)", w: 1200, h: 630 },
  { key: "twitter", label: "Twitter (1200x675)", w: 1200, h: 675 },
];

interface Props {
  property: Property;
  agentName: string;
  agentPhone: string;
  brokerageName: string;
}

export default function SocialCardGenerator({
  property,
  agentName,
  agentPhone,
  brokerageName,
}: Props) {
  const [template, setTemplate] = useState<Template>("luxury");
  const [variant, setVariant] = useState<Variant>("just_listed");
  const [sizeKey, setSizeKey] = useState<SizeKey>("instagram");
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const size = sizes.find((s) => s.key === sizeKey)!;

  const maxPreviewWidth = 560;
  const maxPreviewHeight = 500;
  const scale = Math.min(
    maxPreviewWidth / size.w,
    maxPreviewHeight / size.h,
    1
  );

  const cardProps = {
    property,
    agentName,
    agentPhone,
    brokerageName,
    variant,
    width: size.w,
    height: size.h,
  };

  const CardComponent = {
    luxury: LuxuryCard,
    modern: ModernCard,
    minimal: MinimalCard,
    bold: BoldCard,
  }[template];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        width: size.w,
        height: size.h,
        pixelRatio: 1,
      });
      const link = document.createElement("a");
      link.download = `${property.address.replace(/\s+/g, "-")}-${template}-${variant}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    }
    setDownloading(false);
  };

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Controls */}
      <div className="bg-[#1c1c2e] rounded-lg p-5 space-y-5 lg:w-80 shrink-0 border border-[#2a2a3a]">
        {/* Template selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Template
          </label>
          <div className="grid grid-cols-2 gap-2">
            {templates.map((t) => (
              <button
                key={t.key}
                onClick={() => setTemplate(t.key)}
                className={`rounded-lg p-3 text-left border transition-colors ${
                  template === t.key
                    ? "border-[#c9a962] bg-[#c9a962]/10"
                    : "border-[#2a2a3a] bg-[#161620] hover:border-[#94a3b8]/30"
                }`}
              >
                <span className="block text-sm font-medium text-white">
                  {t.label}
                </span>
                <span className="block text-xs text-[#94a3b8]">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Variant selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Variant
          </label>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.key}
                onClick={() => setVariant(v.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  variant === v.key
                    ? "bg-[#c9a962] text-black"
                    : "bg-[#161620] text-[#94a3b8] border border-[#2a2a3a] hover:text-white"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Size
          </label>
          <select
            value={sizeKey}
            onChange={(e) => setSizeKey(e.target.value as SizeKey)}
            className="w-full bg-[#161620] border border-[#2a2a3a] rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-[#c9a962]"
          >
            {sizes.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Download button */}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-[#c9a962] hover:bg-[#b8983f] text-black font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {downloading ? "Generating..." : "Download PNG"}
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 bg-[#1c1c2e] rounded-lg border border-[#2a2a3a] p-5 flex items-center justify-center min-h-[400px]">
        <div
          style={{
            width: size.w * scale,
            height: size.h * scale,
            overflow: "hidden",
          }}
        >
          <div
            ref={cardRef}
            id="social-card-preview"
            style={{
              width: size.w,
              height: size.h,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <CardComponent {...cardProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
