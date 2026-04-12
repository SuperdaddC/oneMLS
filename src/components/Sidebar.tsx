"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeType?: "count" | "soon" | "status";
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10" y="1" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="1" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="10" y="10" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 9L9 2L16 9V16H11V12H7V16H2V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 7H16" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CalendarClockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 7H16" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M9 11V12L10 12.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2H15C15.5523 2 16 2.44772 16 3V12C16 12.5523 15.5523 13 15 13H6L2 16V3C2 2.44772 2.44772 2 3 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 16V6L6 10L10 4L14 8L16 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 16H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 2H11L14 5V16H4V2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M11 2V5H14" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 9H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 12H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const MegaphoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 3L6 6H3C2.44772 6 2 6.44772 2 7V10C2 10.5523 2.44772 11 3 11H4L5 16H7L6 11L14 14V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 6.5C16.8 7.3 16.8 9.7 16 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const KeyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="9" r="4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M10 9H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 9V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3 16C3 13 5.5 11 9 11C12.5 11 15 13 15 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const HelpIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
    <path d="M7 7C7 5.89543 7.89543 5 9 5C10.1046 5 11 5.89543 11 7C11 8 9 8.5 9 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="13" r="0.5" fill="currentColor" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 2H3C2.44772 2 2 2.44772 2 3V15C2 15.5523 2.44772 16 3 16H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M12 12L16 9L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 9H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const BookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 3H7C8.10457 3 9 3.89543 9 5V15C9 14.4477 8.55228 14 8 14H2V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M16 3H11C9.89543 3 9 3.89543 9 5V15C9 14.4477 9.44772 14 10 14H16V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const TrendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14L7 9L10 12L16 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 5H16V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="7.5" y="6" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="2" width="3" height="14" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const BuildingIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="14" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6 6H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 6H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 10H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 10H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 16V13H11V16" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M8 1V3M8 13V15M1 8H3M13 8H15M2.93 2.93L4.34 4.34M11.66 11.66L13.07 13.07M13.07 2.93L11.66 4.34M4.34 11.66L2.93 13.07" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ReferralIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="13" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1 16C1 13 3.5 11 7 11C8 11 8.8 11.2 9.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M11 14C11 12.5 11.8 11.2 13 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 1H3L5 12H14L16 4H4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="6" cy="15" r="1" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="13" cy="15" r="1" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const SavedSearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M13 13L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 6l1 2 2.5.3-1.8 1.7.4 2.5L8 11.2 5.9 12.5l.4-2.5L4.5 8.3 7 8z" fill="currentColor" />
  </svg>
);

const FolderIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 4C2 3.44772 2.44772 3 3 3H7L9 5H15C15.5523 5 16 5.44772 16 6V14C16 14.5523 15.5523 15 15 15H3C2.44772 15 2 14.5523 2 14V4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const PaletteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2C5.13 2 2 5.13 2 9C2 12.87 5.13 16 9 16C9.55 16 10 15.55 10 15C10 14.76 9.89 14.55 9.73 14.39C9.57 14.23 9.46 14.01 9.46 13.76C9.46 13.21 9.91 12.76 10.46 12.76H11.76C14.1 12.76 16 10.86 16 8.52C16 4.92 12.87 2 9 2Z" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="5.5" cy="8.5" r="1" fill="currentColor" />
    <circle cx="7.5" cy="5.5" r="1" fill="currentColor" />
    <circle cx="10.5" cy="5.5" r="1" fill="currentColor" />
    <circle cx="13" cy="8.5" r="1" fill="currentColor" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 6L9 10L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MarketUpdateIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="10" width="3" height="6" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="7.5" y="6" width="3" height="10" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="2" width="3" height="14" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2 3L7 5L13 2L16 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const sections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
      { label: "My Listings", href: "/my-listings", icon: <HomeIcon />, badge: "STATUS_COUNTS", badgeType: "status" as const },
      { label: "Saved", href: "/saved", icon: <HeartIcon />, badge: "SAVED_COUNT", badgeType: "count" as const },
      { label: "Saved Searches", href: "/saved-searches", icon: <SavedSearchIcon /> },
      { label: "Collections", href: "/collections", icon: <FolderIcon /> },
      { label: "Open Houses", href: "/open-houses", icon: <CalendarClockIcon />, badge: "OPEN_HOUSE_COUNT", badgeType: "count" as const },
      { label: "Showings", href: "/showings", icon: <CalendarIcon />, badge: "3", badgeType: "count" },
      { label: "Messages", href: "/messages", icon: <ChatIcon />, badge: "2", badgeType: "count" },
    ],
  },
  {
    title: "RESOURCES",
    items: [
      { label: "Analytics", href: "/analytics", icon: <BarChartIcon /> },
      { label: "Market Insights", href: "/market-insights", icon: <TrendIcon /> },
      { label: "CMA", href: "/cma", icon: <ChartIcon /> },
      { label: "E Contracts", href: "/e-contracts", icon: <DocumentIcon /> },
      { label: "Marketing Materials", href: "/marketing-materials", icon: <MegaphoneIcon /> },
      { label: "Email Campaigns", href: "/email-campaigns", icon: <EmailIcon /> },
      { label: "Market Updates", href: "/market-updates", icon: <MarketUpdateIcon /> },
      { label: "Showing Service", href: "/showing-service", icon: <KeyIcon /> },
      { label: "Referrals", href: "/referrals", icon: <ReferralIcon />, badge: "SOON", badgeType: "soon" },
      { label: "Purchase Leads", href: "/purchase-leads", icon: <CartIcon />, badge: "SOON", badgeType: "soon" },
    ],
  },
  {
    title: "LIBRARY",
    items: [
      { label: "Real Estate Manual", href: "/library", icon: <BookIcon /> },
      { label: "Industry News", href: "/library", icon: <BookIcon /> },
      { label: "MBA News", href: "/library", icon: <BookIcon /> },
    ],
  },
  {
    title: "TRADES",
    items: [
      { label: "Trades Directory", href: "/trades", icon: <BuildingIcon /> },
      { label: "Appraisers", href: "/trades", icon: <BuildingIcon /> },
      { label: "Home Inspectors", href: "/trades", icon: <BuildingIcon /> },
      { label: "Insurance Agents", href: "/trades", icon: <BuildingIcon /> },
      { label: "Lenders", href: "/trades", icon: <BuildingIcon /> },
      { label: "Photographers", href: "/trades", icon: <BuildingIcon /> },
      { label: "Title Companies", href: "/trades", icon: <BuildingIcon /> },
      { label: "Contractors", href: "/trades", icon: <BuildingIcon />, badge: "SOON", badgeType: "soon" },
    ],
  },
];

const accountItems: NavItem[] = [
  { label: "Brand Kit", href: "/brand-kit", icon: <PaletteIcon /> },
  { label: "Profile", href: "/profile", icon: <UserIcon /> },
  { label: "Help Center", href: "#", icon: <HelpIcon /> },
  { label: "Logout", href: "/login", icon: <LogoutIcon /> },
];

function StatusBadges({ counts, onClickStatus }: { counts: StatusCounts; onClickStatus: (status: string) => void }) {
  const badges = [
    { key: "draft", color: "#c9a962", label: "Drafts" },
    { key: "active", color: "#3b82f6", label: "Active" },
    { key: "pending", color: "#22c55e", label: "Pending" },
    { key: "withdrawn", color: "#ef4444", label: "Withdrawn" },
  ] as const;

  const hasAny = badges.some(b => counts[b.key] > 0);
  if (!hasAny) return null;

  return (
    <span style={{ display: "flex", gap: "3px", alignItems: "center" }}>
      {badges.map(b => {
        const count = counts[b.key];
        if (count === 0) return null;
        return (
          <span
            key={b.key}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClickStatus(b.key); }}
            title={`${count} ${b.label}`}
            style={{
              backgroundColor: b.color,
              color: b.key === "draft" ? "#000" : "#fff",
              fontSize: "10px",
              fontWeight: 700,
              borderRadius: "9999px",
              minWidth: "18px",
              height: "18px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 5px",
              lineHeight: 1,
              cursor: "pointer",
            }}
          >
            {count}
          </span>
        );
      })}
    </span>
  );
}

