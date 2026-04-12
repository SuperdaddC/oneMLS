"use client";

import { useState } from "react";

interface SchoolRatingsProps {
  city: string;
  state: string;
  zip: string;
}

interface School {
  name: string;
  rating: number;
  distance: string;
  type: "Public" | "Private";
  students: number;
  grades: string;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function generateSchools(
  city: string,
  zip: string,
  category: "Elementary" | "Middle" | "High"
): School[] {
  const base = hashStr(city + zip + category);
  const gradeMap = {
    Elementary: "K-5",
    Middle: "6-8",
    High: "9-12",
  };
  const suffixes = {
    Elementary: ["Elementary Academy", "Elementary School", "Primary School"],
    Middle: ["Middle School", "Junior Academy", "Intermediate School"],
    High: ["High School", "Preparatory Academy", "Secondary School"],
  };
  const prefixes = [
    city,
    `${city} Central`,
    `${city} West`,
    `North ${city}`,
    `${city} Heights`,
  ];

  const count = 2 + (base % 2); // 2 or 3 schools
  const schools: School[] = [];

  for (let i = 0; i < count; i++) {
    const seed = hashStr(`${base}-${i}`);
    const rating = Math.min(10, Math.max(1, 3 + (seed % 8)));
    const distMiles = (0.3 + ((seed * 7) % 22) / 10).toFixed(1);
    const isPrivate = seed % 5 === 0;
    const studentBase =
      category === "Elementary"
        ? 250
        : category === "Middle"
          ? 400
          : 800;
    const students = studentBase + ((seed * 3) % 500);

    schools.push({
      name: `${prefixes[i % prefixes.length]} ${suffixes[category][i % suffixes[category].length]}`,
      rating,
      distance: `${distMiles} mi`,
      type: isPrivate ? "Private" : "Public",
      students,
      grades: gradeMap[category],
    });
  }

  return schools;
}

function ratingColor(rating: number) {
  if (rating >= 8) return "#22c55e";
  if (rating >= 6) return "#eab308";
  if (rating >= 4) return "#f97316";
  return "#ef4444";
}

const tabs = ["Elementary", "Middle", "High"] as const;

export default function SchoolRatings({ city, state, zip }: SchoolRatingsProps) {
  const [active, setActive] = useState<(typeof tabs)[number]>("Elementary");
  const schools = generateSchools(city, zip, active);

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
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
          </svg>
          Nearby Schools
        </span>
      </h2>
      <p className="mb-4 text-xs text-[#94a3b8]">
        {city}, {state} {zip}
      </p>

      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-lg bg-[#0a0a0f] p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active === tab
                ? "bg-[#1c1c2e] text-[#c9a962]"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* School cards */}
      <div className="space-y-3">
        {schools.map((school, i) => (
          <div
            key={i}
            className="rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white truncate">
                  {school.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94a3b8]">
                  <span>{school.type}</span>
                  <span>{school.grades}</span>
                  <span>{school.students.toLocaleString()} students</span>
                  <span>{school.distance}</span>
                </div>
              </div>
              {/* Rating badge */}
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ backgroundColor: ratingColor(school.rating) }}
                >
                  {school.rating}
                </div>
                <span className="text-[10px] text-[#94a3b8]">/10</span>
              </div>
            </div>
            {/* Rating bar */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#2a2a3a]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${school.rating * 10}%`,
                  backgroundColor: ratingColor(school.rating),
                  transition: "width 0.5s ease-out",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] text-[#94a3b8]/60">
        School data is estimated. Connect GreatSchools API for verified ratings.
      </p>
    </div>
  );
}
