"use client";

import { useState } from "react";

const listings = [
  { value: "1536", label: "1536" },
  { value: "1234-s-monaco", label: "1234 S Monaco Pkwy, Denver, CO 80224" },
  { value: "5678-e-17th", label: "5678 E 17th Ave, Denver, CO 80220" },
  { value: "901-pearl", label: "901 Pearl St, Boulder, CO 80302" },
  { value: "3456-s-broadway", label: "3456 S Broadway, Englewood, CO 80113" },
  { value: "7890-w-colfax", label: "7890 W Colfax Ave, Lakewood, CO 80215" },
];

export default function MarketingMaterialsPage() {
  const [selectedProperty, setSelectedProperty] = useState("");

  return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="bg-[#1c1c2e] rounded-lg p-8 max-w-lg w-full text-center space-y-6">
        <div className="text-5xl">📣</div>
        <h1 className="text-2xl font-bold text-white">Marketing Materials</h1>
        <p className="text-gray-400">
          Create brochures, websites, and social media content for your listings
        </p>

        <div className="text-left space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Select a Property:
          </label>
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="w-full bg-[#161620] border border-gray-700 rounded-lg px-4 py-2.5 text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Choose a listing --</option>
            {listings.map((listing) => (
              <option key={listing.value} value={listing.value}>
                {listing.label}
              </option>
            ))}
          </select>
        </div>

        {!selectedProperty && (
          <p className="text-gray-500 text-sm italic">
            Select a property above to generate marketing materials
          </p>
        )}
      </div>
    </div>
  );
}
