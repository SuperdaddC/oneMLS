"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [form, setForm] = useState({
    firstName: "John",
    lastName: "Agent",
    email: "john.agent@homestarproperties.com",
    phone: "(303) 555-0100",
    licenseNumber: "FA.100012345",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      <div className="bg-[#1c1c2e] rounded-lg p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {form.firstName[0]}{form.lastName[0]}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {form.firstName} {form.lastName}
            </h2>
            <p className="text-gray-400 text-sm">Real Estate Agent</p>
          </div>
        </div>

        <hr className="border-gray-700/50" />

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">First Name</label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className="w-full bg-[#161620] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Last Name</label>
            <input
              type="text"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className="w-full bg-[#161620] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="w-full bg-[#161620] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              className="w-full bg-[#161620] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-300">License Number</label>
            <input
              type="text"
              value={form.licenseNumber}
              onChange={(e) => handleChange("licenseNumber", e.target.value)}
              className="w-full bg-[#161620] border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors">
            Save Changes
          </button>
          <button className="bg-[#161620] border border-gray-700 hover:border-gray-600 text-gray-300 px-6 py-2.5 rounded-lg font-semibold transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
