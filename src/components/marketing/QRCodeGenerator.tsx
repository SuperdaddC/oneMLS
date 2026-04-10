"use client";

import { useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import type { Property } from "@/lib/types";

interface Props {
  property: Property;
}

type QRSize = 128 | 256 | 512;
type ColorPreset = "classic" | "branded" | "inverted";

const sizeOptions: { value: QRSize; label: string }[] = [
  { value: 128, label: "Small" },
  { value: 256, label: "Medium" },
  { value: 512, label: "Large" },
];

const colorPresets: {
  key: ColorPreset;
  label: string;
  fg: string;
  bg: string;
}[] = [
  { key: "classic", label: "Classic", fg: "#000000", bg: "#ffffff" },
  { key: "branded", label: "Branded", fg: "#c9a962", bg: "#0f172a" },
  { key: "inverted", label: "Inverted", fg: "#ffffff", bg: "#161620" },
];

export default function QRCodeGenerator({ property }: Props) {
  const [size, setSize] = useState<QRSize>(256);
  const [colorPreset, setColorPreset] = useState<ColorPreset>("classic");
  const [copied, setCopied] = useState(false);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const publicUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/property/${property.id}`
      : `https://onemls.pro/property/${property.id}`;

  const colors = colorPresets.find((c) => c.key === colorPreset)!;

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = useCallback(() => {
    const svgEl = svgContainerRef.current?.querySelector("svg");
    if (!svgEl) return;

    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `qr-${property.address.replace(/\s+/g, "-")}.png`;
      link.href = pngUrl;
      link.click();
    };
    img.src = url;
  }, [size, colors.bg, property.address]);

  return (
    <div className="flex gap-6 flex-col lg:flex-row">
      {/* Controls */}
      <div className="bg-[#1c1c2e] rounded-lg p-5 space-y-5 lg:w-72 shrink-0 border border-[#2a2a3a]">
        {/* Size selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Size
          </label>
          <div className="flex gap-2">
            {sizeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSize(opt.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  size === opt.value
                    ? "bg-[#c9a962] text-black"
                    : "bg-[#161620] text-[#94a3b8] border border-[#2a2a3a] hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="text-xs text-[#94a3b8] mt-1">{size}x{size}px</div>
        </div>

        {/* Color presets */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Color
          </label>
          <div className="flex gap-2">
            {colorPresets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => setColorPreset(preset.key)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  colorPreset === preset.key
                    ? "border-[#c9a962] bg-[#c9a962]/10 text-white"
                    : "border-[#2a2a3a] bg-[#161620] text-[#94a3b8] hover:text-white"
                }`}
              >
                <div className="flex justify-center mb-1">
                  <div
                    className="w-5 h-5 rounded-sm border border-[#2a2a3a]"
                    style={{
                      background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`,
                    }}
                  />
                </div>
                <div className="text-xs">{preset.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="w-full bg-[#c9a962] hover:bg-[#b8983f] text-black font-semibold py-2.5 rounded-lg transition-colors"
        >
          Download QR Code
        </button>
      </div>

      {/* Preview */}
      <div className="flex-1 bg-[#1c1c2e] rounded-lg border border-[#2a2a3a] p-5 space-y-5">
        {/* QR code */}
        <div className="flex justify-center">
          <div
            ref={svgContainerRef}
            className="rounded-lg p-4"
            style={{ backgroundColor: colors.bg }}
          >
            <QRCodeSVG
              value={publicUrl}
              size={Math.min(size, 300)}
              fgColor={colors.fg}
              bgColor={colors.bg}
              level="M"
            />
          </div>
        </div>

        {/* URL + copy */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 bg-[#161620] border border-[#2a2a3a] rounded-lg px-4 py-2.5 text-sm text-[#94a3b8] font-mono break-all">
            {publicUrl}
          </div>
          <button
            onClick={handleCopyUrl}
            className="bg-[#161620] hover:bg-[#2a2a3a] text-[#94a3b8] hover:text-white border border-[#2a2a3a] font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap text-sm"
          >
            {copied ? "Copied!" : "Copy URL"}
          </button>
        </div>

        {/* Tip */}
        <div className="bg-[#161620] rounded-lg px-4 py-3 border border-[#2a2a3a]">
          <p className="text-sm text-[#94a3b8]">
            <span className="font-medium text-gray-300">Tip:</span> Use this QR
            code on yard signs, flyers, and print materials to direct buyers to
            your property listing.
          </p>
        </div>
      </div>
    </div>
  );
}
