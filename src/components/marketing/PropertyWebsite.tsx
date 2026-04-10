"use client";

import { useState } from "react";
import type { Property } from "@/lib/types";

interface Props {
  property: Property;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function PropertyWebsite({ property }: Props) {
  const [copied, setCopied] = useState(false);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/property/${property.id}`
      : `https://onemls.pro/property/${property.id}`;

  const ogTitle = `${formatPrice(property.price)} - ${property.address}`;
  const ogDescription = `${property.bedrooms} bed, ${property.bathrooms} bath, ${property.sqft?.toLocaleString()} sqft in ${property.city}, ${property.state}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(publicUrl);
  const shareText = encodeURIComponent(ogTitle);

  return (
    <div className="space-y-6">
      {/* URL display */}
      <div className="bg-[#1c1c2e] rounded-lg p-5 border border-[#2a2a3a]">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Public Property URL
        </label>
        <div className="flex gap-3 items-center">
          <div className="flex-1 bg-[#161620] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-[#c9a962] font-mono text-sm break-all">
            {publicUrl}
          </div>
          <button
            onClick={handleCopy}
            className="bg-[#c9a962] hover:bg-[#b8983f] text-black font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            {copied ? "Copied!" : "Copy URL"}
          </button>
        </div>
      </div>

      {/* Browser preview mockup */}
      <div className="bg-[#1c1c2e] rounded-lg border border-[#2a2a3a] overflow-hidden">
        <div className="text-sm font-medium text-gray-300 px-5 pt-4 pb-2">
          Page Preview
        </div>
        {/* Browser chrome */}
        <div className="mx-5 mb-5 rounded-lg overflow-hidden border border-[#2a2a3a]">
          <div className="bg-[#161620] px-4 py-2 flex items-center gap-2 border-b border-[#2a2a3a]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
            </div>
            <div className="flex-1 bg-[#0a0a0f] rounded px-3 py-1 text-xs text-[#94a3b8] font-mono truncate ml-2">
              {publicUrl}
            </div>
          </div>
          {/* Mini page representation */}
          <div className="bg-[#0a0a0f] p-6">
            <div className="max-w-md mx-auto space-y-3">
              {property.photos?.[0] && (
                <div
                  className="w-full h-32 rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${property.photos[0]})` }}
                />
              )}
              {!property.photos?.[0] && (
                <div className="w-full h-32 rounded bg-[#1c1c2e] flex items-center justify-center text-[#94a3b8] text-sm">
                  Property Photo
                </div>
              )}
              <div className="text-xl font-bold text-white">
                {formatPrice(property.price)}
              </div>
              <div className="text-sm text-[#94a3b8]">
                {property.address}, {property.city}, {property.state}{" "}
                {property.zip}
              </div>
              <div className="flex gap-4 text-xs text-[#94a3b8]">
                <span>{property.bedrooms} Beds</span>
                <span>{property.bathrooms} Baths</span>
                <span>{property.sqft?.toLocaleString()} Sqft</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OG preview cards */}
      <div className="bg-[#1c1c2e] rounded-lg p-5 border border-[#2a2a3a] space-y-4">
        <div className="text-sm font-medium text-gray-300">
          Social Media Link Previews
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Facebook card */}
          <div>
            <div className="text-xs text-[#94a3b8] mb-1.5">Facebook</div>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                {property.photos?.[0] ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${property.photos[0]})`,
                    }}
                  />
                ) : (
                  "OG Image"
                )}
              </div>
              <div className="p-2.5">
                <div className="text-[10px] text-gray-400 uppercase">
                  onemls.pro
                </div>
                <div className="text-xs font-semibold text-gray-900 leading-tight truncate">
                  {ogTitle}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {ogDescription}
                </div>
              </div>
            </div>
          </div>

          {/* Twitter card */}
          <div>
            <div className="text-xs text-[#94a3b8] mb-1.5">Twitter / X</div>
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              <div className="h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                {property.photos?.[0] ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${property.photos[0]})`,
                    }}
                  />
                ) : (
                  "OG Image"
                )}
              </div>
              <div className="p-2.5">
                <div className="text-xs font-semibold text-gray-900 leading-tight truncate">
                  {ogTitle}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {ogDescription}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  onemls.pro
                </div>
              </div>
            </div>
          </div>

          {/* LinkedIn card */}
          <div>
            <div className="text-xs text-[#94a3b8] mb-1.5">LinkedIn</div>
            <div className="bg-white rounded-lg overflow-hidden border border-gray-300">
              <div className="h-24 bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                {property.photos?.[0] ? (
                  <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${property.photos[0]})`,
                    }}
                  />
                ) : (
                  "OG Image"
                )}
              </div>
              <div className="p-2.5 bg-gray-50">
                <div className="text-xs font-semibold text-gray-900 leading-tight truncate">
                  {ogTitle}
                </div>
                <div className="text-[10px] text-gray-500">onemls.pro</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share buttons */}
      <div className="bg-[#1c1c2e] rounded-lg p-5 border border-[#2a2a3a]">
        <div className="text-sm font-medium text-gray-300 mb-3">Share Now</div>
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1877f2] hover:bg-[#166fe5] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#1da1f2] hover:bg-[#1a94da] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Twitter / X
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0a66c2] hover:bg-[#095cb3] text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </div>
  );
}
