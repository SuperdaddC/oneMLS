"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { Property, Profile } from "@/lib/types";

type TemplateCategory =
  | "new-listing"
  | "open-house"
  | "just-sold"
  | "price-reduction"
  | "market-update"
  | "follow-up";

interface TemplateConfig {
  key: TemplateCategory;
  label: string;
  description: string;
  needsProperty: boolean;
}

const TEMPLATES: TemplateConfig[] = [
  { key: "new-listing", label: "New Listing", description: "Announce a new listing to your contacts", needsProperty: true },
  { key: "open-house", label: "Open House Invite", description: "Invite buyers to an open house", needsProperty: true },
  { key: "just-sold", label: "Just Sold", description: "Announce a successful sale", needsProperty: true },
  { key: "price-reduction", label: "Price Reduction", description: "Notify interested buyers of a price drop", needsProperty: true },
  { key: "market-update", label: "Market Update", description: "Share market stats with your sphere", needsProperty: false },
  { key: "follow-up", label: "Follow-Up", description: "Check in after a showing or meeting", needsProperty: false },
];

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function buildEmailHtml(
  template: TemplateCategory,
  property: Property | null,
  agent: { name: string; email: string; phone: string; brokerage: string }
): string {
  const gold = "#c9a962";
  const dark = "#161620";
  const darkAlt = "#1c1c2e";
  const textLight = "#e2e8f0";
  const textMuted = "#94a3b8";

  const photoUrl = property?.photos?.[0] ?? "https://placehold.co/600x350/1c1c2e/c9a962?text=Property+Photo";
  const address = property ? `${property.address}, ${property.city}, ${property.state} ${property.zip}` : "";
  const price = property ? formatPrice(property.price) : "";
  const beds = property?.bedrooms ?? 0;
  const baths = property?.bathrooms ?? 0;
  const sqft = property?.sqft ? property.sqft.toLocaleString() : "0";
  const propertyUrl = property ? `${typeof window !== "undefined" ? window.location.origin : ""}/property/${property.id}` : "#";

  const header = `
    <tr>
      <td style="background-color:${dark};padding:24px 32px;text-align:center;">
        <div style="font-size:24px;font-weight:800;color:#fff;letter-spacing:0.05em;">ONE<span style="color:${gold};">MLS</span></div>
      </td>
    </tr>`;

  const agentHeader = `
    <tr>
      <td style="padding:20px 32px;background-color:${darkAlt};">
        <div style="color:#fff;font-size:16px;font-weight:600;">${agent.name}</div>
        <div style="color:${textMuted};font-size:13px;">${agent.brokerage}</div>
        <div style="color:${textMuted};font-size:13px;">${agent.phone} &bull; ${agent.email}</div>
      </td>
    </tr>`;

  const heroImage = `
    <tr>
      <td style="padding:0;position:relative;">
        <img src="${photoUrl}" alt="Property" style="width:100%;display:block;max-height:350px;object-fit:cover;" />
        ${property ? `<div style="background:rgba(0,0,0,0.65);color:#fff;padding:8px 20px;font-size:28px;font-weight:700;position:absolute;bottom:0;left:0;right:0;">${price}</div>` : ""}
      </td>
    </tr>`;

  const propertyDetails = property
    ? `<tr>
        <td style="padding:20px 32px;background-color:${dark};">
          <div style="color:#fff;font-size:18px;font-weight:600;margin-bottom:8px;">${address}</div>
          <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td style="color:${textLight};font-size:14px;padding:4px 0;"><strong>${beds}</strong> Beds</td>
            <td style="color:${textLight};font-size:14px;padding:4px 0;"><strong>${baths}</strong> Baths</td>
            <td style="color:${textLight};font-size:14px;padding:4px 0;"><strong>${sqft}</strong> Sq Ft</td>
            ${property.year_built ? `<td style="color:${textLight};font-size:14px;padding:4px 0;">Built <strong>${property.year_built}</strong></td>` : ""}
          </tr></table>
        </td>
      </tr>`
    : "";

  const ctaButton = property
    ? `<tr>
        <td style="padding:24px 32px;text-align:center;background-color:${dark};">
          <a href="${propertyUrl}" style="display:inline-block;background-color:${gold};color:#000;font-size:16px;font-weight:700;padding:14px 40px;border-radius:6px;text-decoration:none;">View Property</a>
        </td>
      </tr>`
    : "";

  const footer = `
    <tr>
      <td style="padding:20px 32px;background-color:${darkAlt};border-top:1px solid #2a2a3a;text-align:center;">
        <div style="color:${textMuted};font-size:12px;">${agent.name} | ${agent.brokerage}</div>
        <div style="color:${textMuted};font-size:12px;">${agent.phone} | ${agent.email}</div>
        <div style="color:${textMuted};font-size:11px;margin-top:8px;">Powered by OneMLS</div>
      </td>
    </tr>`;

  let bodyContent = "";

  switch (template) {
    case "new-listing":
      bodyContent = `
        <tr>
          <td style="padding:24px 32px;background-color:${dark};">
            <div style="color:${gold};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">NEW LISTING</div>
            <div style="color:#fff;font-size:20px;font-weight:600;margin-bottom:12px;">I'm excited to share my newest listing!</div>
            <div style="color:${textLight};font-size:14px;line-height:1.6;">This stunning property just hit the market and I wanted you to be among the first to know. ${property?.description ? property.description.slice(0, 200) + "..." : "Contact me for more details about this incredible property."}</div>
          </td>
        </tr>`;
      break;
    case "open-house":
      bodyContent = `
        <tr>
          <td style="padding:24px 32px;background-color:${dark};">
            <div style="color:${gold};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">OPEN HOUSE</div>
            <div style="color:#fff;font-size:20px;font-weight:600;margin-bottom:12px;">You're Invited to an Open House!</div>
            <div style="color:${textLight};font-size:14px;line-height:1.6;">Join me this weekend for an exclusive open house event. Come see this beautiful property in person and discover everything it has to offer.</div>
            <div style="margin-top:16px;padding:16px;background-color:${darkAlt};border-radius:8px;border-left:3px solid ${gold};">
              <div style="color:#fff;font-size:14px;font-weight:600;">Event Details</div>
              <div style="color:${textMuted};font-size:13px;margin-top:4px;">Date: [Saturday/Sunday]</div>
              <div style="color:${textMuted};font-size:13px;">Time: [1:00 PM - 4:00 PM]</div>
              <div style="color:${textMuted};font-size:13px;">Location: ${address}</div>
            </div>
          </td>
        </tr>`;
      break;
    case "just-sold":
      bodyContent = `
        <tr>
          <td style="padding:24px 32px;background-color:${dark};">
            <div style="color:${gold};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">JUST SOLD</div>
            <div style="color:#fff;font-size:20px;font-weight:600;margin-bottom:12px;">Another One Sold!</div>
            <div style="color:${textLight};font-size:14px;line-height:1.6;">I'm thrilled to announce the successful sale of this beautiful property. It was a pleasure working with both the buyers and sellers to make this happen. If you're thinking about buying or selling, I'd love to help you achieve your real estate goals too!</div>
          </td>
        </tr>`;
      break;
    case "price-reduction":
      bodyContent = `
        <tr>
          <td style="padding:24px 32px;background-color:${dark};">
            <div style="color:#ef4444;font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">PRICE REDUCED</div>
            <div style="color:#fff;font-size:20px;font-weight:600;margin-bottom:12px;">Price Just Reduced!</div>
            <div style="color:${textLight};font-size:14px;line-height:1.6;">Great news for buyers! The price on this property has just been reduced. This is an incredible opportunity to get a fantastic home at an even better value. Don't miss out - properties at this price point move fast!</div>
          </td>
        </tr>`;
      break;
    case "market-update":
      bodyContent = `
        <tr>
          <td style="padding:24px 32px;background-color:${dark};">
            <div style="color:${gold};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">MARKET UPDATE</div>
            <div style="color:#fff;font-size:20px;font-weight:600;margin-bottom:12px;">Your Monthly Market Update</div>
            <div style="color:${textLight};font-size:14px;line-height:1.6;">Here's what's happening in our local real estate market this month. Whether you're looking to buy, sell, or just stay informed, these insights will help you make smarter decisions.</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;">
              <tr>
                <td style="padding:12px;background-color:${darkAlt};border-radius:8px;text-align:center;width:50%;">
                  <div style="color:${gold};font-size:24px;font-weight:700;">[XX]</div>
                  <div style="color:${textMuted};font-size:12px;">Active Listings</div>
                </td>
                <td style="width:12px;"></td>
                <td style="padding:12px;background-color:${darkAlt};border-radius:8px;text-align:center;width:50%;">
                  <div style="color:${gold};font-size:24px;font-weight:700;">[XX]</div>
                  <div style="color:${textMuted};font-size:12px;">Avg. Days on Market</div>
                </td>
              </tr>
              <tr><td colspan="3" style="height:12px;"></td></tr>
              <tr>
                <td style="padding:12px;background-color:${darkAlt};border-radius:8px;text-align:center;width:50%;">
                  <div style="color:${gold};font-size:24px;font-weight:700;">$[XXX]K</div>
                  <div style="color:${textMuted};font-size:12px;">Median Price</div>
                </td>
                <td style="width:12px;"></td>
                <td style="padding:12px;background-color:${darkAlt};border-radius:8px;text-align:center;width:50%;">
                  <div style="color:${gold};font-size:24px;font-weight:700;">[X]%</div>
                  <div style="color:${textMuted};font-size:12px;">Price Change YoY</div>
                </td>
              </tr>
            </table>
            <div style="color:${textMuted};font-size:13px;margin-top:16px;">Have questions about what this means for you? Reach out anytime - I'm happy to discuss your options.</div>
          </td>
        </tr>`;
      break;
    case "follow-up":
      bodyContent = `
        <tr>
          <td style="padding:24px 32px;background-color:${dark};">
            <div style="color:${gold};font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin-bottom:8px;">FOLLOW UP</div>
            <div style="color:#fff;font-size:20px;font-weight:600;margin-bottom:12px;">Great Meeting You!</div>
            <div style="color:${textLight};font-size:14px;line-height:1.6;">Thank you for taking the time to meet with me. I truly enjoyed our conversation and learning more about what you're looking for in your next home. I want you to know that I'm here to help every step of the way.</div>
            <div style="color:${textLight};font-size:14px;line-height:1.6;margin-top:12px;">Here are some next steps I'd suggest:</div>
            <ul style="color:${textLight};font-size:14px;line-height:1.8;padding-left:20px;">
              <li>Review the properties we discussed</li>
              <li>Let me know if you'd like to schedule any showings</li>
              <li>Feel free to reach out with any questions</li>
            </ul>
            <div style="color:${textLight};font-size:14px;line-height:1.6;margin-top:12px;">I look forward to working with you!</div>
          </td>
        </tr>`;
      break;
  }

  const wrap = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background-color:#0a0a0f;font-family:Arial,Helvetica,sans-serif;">
<table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#0a0a0f;">
  <tr><td align="center" style="padding:20px;">
    <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;background-color:${dark};border-radius:12px;overflow:hidden;">
      ${header}
      ${agentHeader}
      ${template !== "market-update" && template !== "follow-up" ? heroImage : ""}
      ${bodyContent}
      ${propertyDetails}
      ${ctaButton}
      ${footer}
    </table>
  </td></tr>
</table>
</body></html>`;

  return wrap;
}

function buildPlainText(
  template: TemplateCategory,
  property: Property | null,
  agent: { name: string; email: string; phone: string; brokerage: string }
): string {
  const address = property ? `${property.address}, ${property.city}, ${property.state} ${property.zip}` : "";
  const price = property ? formatPrice(property.price) : "";
  const beds = property?.bedrooms ?? 0;
  const baths = property?.bathrooms ?? 0;
  const sqft = property?.sqft ? property.sqft.toLocaleString() : "0";

  const sig = `\n---\n${agent.name}\n${agent.brokerage}\n${agent.phone} | ${agent.email}\nPowered by OneMLS`;

  switch (template) {
    case "new-listing":
      return `NEW LISTING\n\nI'm excited to share my newest listing!\n\n${address}\n${price} | ${beds} Beds | ${baths} Baths | ${sqft} Sq Ft\n\n${property?.description?.slice(0, 300) ?? "Contact me for more details about this incredible property."}\n${sig}`;
    case "open-house":
      return `OPEN HOUSE INVITATION\n\nYou're invited to an open house!\n\n${address}\n${price} | ${beds} Beds | ${baths} Baths | ${sqft} Sq Ft\n\nDate: [Saturday/Sunday]\nTime: [1:00 PM - 4:00 PM]\nLocation: ${address}\n\nCome see this beautiful property in person!${sig}`;
    case "just-sold":
      return `JUST SOLD\n\nAnother one sold!\n\n${address}\n${price} | ${beds} Beds | ${baths} Baths | ${sqft} Sq Ft\n\nI'm thrilled to announce the successful sale of this property. If you're thinking about buying or selling, I'd love to help!${sig}`;
    case "price-reduction":
      return `PRICE REDUCED\n\nGreat news - the price has just been reduced!\n\n${address}\nNEW PRICE: ${price} | ${beds} Beds | ${baths} Baths | ${sqft} Sq Ft\n\nDon't miss this incredible opportunity!${sig}`;
    case "market-update":
      return `MONTHLY MARKET UPDATE\n\nHere's what's happening in your local real estate market:\n\n- Active Listings: [XX]\n- Average Days on Market: [XX]\n- Median Price: $[XXX]K\n- Price Change YoY: [X]%\n\nHave questions? Reach out anytime!${sig}`;
    case "follow-up":
      return `FOLLOW UP\n\nThank you for taking the time to meet with me! I truly enjoyed our conversation.\n\nNext steps:\n- Review the properties we discussed\n- Let me know if you'd like to schedule any showings\n- Feel free to reach out with any questions\n\nI look forward to working with you!${sig}`;
  }
}

