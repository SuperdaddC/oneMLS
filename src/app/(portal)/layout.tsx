"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/my-listings": "My Listings",
  "/showings": "Showings",
  "/messages": "Messages",
  "/cma": "CMA Reports",
  "/e-contracts": "E Contracts",
  "/marketing-materials": "Marketing Materials",
  "/showing-service": "Showing Service",
  "/referrals": "Referrals",
  "/purchase-leads": "Purchase Leads",
  "/library": "Library",
  "/trades": "Trades Directory",
  "/profile": "Profile",
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "Dashboard";

  return (
    <div className="flex h-screen bg-[#0b1120] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 h-full overflow-y-auto">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky header bar */}
        <header className="h-16 flex-shrink-0 sticky top-0 z-30 flex items-center justify-between px-6 bg-[#111827] border-b border-gray-700/50">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">{pageTitle}</span>
            <span className="text-gray-600">/</span>
            <span className="text-white font-medium">{pageTitle}</span>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2C7.23858 2 5 4.23858 5 7V10L3 13H17L15 10V7C15 4.23858 12.7614 2 10 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M8 16C8 17.1046 8.89543 18 10 18C11.1046 18 12 17.1046 12 16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {/* Red badge */}
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings gear */}
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8.325 2.317C8.751 0.561 11.249 0.561 11.675 2.317C11.923 3.348 13.082 3.83 14.005 3.296C15.562 2.381 17.157 3.976 16.242 5.533C15.708 6.456 16.19 7.615 17.221 7.863C18.977 8.289 18.977 10.787 17.221 11.213C16.19 11.461 15.708 12.62 16.242 13.543C17.157 15.1 15.562 16.695 14.005 15.78C13.082 15.246 11.923 15.728 11.675 16.759C11.249 18.515 8.751 18.515 8.325 16.759C8.077 15.728 6.918 15.246 5.995 15.78C4.438 16.695 2.843 15.1 3.758 13.543C4.292 12.62 3.81 11.461 2.779 11.213C1.023 10.787 1.023 8.289 2.779 7.863C3.81 7.615 4.292 6.456 3.758 5.533C2.843 3.976 4.438 2.381 5.995 3.296C6.918 3.83 8.077 3.348 8.325 2.317Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
            </button>

            {/* Theme toggle (red square) */}
            <button className="p-2 rounded-lg hover:bg-gray-700/50 transition-colors">
              <div className="w-5 h-5 rounded bg-red-500" />
            </button>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
