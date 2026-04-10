"use client";

import { useState, useRef, useEffect } from "react";

interface ShareButtonProps {
  url?: string;
  title?: string;
  compact?: boolean;
}

export default function ShareButton({ url, title, compact = false }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "Check out this property on OneMLS";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleShare() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch {
        // User cancelled or not supported, fall through to dropdown
      }
    }
    setOpen(!open);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setOpen(false);
  }

  function shareOnFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
    setOpen(false);
  }

  function shareOnTwitter() {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
      "_blank",
      "width=600,height=400"
    );
    setOpen(false);
  }

  function shareOnLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleShare}
        className={`inline-flex items-center gap-2 rounded-lg border border-[#2a2a3a] bg-[#161620] px-4 py-2.5 text-sm font-medium text-[#94a3b8] transition-colors hover:border-[#94a3b8] hover:text-white ${compact ? "px-3 py-2" : ""}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {!compact && "Share"}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-[#2a2a3a] bg-[#1c1c2e] shadow-2xl">
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#f8fafc] transition-colors hover:bg-[#2a2a3a]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <button
            onClick={shareOnFacebook}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#f8fafc] transition-colors hover:bg-[#2a2a3a]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </button>
          <button
            onClick={shareOnTwitter}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#f8fafc] transition-colors hover:bg-[#2a2a3a]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X / Twitter
          </button>
          <button
            onClick={shareOnLinkedIn}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-[#f8fafc] transition-colors hover:bg-[#2a2a3a]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </button>
        </div>
      )}

      {/* Toast notification */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-[#c9a962] px-5 py-2.5 text-sm font-medium text-[#0a0a0f] shadow-lg">
          Link copied!
        </div>
      )}
    </div>
  );
}
