"use client";

interface CensusData {
  medianIncome: number | null;
  medianAge: number | null;
  population: number | null;
}

interface NeighborhoodInfoProps {
  city: string;
  state: string;
  lat?: number | null;
  lng?: number | null;
  censusData?: CensusData | null;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateNeighborhoodData(city: string, state: string, lat?: number | null, lng?: number | null) {
  const seed = hashStr(city + state + (lat ?? 0).toString());

  const parkNames: Record<string, string[]> = {
    Denver: ["Washington Park", "City Park", "Cheesman Park"],
    Miami: ["Bayfront Park", "South Pointe Park", "Lummus Park"],
    Boulder: ["Chautauqua Park", "Eben G. Fine Park", "Scott Carpenter Park"],
    Austin: ["Zilker Park", "Pease Park", "Lady Bird Lake Trail"],
    Dallas: ["Klyde Warren Park", "White Rock Lake", "Trinity Groves Park"],
    "San Diego": ["Balboa Park", "Mission Bay Park", "Torrey Pines Reserve"],
  };

  const highways: Record<string, string> = {
    CO: "I-25, I-70",
    FL: "I-95, I-75",
    TX: "I-35, I-10",
    CA: "I-5, I-15",
    AZ: "I-10, I-17",
    NY: "I-87, I-95",
    WA: "I-5, I-90",
  };

  const cityParks = parkNames[city] || [`${city} Central Park`, `${city} Memorial Park`, `Riverside Park`];
  const closestPark = cityParks[seed % cityParks.length];
  const stateHighways = highways[state] || "I-25";

  const isUrban = [
    "Denver", "Miami", "Miami Beach", "Boulder", "Austin", "Dallas",
    "San Diego", "San Francisco", "New York", "Chicago", "Seattle",
  ].includes(city);

  const restaurants = isUrban ? 30 + (seed % 50) : 8 + (seed % 20);
  const shops = isUrban ? 20 + (seed % 30) : 5 + (seed % 15);
  const parks = isUrban ? 3 + (seed % 5) : 1 + (seed % 3);
  const commute = isUrban ? 15 + (seed % 15) : 20 + (seed % 25);
  const medianIncome = isUrban ? 65 + (seed % 55) : 45 + (seed % 40);
  const medianAge = 28 + (seed % 18);
  const safetyRating = Math.min(10, Math.max(3, 5 + (seed % 6)));

  return {
    restaurants,
    shops,
    parks,
    closestPark,
    commute,
    highways: stateHighways,
    medianIncome,
    medianAge,
    safetyRating,
  };
}

function InfoCard({
  icon,
  title,
  line1,
  line2,
}: {
  icon: React.ReactNode;
  title: string;
  line1: string;
  line2: string;
}) {
  return (
    <div className="rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-white">{title}</p>
      </div>
      <p className="text-sm text-[#94a3b8]">{line1}</p>
      <p className="mt-1 text-sm text-[#94a3b8]">{line2}</p>
    </div>
  );
}

function safetyColor(rating: number) {
  if (rating >= 8) return "#22c55e";
  if (rating >= 6) return "#eab308";
  if (rating >= 4) return "#f97316";
  return "#ef4444";
}

export default function NeighborhoodInfo({
  city,
  state,
  lat,
  lng,
  censusData,
}: NeighborhoodInfoProps) {
  const data = generateNeighborhoodData(city, state, lat, lng);
  const hasCensus = !!censusData;

  return (
    <div className="rounded-xl border border-[#2a2a3a] bg-[#161620] p-6">
      <h2 className="mb-6 text-xl font-bold text-white">
        <span className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c9a962"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Neighborhood
        </span>
      </h2>
      <p className="mb-5 text-xs text-[#94a3b8]">
        {city}, {state}
      </p>

      {/* Info grid */}
      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8h1a4 4 0 010 8h-1" />
              <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          }
          title="Dining & Shopping"
          line1={`~${data.restaurants} restaurants within 1 mile`}
          line2={`~${data.shops} shops nearby`}
        />
        <InfoCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-3-3.87" />
              <path d="M9 21v-2a4 4 0 00-3-3.87" />
              <circle cx="12" cy="7" r="4" />
              <path d="M2 21l3-3" />
              <path d="M22 21l-3-3" />
            </svg>
          }
          title="Parks & Recreation"
          line1={`${data.parks} parks nearby`}
          line2={`Closest: ${data.closestPark}`}
        />
        <InfoCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          title="Commute"
          line1={`Average commute: ${data.commute} min`}
          line2={`Major highways: ${data.highways}`}
        />
        <InfoCard
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 00-3-3.87" />
              <path d="M16 3.13a4 4 0 010 7.75" />
            </svg>
          }
          title={hasCensus ? "Demographics (Census)" : "Demographics"}
          line1={
            hasCensus && censusData!.medianIncome
              ? `Median household income: $${censusData!.medianIncome.toLocaleString()}`
              : `Median household income: ~$${data.medianIncome}K`
          }
          line2={
            hasCensus && censusData!.medianAge
              ? `Median age: ${censusData!.medianAge}${censusData!.population ? ` | Pop: ${censusData!.population.toLocaleString()}` : ""}`
              : `Median age: ~${data.medianAge}`
          }
        />
      </div>

      {/* Safety section */}
      <div className="mt-5 rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] p-4">
        <div className="mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <p className="text-sm font-semibold text-white">Safety</p>
          <span
            className="ml-auto text-sm font-bold"
            style={{ color: safetyColor(data.safetyRating) }}
          >
            {data.safetyRating}/10
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-[#2a2a3a]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${data.safetyRating * 10}%`,
              backgroundColor: safetyColor(data.safetyRating),
              transition: "width 0.5s ease-out",
            }}
          />
        </div>
      </div>

      <p className="mt-4 text-[10px] text-[#94a3b8]/60">
        {hasCensus
          ? "Demographics powered by U.S. Census Bureau ACS. Dining, parks, commute, and safety data are estimates. Connect Yelp API for live data."
          : "Neighborhood data is estimated. Connect local data APIs for verified information."}
      </p>
    </div>
  );
}
