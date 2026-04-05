"use client";

const categories = [
  { name: "Appraisers", icon: "📊", description: "Licensed property appraisers", available: true },
  { name: "Home Inspectors", icon: "🔍", description: "Certified home inspection services", available: true },
  { name: "Insurance Agents", icon: "🛡️", description: "Property and liability insurance", available: true },
  { name: "Lenders", icon: "🏦", description: "Mortgage lenders and brokers", available: true },
  { name: "Photographers", icon: "📷", description: "Real estate photography and videography", available: true },
  { name: "Title Companies", icon: "📜", description: "Title search and insurance services", available: true },
  { name: "Contractors", icon: "🔨", description: "General contractors and specialists", available: false },
];

export default function TradesPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Trades Directory</h1>
      <p className="text-gray-400">Find trusted professionals for your real estate transactions</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((category) => (
          <div
            key={category.name}
            className={`bg-[#1c1c2e] rounded-lg p-6 border transition-all ${
              category.available
                ? "border-gray-700/50 hover:border-blue-500/50 cursor-pointer hover:shadow-lg hover:shadow-blue-500/5"
                : "border-gray-800/50 opacity-60"
            }`}
          >
            <div className="text-3xl mb-3">{category.icon}</div>
            <h3 className="text-white font-semibold mb-1">{category.name}</h3>
            <p className="text-gray-400 text-sm">{category.description}</p>
            {!category.available && (
              <span className="inline-block mt-3 text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">
                Coming Soon
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
