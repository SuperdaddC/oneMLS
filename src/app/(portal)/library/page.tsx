"use client";

import { useState } from "react";

const tabs = [
  { id: "manual", label: "Real Estate Manual" },
  { id: "industry", label: "Industry News" },
  { id: "mba", label: "MBA News" },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("manual");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Library</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1c1c2e] rounded-lg p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-[#161620]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-[#1c1c2e] rounded-lg p-8">
        {activeTab === "manual" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Real Estate Manual</h2>
            <p className="text-gray-400">
              Access the complete real estate manual, including guidelines, procedures, and best practices for agents.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {["Getting Started", "Listing Procedures", "Buyer Representation", "Closing Process"].map((item) => (
                <div
                  key={item}
                  className="bg-[#161620] rounded-lg p-4 border border-gray-700/50 hover:border-blue-500/50 cursor-pointer transition-colors"
                >
                  <h3 className="text-white font-medium">{item}</h3>
                  <p className="text-gray-500 text-sm mt-1">Click to view section</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "industry" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Industry News</h2>
            <p className="text-gray-400">
              Stay up to date with the latest real estate industry news and market trends.
            </p>
            <div className="text-gray-500 text-sm italic mt-4">
              No news articles available at this time. Check back soon for updates.
            </div>
          </div>
        )}

        {activeTab === "mba" && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">MBA News</h2>
            <p className="text-gray-400">
              Latest news and updates from the Mortgage Bankers Association.
            </p>
            <div className="text-gray-500 text-sm italic mt-4">
              No MBA news available at this time. Check back soon for updates.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
