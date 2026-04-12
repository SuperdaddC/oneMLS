// NOTE: Run this SQL to allow admins to see all profiles:
// CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
//   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
// );
// CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
//   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
// );

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Profile, Property, UserRole } from "@/lib/types";

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" stroke="#c9a962" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface PlatformStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  pendingVerification: number;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalListings: 0,
    activeListings: 0,
    pendingVerification: 0,
  });
  const [users, setUsers] = useState<Profile[]>([]);
  const [listings, setListings] = useState<(Property & { owner?: Profile })[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<Profile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "listings" | "verification" | "activity">("users");

  useEffect(() => {
    const supabase = createClient();

    async function checkAccessAndLoad() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        setLoading(false);
        return;
      }

      setAuthorized(true);

      // Fetch stats and data in parallel
      const [profilesRes, propertiesRes, activeRes, unverifiedRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("properties").select("*, owner:profiles(*)"),
        supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("*").eq("verified", false),
      ]);

      setStats({
        totalUsers: profilesRes.data?.length ?? 0,
        totalListings: propertiesRes.data?.length ?? 0,
        activeListings: activeRes.count ?? 0,
        pendingVerification: unverifiedRes.data?.length ?? 0,
      });

      if (profilesRes.data) setUsers(profilesRes.data as Profile[]);
      if (propertiesRes.data) setListings(propertiesRes.data as (Property & { owner?: Profile })[]);
      if (unverifiedRes.data) setUnverifiedUsers(unverifiedRes.data as Profile[]);

      setLoading(false);
    }

    checkAccessAndLoad();
  }, []);

  const handleVerifyUser = async (userId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ verified: true })
      .eq("id", userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
      setUnverifiedUsers(prev => prev.filter(u => u.id !== userId));
      setStats(prev => ({ ...prev, pendingVerification: prev.pendingVerification - 1 }));
    }
  };

  const handleRejectUser = async (userId: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ verified: false })
      .eq("id", userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: false } : u));
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
  };

  const handleListingStatusChange = async (listingId: string, newStatus: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("properties")
      .update({ status: newStatus })
      .eq("id", listingId);
    if (!error) {
      setListings(prev => prev.map(l => l.id === listingId ? { ...l, status: newStatus as Property["status"] } : l));
    }
  };

  const filteredUsers = users.filter(u => {
    const search = userSearch.toLowerCase();
    if (!search) return true;
    return (
      u.first_name?.toLowerCase().includes(search) ||
      u.last_name?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.role?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#94a3b8" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #2a2a3a", borderTopColor: "#c9a962", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p>Loading admin dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{
          textAlign: "center",
          padding: "48px",
          backgroundColor: "#1c1c2e",
          borderRadius: "16px",
          border: "1px solid #2a2a3a",
          maxWidth: "400px",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>
            <ShieldIcon />
          </div>
          <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 600, marginBottom: "8px" }}>
            Access Denied
          </h2>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            You do not have administrator privileges. Contact your system administrator for access.
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, color: "#3b82f6" },
    { label: "Total Listings", value: stats.totalListings, color: "#8b5cf6" },
    { label: "Active Listings", value: stats.activeListings, color: "#22c55e" },
    { label: "Pending Verification", value: stats.pendingVerification, color: "#f59e0b" },
    { label: "Revenue", value: "$0", color: "#c9a962", subtitle: "Connect Stripe" },
  ];

  const tabs = [
    { key: "users" as const, label: "User Management" },
    { key: "listings" as const, label: "Listing Moderation" },
    { key: "verification" as const, label: "License Verification Queue" },
    { key: "activity" as const, label: "Platform Activity" },
  ];

  return (
    <div style={{ padding: "32px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <ShieldIcon />
        <div>
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: 700, margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>Platform management and oversight</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "32px",
      }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            backgroundColor: "#1c1c2e",
            borderRadius: "12px",
            border: "1px solid #2a2a3a",
            padding: "20px",
          }}>
            <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>{card.label}</div>
            <div style={{ color: "#fff", fontSize: "28px", fontWeight: 700 }}>
              {typeof card.value === "number" ? card.value.toLocaleString() : card.value}
            </div>
            {card.subtitle && (
              <div style={{ color: card.color, fontSize: "12px", marginTop: "4px" }}>{card.subtitle}</div>
            )}
            <div style={{ width: "32px", height: "3px", backgroundColor: card.color, borderRadius: "2px", marginTop: "12px" }} />
          </div>
        ))}
      </div>

      {/* Note about admin API */}
      <div style={{
        backgroundColor: "rgba(201, 169, 98, 0.1)",
        border: "1px solid rgba(201, 169, 98, 0.3)",
        borderRadius: "8px",
        padding: "12px 16px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <span style={{ color: "#c9a962", fontSize: "14px" }}>Note:</span>
        <span style={{ color: "#94a3b8", fontSize: "13px" }}>
          Full user management requires admin RLS policies. See SQL comment at top of source file.
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "4px",
        marginBottom: "24px",
        borderBottom: "1px solid #2a2a3a",
        paddingBottom: "0",
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "10px 20px",
              backgroundColor: "transparent",
              color: activeTab === tab.key ? "#c9a962" : "#94a3b8",
              border: "none",
              borderBottom: activeTab === tab.key ? "2px solid #c9a962" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeTab === tab.key ? 600 : 400,
              marginBottom: "-1px",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
            {tab.key === "verification" && stats.pendingVerification > 0 && (
              <span style={{
                marginLeft: "8px",
                backgroundColor: "#f59e0b",
                color: "#000",
                fontSize: "11px",
                fontWeight: 700,
                borderRadius: "9999px",
                padding: "2px 6px",
              }}>
                {stats.pendingVerification}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "users" && (
        <div>
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{
                width: "100%",
                maxWidth: "400px",
                padding: "10px 16px",
                backgroundColor: "#161620",
                border: "1px solid #2a2a3a",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>
          <div style={{
            backgroundColor: "#1c1c2e",
            borderRadius: "12px",
            border: "1px solid #2a2a3a",
            overflow: "hidden",
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
                    {["Name", "Email", "Role", "Plan", "Verified", "Joined", "Actions"].map((h) => (
                      <th key={h} style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        color: "#94a3b8",
                        fontSize: "12px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #2a2a3a" }}>
                      <td style={{ padding: "12px 16px", color: "#fff", fontSize: "14px" }}>
                        {u.first_name} {u.last_name}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "14px" }}>
                        {u.email}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          padding: "3px 10px",
                          borderRadius: "9999px",
                          fontSize: "12px",
                          fontWeight: 600,
                          backgroundColor: u.role === "admin" ? "rgba(201,169,98,0.15)" : "rgba(59,130,246,0.15)",
                          color: u.role === "admin" ? "#c9a962" : "#3b82f6",
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "14px", textTransform: "capitalize" }}>
                        {u.plan}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-block",
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: u.verified ? "#22c55e" : "#ef4444",
                          marginRight: "6px",
                        }} />
                        <span style={{ color: u.verified ? "#22c55e" : "#ef4444", fontSize: "13px" }}>
                          {u.verified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "13px" }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <button
                            onClick={() => handleVerifyUser(u.id)}
                            disabled={u.verified}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: "1px solid #2a2a3a",
                              backgroundColor: u.verified ? "transparent" : "#22c55e",
                              color: u.verified ? "#94a3b8" : "#fff",
                              fontSize: "12px",
                              cursor: u.verified ? "default" : "pointer",
                              opacity: u.verified ? 0.4 : 1,
                            }}
                          >
                            Verify
                          </button>
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value as UserRole)}
                            style={{
                              padding: "4px 8px",
                              borderRadius: "6px",
                              border: "1px solid #2a2a3a",
                              backgroundColor: "#161620",
                              color: "#fff",
                              fontSize: "12px",
                              cursor: "pointer",
                            }}
                          >
                            <option value="agent">Agent</option>
                            <option value="broker">Broker</option>
                            <option value="fsbo">FSBO</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                        No users found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "listings" && (
        <div style={{
          backgroundColor: "#1c1c2e",
          borderRadius: "12px",
          border: "1px solid #2a2a3a",
          overflow: "hidden",
        }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
                  {["Photo", "Address", "Agent", "Price", "Status", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      color: "#94a3b8",
                      fontSize: "12px",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {listings.map((l) => (
                  <tr key={l.id} style={{ borderBottom: "1px solid #2a2a3a" }}>
                    <td style={{ padding: "12px 16px" }}>
                      {l.photos?.[0] ? (
                        <img
                          src={l.photos[0]}
                          alt=""
                          style={{ width: "48px", height: "36px", objectFit: "cover", borderRadius: "6px" }}
                        />
                      ) : (
                        <div style={{
                          width: "48px", height: "36px", borderRadius: "6px",
                          backgroundColor: "#2a2a3a",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10px", color: "#94a3b8",
                        }}>
                          N/A
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#fff", fontSize: "14px" }}>
                      {l.address}, {l.city}, {l.state}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "14px" }}>
                      {l.owner ? `${l.owner.first_name} ${l.owner.last_name}` : "Unknown"}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#fff", fontSize: "14px", fontWeight: 600 }}>
                      ${l.price?.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{
                        padding: "3px 10px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: 600,
                        backgroundColor:
                          l.status === "active" ? "rgba(59,130,246,0.15)" :
                          l.status === "pending" ? "rgba(34,197,94,0.15)" :
                          l.status === "draft" ? "rgba(201,169,98,0.15)" :
                          "rgba(239,68,68,0.15)",
                        color:
                          l.status === "active" ? "#3b82f6" :
                          l.status === "pending" ? "#22c55e" :
                          l.status === "draft" ? "#c9a962" :
                          "#ef4444",
                      }}>
                        {l.status}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          onClick={() => handleListingStatusChange(l.id, "active")}
                          style={{
                            padding: "4px 8px", borderRadius: "6px", border: "1px solid #2a2a3a",
                            backgroundColor: l.status === "active" ? "#3b82f6" : "transparent",
                            color: l.status === "active" ? "#fff" : "#94a3b8",
                            fontSize: "11px", cursor: "pointer",
                          }}
                        >
                          Activate
                        </button>
                        <button
                          onClick={() => handleListingStatusChange(l.id, "withdrawn")}
                          style={{
                            padding: "4px 8px", borderRadius: "6px", border: "1px solid #2a2a3a",
                            backgroundColor: "transparent", color: "#f59e0b",
                            fontSize: "11px", cursor: "pointer",
                          }}
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => handleListingStatusChange(l.id, "cancelled")}
                          style={{
                            padding: "4px 8px", borderRadius: "6px", border: "1px solid #2a2a3a",
                            backgroundColor: "transparent", color: "#ef4444",
                            fontSize: "11px", cursor: "pointer",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {listings.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#94a3b8" }}>
                      No listings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
        <div>
          <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>
            License Verification Queue
          </h3>
          {unverifiedUsers.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "48px",
              backgroundColor: "#1c1c2e",
              borderRadius: "12px",
              border: "1px solid #2a2a3a",
              color: "#94a3b8",
            }}>
              <p style={{ fontSize: "16px", marginBottom: "4px" }}>All caught up!</p>
              <p style={{ fontSize: "13px" }}>No users pending verification.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {unverifiedUsers.map((u) => (
                <div key={u.id} style={{
                  backgroundColor: "#1c1c2e",
                  borderRadius: "12px",
                  border: "1px solid #2a2a3a",
                  padding: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "16px",
                }}>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ color: "#fff", fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                      {u.first_name} {u.last_name}
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>{u.email}</div>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                      <div>
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>License: </span>
                        <span style={{ color: "#fff", fontSize: "13px" }}>{u.license_number || "Not provided"}</span>
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>State: </span>
                        <span style={{ color: "#fff", fontSize: "13px" }}>{u.license_state || "N/A"}</span>
                      </div>
                      <div>
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>Brokerage: </span>
                        <span style={{ color: "#fff", fontSize: "13px" }}>{u.brokerage_name || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleVerifyUser(u.id)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#22c55e",
                        color: "#fff",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleRejectUser(u.id)}
                      style={{
                        padding: "8px 20px",
                        borderRadius: "8px",
                        border: "1px solid #ef4444",
                        backgroundColor: "transparent",
                        color: "#ef4444",
                        fontSize: "13px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "16px",
        }}>
          <div style={{
            backgroundColor: "#1c1c2e",
            borderRadius: "12px",
            border: "1px solid #2a2a3a",
            padding: "24px",
          }}>
            <h4 style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Views
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: "14px" }}>Today</span>
                <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>--</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: "14px" }}>This Week</span>
                <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>--</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#94a3b8", fontSize: "14px" }}>This Month</span>
                <span style={{ color: "#fff", fontSize: "14px", fontWeight: 600 }}>--</span>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: "#1c1c2e",
            borderRadius: "12px",
            border: "1px solid #2a2a3a",
            padding: "24px",
          }}>
            <h4 style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              New Signups This Week
            </h4>
            <div style={{ color: "#fff", fontSize: "32px", fontWeight: 700 }}>
              {users.filter(u => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(u.created_at) >= weekAgo;
              }).length}
            </div>
          </div>

          <div style={{
            backgroundColor: "#1c1c2e",
            borderRadius: "12px",
            border: "1px solid #2a2a3a",
            padding: "24px",
          }}>
            <h4 style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              New Listings This Week
            </h4>
            <div style={{ color: "#fff", fontSize: "32px", fontWeight: 700 }}>
              {listings.filter(l => {
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return new Date(l.created_at) >= weekAgo;
              }).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