export default function EmailCampaignsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<TemplateCategory>("new-listing");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [copied, setCopied] = useState<"html" | "text" | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [{ data: props }, { data: prof }] = await Promise.all([
        supabase.from("properties").select("*").eq("owner_id", user.id),
        supabase.from("profiles").select("*").eq("id", user.id).single(),
      ]);
      if (props) setProperties(props);
      if (prof) setProfile(prof);
      setLoading(false);
    };
    load();
  }, []);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId) ?? null;
  const currentConfig = TEMPLATES.find((t) => t.key === activeTemplate)!;

  const agent = {
    name: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Agent Name",
    email: profile?.email ?? "agent@onemls.com",
    phone: profile?.phone ?? "(555) 123-4567",
    brokerage: profile?.brokerage_name ?? "Brokerage Name",
  };

  const emailHtml = buildEmailHtml(activeTemplate, currentConfig.needsProperty ? selectedProperty : null, agent);
  const emailText = buildPlainText(activeTemplate, currentConfig.needsProperty ? selectedProperty : null, agent);

  const copyToClipboard = async (type: "html" | "text") => {
    try {
      await navigator.clipboard.writeText(type === "html" ? emailHtml : emailText);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = type === "html" ? emailHtml : emailText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-[#94a3b8]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
        <span>Portal</span>
        <span>/</span>
        <span className="text-white">Email Campaigns</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-[#1c1c2e] border border-[#2a2a3a] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="16" height="12" rx="2" stroke="#c9a962" strokeWidth="1.5" />
            <path d="M2 6L10 11L18 6" stroke="#c9a962" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Email Campaigns</h1>
          <p className="text-[#94a3b8] text-sm">Professional email templates for your real estate business</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6">
        {/* Left: Template picker + property selector */}
        <div className="space-y-4">
          {/* Template categories */}
          <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Template Type</h3>
            {TEMPLATES.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTemplate(t.key)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeTemplate === t.key
                    ? "bg-[#c9a962]/15 border border-[#c9a962]/40 text-white"
                    : "bg-[#1c1c2e] border border-transparent text-[#94a3b8] hover:border-[#2a2a3a] hover:text-white"
                }`}
              >
                <div className="font-medium text-sm">{t.label}</div>
                <div className="text-xs mt-0.5 opacity-70">{t.description}</div>
              </button>
            ))}
          </div>

          {/* Property selector (when needed) */}
          {currentConfig.needsProperty && (
            <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-4">
              <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Select Property</h3>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full bg-[#1c1c2e] border border-[#2a2a3a] rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-[#c9a962]"
              >
                <option value="">-- Choose a listing --</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.address}, {p.city}
                  </option>
                ))}
              </select>
              {properties.length === 0 && (
                <p className="text-xs text-[#94a3b8] mt-2">No listings found. Create a listing first.</p>
              )}
            </div>
          )}

          {/* Copy buttons */}
          <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Export</h3>
            <button
              onClick={() => copyToClipboard("html")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#c9a962] text-black font-semibold text-sm hover:bg-[#b8993f] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="2" width="8" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 6V13C3 13.5523 3.44772 14 4 14H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {copied === "html" ? "Copied!" : "Copy HTML"}
            </button>
            <button
              onClick={() => copyToClipboard("text")}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#1c1c2e] border border-[#2a2a3a] text-white font-medium text-sm hover:border-[#c9a962] transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="2" width="10" height="12" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <path d="M6 6H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M6 9H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {copied === "text" ? "Copied!" : "Copy Plain Text"}
            </button>
          </div>
        </div>

        {/* Right: Email preview */}
        <div className="bg-[#161620] border border-[#2a2a3a] rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#2a2a3a] flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Email Preview</h3>
            <span className="text-xs text-[#94a3b8]">600px max width</span>
          </div>
          <div className="p-6 flex justify-center overflow-auto" style={{ backgroundColor: "#0a0a0f" }}>
            <div
              ref={previewRef}
              className="w-full max-w-[600px]"
              dangerouslySetInnerHTML={{ __html: emailHtml }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
