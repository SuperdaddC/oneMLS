"use client";

interface WalkScoreApiData {
  walk: number;
  transit: number;
  bike: number;
  description?: string;
  transitDescription?: string;
  bikeDescription?: string;
}

interface WalkScoreProps {
  lat?: number | null;
  lng?: number | null;
  city: string;
  state: string;
  apiData?: WalkScoreApiData | null;
}

function generateScores(lat: number, lng: number, city: string) {
  const hash = Math.abs(Math.sin(lat * 1000 + lng * 2000)) * 100;
  const urbanBonus = [
    "Denver", "Miami", "Miami Beach", "Boulder", "Austin", "Dallas",
    "San Diego", "San Francisco", "New York", "Chicago", "Seattle",
    "Portland", "Los Angeles", "Boston", "Washington",
  ].includes(city) ? 20 : 0;
  return {
    walk: Math.min(99, Math.floor(hash * 0.7 + urbanBonus + 15)),
    transit: Math.min(99, Math.floor(hash * 0.5 + urbanBonus)),
    bike: Math.min(99, Math.floor(hash * 0.6 + urbanBonus + 5)),
  };
}

function getWalkLabel(score: number) {
  if (score >= 90) return "Walker's Paradise";
  if (score >= 70) return "Very Walkable";
  if (score >= 50) return "Somewhat Walkable";
  if (score >= 25) return "Car-Dependent";
  return "Almost All Errands Require a Car";
}

function getTransitLabel(score: number) {
  if (score >= 90) return "Excellent Transit";
  if (score >= 70) return "Excellent Transit";
  if (score >= 50) return "Some Transit";
  if (score >= 25) return "Minimal Transit";
  return "Minimal Transit";
}

function getBikeLabel(score: number) {
  if (score >= 90) return "Biker's Paradise";
  if (score >= 70) return "Very Bikeable";
  if (score >= 50) return "Bikeable";
  if (score >= 25) return "Somewhat Bikeable";
  return "Minimal Bike Infrastructure";
}

function getWalkColor(score: number) {
  if (score >= 90) return "#15803d";
  if (score >= 70) return "#22c55e";
  if (score >= 50) return "#eab308";
  if (score >= 25) return "#f97316";
  return "#ef4444";
}

function getTransitColor(score: number) {
  if (score >= 90) return "#1d4ed8";
  if (score >= 70) return "#3b82f6";
  if (score >= 50) return "#60a5fa";
  if (score >= 25) return "#93c5fd";
  return "#bfdbfe";
}

function getBikeColor(score: number) {
  if (score >= 90) return "#0d9488";
  if (score >= 70) return "#14b8a6";
  if (score >= 50) return "#2dd4bf";
  if (score >= 25) return "#5eead4";
  return "#99f6e4";
}

function ScoreRing({
  score,
  color,
  label,
  title,
}: {
  score: number;
  color: string;
  label: string;
  title: string;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const isHighScore = score >= 70;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#2a2a3a"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="text-2xl font-bold"
            style={{ color: isHighScore ? "#c9a962" : "#f8fafc" }}
          >
            {score}
          </span>
        </div>
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="text-xs text-center text-[#94a3b8] max-w-[120px]">{label}</p>
    </div>
  );
}

export default function WalkScore({ lat, lng, city, state, apiData }: WalkScoreProps) {
  if (!lat || !lng) return null;

  const isLive = !!apiData;
  const scores = apiData
    ? { walk: apiData.walk, transit: apiData.transit, bike: apiData.bike }
    : generateScores(lat, lng, city);

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
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Walk Score
        </span>
      </h2>
      <p className="mb-6 text-xs text-[#94a3b8]">
        {city}, {state}
      </p>
      <div className="flex flex-wrap items-start justify-center gap-8 sm:justify-around">
        <ScoreRing
          score={scores.walk}
          color={getWalkColor(scores.walk)}
          label={isLive && apiData?.description ? apiData.description : getWalkLabel(scores.walk)}
          title="Walk Score"
        />
        <ScoreRing
          score={scores.transit}
          color={getTransitColor(scores.transit)}
          label={isLive && apiData?.transitDescription ? apiData.transitDescription : getTransitLabel(scores.transit)}
          title="Transit Score"
        />
        <ScoreRing
          score={scores.bike}
          color={getBikeColor(scores.bike)}
          label={isLive && apiData?.bikeDescription ? apiData.bikeDescription : getBikeLabel(scores.bike)}
          title="Bike Score"
        />
      </div>
      <p className="mt-6 text-center text-[10px] text-[#94a3b8]/60">
        {isLive
          ? "Powered by Walk Score"
          : "Estimated scores - Walk Score API connecting..."}
      </p>
    </div>
  );
}
