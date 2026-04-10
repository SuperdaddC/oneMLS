"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex items-center bg-[#161620] border border-[#2a2a3a] rounded-xl overflow-hidden focus-within:border-[#c9a962] focus-within:shadow-[0_0_0_3px_rgba(201,169,98,0.15)] transition-all">
        <svg
          className="ml-4 shrink-0 text-[#94a3b8]"
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, state, or MLS ID..."
          className="flex-1 bg-transparent px-4 py-4 text-white text-base placeholder:text-[#94a3b8] outline-none"
        />
        <button
          type="submit"
          className="shrink-0 bg-[#c9a962] hover:bg-[#d4b872] text-[#0f172a] font-semibold px-6 py-4 transition-colors cursor-pointer"
        >
          Search
        </button>
      </div>
    </form>
  );
}
