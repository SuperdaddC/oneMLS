"use client";

import { useState } from "react";

type SortField = "firstName" | "lastName" | "address" | "city" | "state" | "zip" | "status";
type SortDir = "asc" | "desc";

const clients = [
  { firstName: "Sample", lastName: "Seller", address: "1767 Courtyard Heights", city: "Colorado Springs", state: "Colorado", zip: "80906", status: "ACTIVE" },
  { firstName: "John", lastName: "Sample", address: "123 Main St", city: "Denver", state: "CO", zip: "80202", status: "ACTIVE" },
];

export default function EContractsPage() {
  const [sortField, setSortField] = useState<SortField>("lastName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const sortedClients = [...clients].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const cmp = aVal.localeCompare(bVal);
    return sortDir === "asc" ? cmp : -cmp;
  });

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <th
      className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider cursor-pointer hover:text-white select-none"
      onClick={() => handleSort(field)}
    >
      {label} <span className="text-teal-300/60">&#8597;</span>
    </th>
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
        E-Contracts
      </h1>

      {/* Add New Client Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors">
        <span className="text-xl">+</span> Add New Client
      </button>

      {/* Table */}
      <div className="bg-[#1c1c2e] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0d4f4f] text-left">
                <SortHeader field="firstName" label="First Name" />
                <SortHeader field="lastName" label="Last Name" />
                <SortHeader field="address" label="Address" />
                <SortHeader field="city" label="City" />
                <SortHeader field="state" label="State" />
                <SortHeader field="zip" label="Zip" />
                <SortHeader field="status" label="Status" />
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {sortedClients.map((client, index) => (
                <tr key={index} className="hover:bg-[#1e1e32] transition-colors">
                  <td className="px-4 py-3 text-white text-sm">{client.firstName}</td>
                  <td className="px-4 py-3 text-white text-sm">{client.lastName}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{client.address}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{client.city}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{client.state}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{client.zip}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-400 border border-green-700/50">
                      {client.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                        View
                      </button>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                        Edit
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