function Badge({ text, type }: { text: string; type: "count" | "soon" | "draft" | "status" }) {
  if (type === "count") {
    return (
      <span
        style={{
          backgroundColor: "#ef4444",
          color: "#fff",
          fontSize: "11px",
          fontWeight: 600,
          borderRadius: "9999px",
          minWidth: "20px",
          height: "20px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 6px",
          lineHeight: 1,
        }}
      >
        {text}
      </span>
    );
  }

  return (
    <span
      style={{
        backgroundColor: "#22c55e",
        color: "#fff",
        fontSize: "9px",
        fontWeight: 700,
        borderRadius: "9999px",
        padding: "2px 8px",
        lineHeight: 1,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}
    >
      {text}
    </span>
  );
}

interface StatusCounts {
  draft: number;
  active: number;
  pending: number;
  withdrawn: number;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({ draft: 0, active: 0, pending: 0, withdrawn: 0 });
  const [savedCount, setSavedCount] = useState(0);
  const [openHouseCount, setOpenHouseCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase
          .from("properties")
          .select("status")
          .eq("owner_id", data.user.id)
          .then(({ data: props }) => {
            if (props) {
              const counts = { draft: 0, active: 0, pending: 0, withdrawn: 0 };
              props.forEach((p: { status: string }) => {
                if (p.status in counts) counts[p.status as keyof StatusCounts]++;
              });
              setStatusCounts(counts);
            }
          });
        supabase
          .from("saved_listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", data.user.id)
          .then(({ count }) => {
            setSavedCount(count ?? 0);
          });
        supabase
          .from("open_houses")
          .select("id", { count: "exact", head: true })
          .eq("agent_id", data.user.id)
          .eq("status", "scheduled")
          .gte("event_date", new Date().toISOString().split("T")[0])
          .then(({ count }) => {
            setOpenHouseCount(count ?? 0);
          });
      }
    });
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const userName = user?.user_metadata?.first_name || user?.email?.split("@")[0] || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const userPlan = user?.user_metadata?.role === "fsbo" ? "FSBO Seller" : "Free Account";

  const isActive = (href: string) => {
    if (href === "#") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const linkStyle = (href: string): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 16px",
    borderRadius: "8px",
    color: isActive(href) ? "#fff" : "rgba(255,255,255,0.65)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: isActive(href) ? 500 : 400,
    background: isActive(href)
      ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
      : "transparent",
    transition: "all 0.15s ease",
    cursor: "pointer",
  });

  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "260px",
        height: "100vh",
        backgroundColor: "#0f172a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        zIndex: 50,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "24px 20px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            fontSize: "28px",
            fontWeight: 800,
            letterSpacing: "0.05em",
            lineHeight: 1,
          }}
        >
          MLS
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 500,
            letterSpacing: "0.15em",
            color: "rgba(255,255,255,0.5)",
            marginTop: "4px",
          }}
        >
          AGENT PORTAL
        </div>
      </div>

      {/* Navigation sections */}
      <nav style={{ flex: 1, padding: "8px 12px", overflowY: "auto" }}>
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: "8px" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.35)",
                padding: "12px 16px 6px",
                textTransform: "uppercase",
              }}
            >
              {section.title}
            </div>
            {section.items.map((item) => (
              <Link key={item.label} href={item.href} style={linkStyle(item.href)}>
                <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && item.badgeType && item.badge === "STATUS_COUNTS" ? (
                  <StatusBadges counts={statusCounts} onClickStatus={(s) => router.push(`/my-listings?status=${s}`)} />
                ) : item.badge && item.badge === "SAVED_COUNT" ? (
                  savedCount > 0 ? <Badge text={String(savedCount)} type="count" /> : null
                ) : item.badge && item.badge === "OPEN_HOUSE_COUNT" ? (
                  openHouseCount > 0 ? (
                    <span
                      style={{
                        backgroundColor: "#f59e0b",
                        color: "#000",
                        fontSize: "11px",
                        fontWeight: 600,
                        borderRadius: "9999px",
                        minWidth: "20px",
                        height: "20px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0 6px",
                        lineHeight: 1,
                      }}
                    >
                      {openHouseCount}
                    </span>
                  ) : null
                ) : item.badge && item.badgeType ? (
                  <Badge text={item.badge} type={item.badgeType as "count" | "soon"} />
                ) : null}
              </Link>
            ))}
          </div>
        ))}

        {/* My Account */}
        <div style={{ marginBottom: "8px" }}>
          <div
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.35)",
              padding: "12px 16px 6px",
              textTransform: "uppercase",
            }}
          >
            MY ACCOUNT
          </div>
          {accountItems.map((item) =>
            item.label === "Logout" ? (
              <button
                key={item.label}
                onClick={handleLogout}
                style={{
                  ...linkStyle("#"),
                  border: "none",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </button>
            ) : (
              <Link key={item.label} href={item.href} style={linkStyle(item.href)}>
                <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </Link>
            )
          )}
        </div>
      </nav>

      {/* User info at bottom */}
      <div
        style={{
          padding: "16px 16px 20px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "9999px",
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
            textTransform: "uppercase",
          }}
        >
          {userInitial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              lineHeight: 1.3,
            }}
          >
            {userName}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.3,
            }}
          >
            {userPlan}
          </div>
        </div>
        <button
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.45)",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Settings"
        >
          <GearIcon />
        </button>
      </div>
    </aside>
  );
}
