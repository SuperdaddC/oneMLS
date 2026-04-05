"use client";

const properties = [
  { photo: null, address: "1536", city: "N/A", state: "N/A", zip: "N/A" },
  { photo: null, address: "1234 S Monaco Pkwy", city: "Denver", state: "CO", zip: "80224" },
  { photo: null, address: "5678 E 17th Ave", city: "Denver", state: "CO", zip: "80220" },
  { photo: null, address: "901 Pearl St", city: "Boulder", state: "CO", zip: "80302" },
  { photo: null, address: "3456 S Broadway", city: "Englewood", state: "CO", zip: "80113" },
  { photo: null, address: "7890 W Colfax Ave", city: "Lakewood", state: "CO", zip: "80215" },
];

export default function CMAPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
          CMA Reports
        </h1>
        <p className="text-gray-400 mt-2">
          Create and manage Comparative Market Analysis reports for your properties
        </p>
      </div>

      {/* Table */}
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
                <th className="px-4 py-3 text-xs font-semibold text-teal-100 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {properties.map((property, index) => (
                <tr key={index} className="hover:bg-[#1e1e32] transition-colors">
                  <td className="px-4 py-3">
                    <div className="w-16 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                      No Photo
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white text-sm">{property.address}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{property.city}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{property.state}</td>
                  <td className="px-4 py-3 text-gray-300 text-sm">{property.zip}</td>
                  <td className="px-4 py-3">
                    <select className="bg-[#161620] border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-blue-500">
                      <option>Actions</option>
                      <option>Generate CMA</option>
                      <option>View Report</option>
                      <option>Export PDF</option>
                    </select>
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
