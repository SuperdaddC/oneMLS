"use client";

import { useState } from "react";

const listings = [
  { photo: null, address: "1536", city: "N/A", state: "N/A", zip: "N/A", status: "ACTIVE" },
  { photo: null, address: "1234 S Monaco Pkwy", city: "Denver", state: "CO", zip: "80224", status: "ACTIVE" },
  { photo: null, address: "5678 E 17th Ave", city: "Denver", state: "CO", zip: "80220", status: "ACTIVE" },
  { photo: null, address: "901 Pearl St", city: "Boulder", state: "CO", zip: "80302", status: "ACTIVE" },
  { photo: null, address: "3456 S Broadway", city: "Englewood", state: "CO", zip: "80113", status: "ACTIVE" },
  { photo: null, address: "7890 W Colfax Ave", city: "Lakewood", state: "CO", zip: "80215", status: "ACTIVE" },
];

export default function MyListingsPage() {
  const [claimSearch, setClaimSearch] = useState("");

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-400">
        <span className="hover:text-white cursor-pointer">Dashboard</span>
        <span className="mx-2">/</span>
        <span className="text-white">My Listings</span>
      </div>

      <h1 className="text-2xl font-bold text-white">My Listings</h1>

      {/* Top Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left - Create New */}
        <div className="bg-[#1c1c2e] rounded-lg p-6 flex items-center">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors">
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

      {/* Listings Table */}
      <div className="bg-[#1c1c2e] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0d4f4f] text-left">
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Photo</th>
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Address</th>
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">City</th>
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">State</th>
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Zip</th>
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {listings.map((listing, index) => (
                <tr key={index} className="hover:bg-[#1e1e32] transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                      No Photo
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">{listing.address}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{listing.city}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{listing.state}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{listing.zip}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700/50">
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                        Edit
                      </button>
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                        View
                      </button>
                      <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
