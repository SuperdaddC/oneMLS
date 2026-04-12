"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { UserPlan } from "@/lib/types";

const CreditCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="4" width="20" height="16" rx="3" stroke="#c9a962" strokeWidth="2" />
    <path d="M2 9H22" stroke="#c9a962" strokeWidth="2" />
    <path d="M6 14H10" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" />
    <path d="M14 14H16" stroke="#c9a962" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 7L6 10L11 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface PlanInfo {
  key: UserPlan;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
}

const plans: PlanInfo[] = [
  {
    key: "free",
    name: "Free",
    price: 0,
    period: "/mo",
    description: "Get started with the basics",
    features: [
      "1 active listing",
      "Property search access",
      "Basic agent profile",
      "Standard support",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: 29,
    period: "/mo",
    description: "Everything you need to grow",
    features: [
      "Unlimited listings",
      "Marketing toolkit & flyers",
      "CMA reports",
      "E-contracts & e-sign",
      "Showing management",
      "Analytics dashboard",
      "Priority support",
    ],
    recommended: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: 99,
    period: "/mo",
    description: "For teams and brokerages",
    features: [
      "Everything in Pro",
      "API access",
      "Lead generation tools",
      "Priority phone support",
      "Custom branding",
      "Team management",
      "Dedicated account manager",
    ],
  },
];

export default function BillingPage() {
  const [currentPlan, setCurrentPlan] = useState<UserPlan>("free");
  const [loading, setLoading] = useState(true);
  const [showPlans, setShowPlans] = useState(false);
  const [upgradeMessage, setUpgradeMessage] = useState("");

  useEffect(() => {
    const supabase = createClient();
    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();
        if (profile) setCurrentPlan(profile.plan as UserPlan);
      }
      setLoading(false);
    }
    loadPlan();
  }, []);

  const currentPlanInfo = plans.find(p => p.key === currentPlan) || plans[0];

  const handlePlanAction = (planKey: UserPlan) => {
    if (planKey === currentPlan) return;
    setUpgradeMessage("Connect Stripe to enable payments. Stripe integration coming soon.");
    setTimeout(() => setUpgradeMessage(""), 4000);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#94a3b8" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #2a2a3a", borderTopColor: "#c9a962", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p>Loading billing information...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
        <CreditCardIcon />
        <div>
          <h1 style={{ color: "#fff", fontSize: "28px", fontWeight: 700, margin: 0 }}>Billing & Subscription</h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "4px 0 0 0" }}>Manage your plan and payment methods</p>
        </div>
      </div>

      {/* Upgrade message toast */}
      {upgradeMessage && (
        <div style={{
          backgroundColor: "rgba(201, 169, 98, 0.1)",
          border: "1px solid rgba(201, 169, 98, 0.3)",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "24px",
          color: "#c9a962",
          fontSize: "14px",
        }}>
          {upgradeMessage}
        </div>
      )}

      {/* Current Plan */}
      <div style={{
        backgroundColor: "#1c1c2e",
        borderRadius: "12px",
        border: "1px solid #2a2a3a",
        padding: "24px",
        marginBottom: "24px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Current Plan
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <span style={{ color: "#fff", fontSize: "24px", fontWeight: 700 }}>{currentPlanInfo.name}</span>
              <span style={{ color: "#c9a962", fontSize: "18px", fontWeight: 600 }}>
                ${currentPlanInfo.price}{currentPlanInfo.period}
              </span>
            </div>
            <p style={{ color: "#94a3b8", fontSize: "14px", marginTop: "4px" }}>{currentPlanInfo.description}</p>
          </div>
          <button
            onClick={() => setShowPlans(!showPlans)}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #c9a962 0%, #b8923e 100%)",
              color: "#000",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showPlans ? "Hide Plans" : "Change Plan"}
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
          {currentPlanInfo.features.map((f) => (
            <div key={f} style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              backgroundColor: "rgba(34, 197, 94, 0.08)",
              borderRadius: "9999px",
              fontSize: "13px",
              color: "#94a3b8",
            }}>
              <CheckIcon />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Plan Comparison */}
      {showPlans && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}>
          {plans.map((plan) => (
            <div key={plan.key} style={{
              backgroundColor: "#1c1c2e",
              borderRadius: "12px",
              border: plan.recommended ? "2px solid #c9a962" : "1px solid #2a2a3a",
              padding: "28px",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}>
              {plan.recommended && (
                <div style={{
                  position: "absolute",
                  top: "-12px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  backgroundColor: "#c9a962",
                  color: "#000",
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 12px",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}>
                  Recommended
                </div>
              )}
              <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>
                {plan.name}
              </h3>
              <div style={{ marginBottom: "8px" }}>
                <span style={{ color: "#fff", fontSize: "36px", fontWeight: 800 }}>${plan.price}</span>
                <span style={{ color: "#94a3b8", fontSize: "14px" }}>{plan.period}</span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "20px" }}>{plan.description}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, marginBottom: "24px" }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CheckIcon />
                    <span style={{ color: "#e2e8f0", fontSize: "14px" }}>{f}</span>
                  </div>
                ))}
              </div>
              {plan.key === currentPlan ? (
                <div style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "1px solid #c9a962",
                  backgroundColor: "transparent",
                  color: "#c9a962",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "center",
                }}>
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handlePlanAction(plan.key)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: "8px",
                    border: "none",
                    background: plan.recommended
                      ? "linear-gradient(135deg, #c9a962 0%, #b8923e 100%)"
                      : "#2a2a3a",
                    color: plan.recommended ? "#000" : "#fff",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {plan.price > (currentPlanInfo?.price ?? 0) ? "Upgrade" : "Downgrade"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Payment History */}
      <div style={{
        backgroundColor: "#1c1c2e",
        borderRadius: "12px",
        border: "1px solid #2a2a3a",
        padding: "24px",
        marginBottom: "24px",
      }}>
        <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Payment History</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2a2a3a" }}>
                {["Date", "Amount", "Status", "Invoice"].map((h) => (
                  <th key={h} style={{
                    padding: "10px 16px",
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
              <tr>
                <td colSpan={4} style={{
                  padding: "32px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}>
                  No payment history yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{
        backgroundColor: "#1c1c2e",
        borderRadius: "12px",
        border: "1px solid #2a2a3a",
        padding: "24px",
      }}>
        <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 600, marginBottom: "16px" }}>Payment Method</h3>
        <div style={{
          textAlign: "center",
          padding: "32px",
          border: "2px dashed #2a2a3a",
          borderRadius: "12px",
        }}>
          <CreditCardIcon />
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "12px 0" }}>
            Stripe integration coming soon.
          </p>
          <button
            onClick={() => setUpgradeMessage("Connect Stripe to enable payments. Stripe integration coming soon.")}
            style={{
              padding: "10px 24px",
              borderRadius: "8px",
              border: "1px solid #2a2a3a",
              backgroundColor: "transparent",
              color: "#94a3b8",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Add Payment Method
          </button>
        </div>
      </div>
    </div>
  );
}
