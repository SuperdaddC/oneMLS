"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(!!data.user);
    });
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0f172a]/95 backdrop-blur-md shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-[#c9a962]">OneMLS</span>
          </Link>

          {/* Center links - desktop */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/search"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Search
            </Link>
            <Link
              href="/register"
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              For Agents
            </Link>
          </div>

          {/* Right buttons - desktop */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn btn-accent btn-sm"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn btn-outline btn-sm"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-accent btn-sm"
                >
                  Join Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-slate-300 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {menuOpen ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0f172a]/95 backdrop-blur-md border-t border-[#2a2a3a]">
          <div className="px-4 py-4 flex flex-col gap-3">
            <Link
              href="/search"
              className="text-sm text-slate-300 hover:text-white py-2"
              onClick={() => setMenuOpen(false)}
            >
              Search
            </Link>
            <Link
              href="/register"
              className="text-sm text-slate-300 hover:text-white py-2"
              onClick={() => setMenuOpen(false)}
            >
              For Agents
            </Link>
            <hr className="border-[#2a2a3a]" />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="btn btn-accent btn-sm w-full"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="btn btn-outline btn-sm w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="btn btn-accent btn-sm w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Join Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
