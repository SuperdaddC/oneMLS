"use client";

import { useState } from "react";
import type { Property } from "@/lib/types";

interface FlyerGeneratorProps {
  property: Property;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  brokerageName: string;
}

type TemplateName = "LuxuryFlyer" | "ModernFlyer" | "ClassicFlyer";

const templates: {
  id: TemplateName;
  label: string;
  description: string;
  colors: { bg: string; accent: string; text: string };
}[] = [
  {
    id: "LuxuryFlyer",
    label: "Luxury",
    description: "Navy & gold premium design",
    colors: { bg: "#0f172a", accent: "#c9a962", text: "#ffffff" },
  },
  {
    id: "ModernFlyer",
    label: "Modern",
    description: "Clean blue & white layout",
    colors: { bg: "#ffffff", accent: "#3b82f6", text: "#1e293b" },
  },
  {
    id: "ClassicFlyer",
    label: "Classic",
    description: "Traditional red & white style",
    colors: { bg: "#ffffff", accent: "#dc2626", text: "#111827" },
  },
];

export default function FlyerGenerator({
  property,
  agentName,
  agentPhone,
  agentEmail,
  brokerageName,
}: FlyerGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateName>("LuxuryFlyer");
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");

      let SelectedTemplate: React.ComponentType<{
        property: Property;
        agentName: string;
        agentPhone: string;
        agentEmail: string;
        brokerageName: string;
      }>;

      switch (selectedTemplate) {
        case "LuxuryFlyer": {
          const mod = await import("./pdf-templates/LuxuryFlyer");
          SelectedTemplate = mod.default;
          break;
        }
        case "ModernFlyer": {
          const mod = await import("./pdf-templates/ModernFlyer");
          SelectedTemplate = mod.default;
          break;
        }
        case "ClassicFlyer": {
          const mod = await import("./pdf-templates/ClassicFlyer");
          SelectedTemplate = mod.default;
          break;
        }
      }

      const blob = await pdf(
        <SelectedTemplate
          property={property}
          agentName={agentName}
          agentPhone={agentPhone}
          agentEmail={agentEmail}
          brokerageName={brokerageName}
        />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${property.address.replace(/\s+/g, "-")}-flyer.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Choose a Template
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.id;
            return (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`relative rounded-lg p-4 text-left transition-all ${
                  isSelected
                    ? "ring-2 ring-[#c9a962] bg-white/10"
                    : "ring-1 ring-white/20 bg-white/5 hover:bg-white/10"
                }`}
              >
                {/* Template preview thumbnail */}
                <div
                  className="w-full aspect-[8.5/11] rounded mb-3 flex flex-col overflow-hidden"
                  style={{ backgroundColor: template.colors.bg }}
                >
                  <div
                    className="h-[12%] w-full flex items-center justify-center"
                    style={{ backgroundColor: template.colors.accent }}
                  >
                    <span
                      className="text-[8px] font-bold tracking-wider"
                      style={{
                        color:
                          template.id === "LuxuryFlyer" ? "#0f172a" : "#fff",
                      }}
                    >
                      JUST LISTED
                    </span>
                  </div>
                  <div className="h-[35%] w-full bg-gray-400/30" />
                  <div className="flex-1 p-2 space-y-1">
                    <div
                      className="h-2 w-3/4 rounded-sm"
                      style={{ backgroundColor: template.colors.accent }}
                    />
                    <div
                      className="h-1.5 w-1/2 rounded-sm opacity-60"
                      style={{ backgroundColor: template.colors.text }}
                    />
                    <div className="flex gap-1 mt-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 w-6 rounded-sm opacity-40"
                          style={{ backgroundColor: template.colors.text }}
                        />
                      ))}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-1 w-full rounded-sm opacity-20"
                          style={{ backgroundColor: template.colors.text }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white">
                  {template.label}
                </p>
                <p className="text-xs text-gray-400">{template.description}</p>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#c9a962] flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-black"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={generatePDF}
        disabled={generating}
        className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold text-black bg-[#c9a962] hover:bg-[#b8963e] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {generating ? (
          <>
            <svg
              className="animate-spin h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Generating PDF...
          </>
        ) : (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Generate &amp; Download PDF
          </>
        )}
      </button>
    </div>
  );
}
