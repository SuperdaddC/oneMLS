"use client";

import { useState } from "react";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  params?: { name: string; type: string; description: string }[];
  example: string;
  exampleResponse: string;
}

const endpoints: Endpoint[] = [
  {
    method: "GET",
    path: "/api/reso/properties",
    description: "List all active properties in RESO Data Dictionary format.",
    params: [
      { name: "$top", type: "integer", description: "Number of results to return (max 200, default 20)" },
      { name: "$skip", type: "integer", description: "Number of results to skip for pagination (default 0)" },
      { name: "$filter", type: "string", description: "OData filter expression (see filter examples below)" },
      { name: "$orderby", type: "string", description: "Sort field and direction, e.g. 'ListPrice desc'" },
    ],
    example: `curl "https://onemls.pro/api/reso/properties?\\$top=10&\\$filter=StateOrProvince eq 'CA'"`,
    exampleResponse: `{
  "@odata.context": "https://onemls.pro/api/reso/properties",
  "@odata.count": 142,
  "value": [
    {
      "ListingId": "MLS-20260412-001",
      "ListingKey": "uuid-here",
      "PropertyType": "single_family",
      "StandardStatus": "active",
      "ListPrice": 750000,
      "StreetAddress": "123 Main St",
      "City": "Los Angeles",
      "StateOrProvince": "CA",
      "PostalCode": "90001",
      "BedroomsTotal": 3,
      "BathroomsTotalDecimal": 2,
      "LivingArea": 1850,
      "YearBuilt": 1995,
      "ModificationTimestamp": "2026-04-10T14:30:00Z"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/reso/properties/[id]",
    description: "Get a single active property by its UUID in RESO format.",
    example: `curl "https://onemls.pro/api/reso/properties/550e8400-e29b-41d4-a716-446655440000"`,
    exampleResponse: `{
  "@odata.context": "https://onemls.pro/api/reso/properties('550e8400...')",
  "ListingId": "MLS-20260412-001",
  "ListingKey": "550e8400-e29b-41d4-a716-446655440000",
  "PropertyType": "single_family",
  "ListPrice": 750000,
  "StreetAddress": "123 Main St",
  "City": "Los Angeles",
  "StateOrProvince": "CA",
  "BedroomsTotal": 3,
  "BathroomsTotalDecimal": 2,
  "LivingArea": 1850
}`,
  },
];

const filterExamples = [
  { filter: "City eq 'Denver'", description: "Properties in Denver" },
  { filter: "StateOrProvince eq 'CA'", description: "Properties in California" },
  { filter: "ListPrice ge 500000", description: "Properties $500k and above" },
  { filter: "ListPrice le 1000000", description: "Properties $1M and below" },
  { filter: "ListPrice ge 500000 and ListPrice le 1000000", description: "Properties between $500k-$1M" },
];

const fieldMappings = [
  { reso: "ListingId", db: "mls_id", type: "string" },
  { reso: "ListingKey", db: "id", type: "uuid" },
  { reso: "PropertyType", db: "property_type", type: "string" },
  { reso: "StandardStatus", db: "status", type: "string" },
  { reso: "ListPrice", db: "price", type: "number" },
  { reso: "StreetAddress", db: "address", type: "string" },
  { reso: "City", db: "city", type: "string" },
  { reso: "StateOrProvince", db: "state", type: "string" },
  { reso: "PostalCode", db: "zip", type: "string" },
  { reso: "BedroomsTotal", db: "bedrooms", type: "integer" },
  { reso: "BathroomsTotalDecimal", db: "bathrooms", type: "decimal" },
  { reso: "LivingArea", db: "sqft", type: "integer" },
  { reso: "LotSizeSquareFeet", db: "lot_size", type: "integer" },
  { reso: "YearBuilt", db: "year_built", type: "integer" },
  { reso: "PublicRemarks", db: "description", type: "string" },
  { reso: "DaysOnMarket", db: "days_on_market", type: "integer" },
  { reso: "BuyerAgentCommission", db: "commission_rate", type: "decimal" },
  { reso: "Photos", db: "photos", type: "array" },
  { reso: "VirtualTourURLUnbranded", db: "virtual_tour_url", type: "string" },
  { reso: "ModificationTimestamp", db: "updated_at", type: "timestamp" },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-[#0a0a0f] border border-[#2a2a3a] rounded-lg p-4 overflow-x-auto text-sm text-gray-300 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 px-2 py-1 bg-[#2a2a3a] hover:bg-[#3a3a4a] text-xs text-[#94a3b8] rounded opacity-0 group-hover:opacity-100 transition-opacity"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}

export default function ApiDocsPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 3L4 8L8 13" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 3L20 8L16 13" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 3L10 13" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <div>
          <h1 className="text-2xl font-bold text-white">API Documentation</h1>
          <p className="text-sm text-[#94a3b8]">RESO Web API for property data syndication</p>
        </div>
      </div>

      {/* Base URL */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">Base URL</h2>
        <code className="text-white bg-[#0a0a0f] px-3 py-1.5 rounded text-sm font-mono">
          https://onemls.pro/api/reso
        </code>
      </div>

      {/* Authentication */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">Authentication</h2>
        <p className="text-sm text-gray-300">
          Public read access for active listings. No authentication required for GET requests.
        </p>
      </div>

      {/* Rate Limits */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">Rate Limits</h2>
        <p className="text-sm text-gray-300">
          1,000 requests per hour per IP address. Exceeding the limit returns a 429 status code.
        </p>
      </div>

      {/* Endpoints */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-white">Endpoints</h2>
        {endpoints.map((ep, i) => (
          <div key={i} className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 bg-green-900/40 text-green-400 text-xs font-bold rounded border border-green-700/40">
                {ep.method}
              </span>
              <code className="text-white font-mono text-sm">{ep.path}</code>
            </div>
            <p className="text-sm text-gray-300">{ep.description}</p>

            {/* Parameters */}
            {ep.params && (
              <div>
                <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                  Query Parameters
                </h4>
                <div className="space-y-2">
                  {ep.params.map((p) => (
                    <div key={p.name} className="flex items-start gap-3 text-sm">
                      <code className="text-[#c9a962] font-mono bg-[#0a0a0f] px-1.5 py-0.5 rounded text-xs shrink-0">
                        {p.name}
                      </code>
                      <span className="text-gray-500 text-xs shrink-0">({p.type})</span>
                      <span className="text-gray-300">{p.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Example Request */}
            <div>
              <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                Example Request
              </h4>
              <CodeBlock code={ep.example} />
            </div>

            {/* Example Response */}
            <div>
              <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">
                Example Response
              </h4>
              <CodeBlock code={ep.exampleResponse} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Examples */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider mb-2">
          $filter Examples
        </h2>
        <div className="space-y-2">
          {filterExamples.map((f, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <code className="text-white font-mono bg-[#0a0a0f] px-2 py-1 rounded text-xs shrink-0">
                {f.filter}
              </code>
              <span className="text-gray-300 text-sm">{f.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Field Mapping Table */}
      <div className="bg-[#1c1c2e] border border-[#2a2a3a] rounded-xl overflow-hidden">
        <div className="p-5 pb-3">
          <h2 className="text-sm font-semibold text-[#c9a962] uppercase tracking-wider">
            RESO Data Dictionary Field Mapping
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-[#2a2a3a]">
                <th className="px-5 py-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  RESO Field
                </th>
                <th className="px-5 py-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  Database Field
                </th>
                <th className="px-5 py-2.5 text-xs font-semibold text-[#94a3b8] uppercase tracking-wider text-left">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a3a]/50">
              {fieldMappings.map((f) => (
                <tr key={f.reso} className="hover:bg-[#161620] transition-colors">
                  <td className="px-5 py-2 text-sm font-mono text-white">{f.reso}</td>
                  <td className="px-5 py-2 text-sm font-mono text-gray-400">{f.db}</td>
                  <td className="px-5 py-2 text-sm text-gray-400">{f.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
