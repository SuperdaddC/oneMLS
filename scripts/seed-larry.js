const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://xntomzmazspwsfymhirf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudG9tem1henNwd3NmeW1oaXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTIzOSwiZXhwIjoyMDgxNTcxMjM5fQ.fceN-SdzgKhMevDeOfem82D9lVwQjPRBAOGAamaH92g"
);

const larryId = "355502a3-49fe-4ed0-9e12-50d4f814844c";
const mikeId = "251a476f-a9ec-4a9b-828a-59a70403c3c7";

async function seedLarry() {
  console.log("=== Seeding Larry's full experience ===\n");

  // 1. Create 6 properties for Larry
  console.log("--- Creating properties ---");
  const properties = [
    {
      owner_id: larryId, status: "active", address: "742 Evergreen Terrace", city: "Colorado Springs", state: "CO", zip: "80903",
      price: 395000, bedrooms: 4, bathrooms: 2, sqft: 2100, lot_size: 7000, year_built: 1990,
      property_type: "single_family",
      description: "Classic family home on a tree-lined street. Spacious living room with fireplace, updated kitchen with breakfast nook, and a large fenced backyard. Close to Garden of the Gods and downtown.",
      features: ["Fireplace", "Fenced Yard", "Breakfast Nook", "Near Garden of the Gods", "Updated Kitchen", "Two-Car Garage"],
      photos: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200"],
      commission_rate: 3.0, lat: 38.8339, lng: -104.8214
    },
    {
      owner_id: larryId, status: "active", address: "1600 Pennsylvania Avenue", city: "Fort Collins", state: "CO", zip: "80524",
      price: 550000, bedrooms: 5, bathrooms: 3.5, sqft: 3200, lot_size: 9000, year_built: 2012,
      property_type: "single_family",
      description: "Executive home in desirable Fort Collins neighborhood. Open concept with 10-foot ceilings, chef kitchen with double island, main-floor office. Finished walkout basement with wet bar and home theater.",
      features: ["10-Foot Ceilings", "Double Island", "Main Floor Office", "Walkout Basement", "Wet Bar", "Home Theater", "Mountain Views"],
      photos: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200", "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200", "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200"],
      commission_rate: 2.5, lat: 40.5853, lng: -105.0844
    },
    {
      owner_id: larryId, status: "active", address: "3200 Oceanside Drive", city: "San Diego", state: "CA", zip: "92109",
      price: 1650000, bedrooms: 3, bathrooms: 2, sqft: 1800, lot_size: 4500, year_built: 1965,
      property_type: "single_family",
      description: "Rare Pacific Beach bungalow with ocean views. Completely renovated with modern finishes while preserving the mid-century character. Steps to the beach and boardwalk. ADU potential.",
      features: ["Ocean Views", "Renovated", "Near Beach", "ADU Potential", "Mid-Century", "Outdoor Shower"],
      photos: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200", "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200", "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=1200"],
      commission_rate: 2.5, lat: 32.7872, lng: -117.2509
    },
    {
      owner_id: larryId, status: "pending", address: "500 Brickell Key Drive #3401", city: "Miami", state: "FL", zip: "33131",
      price: 2100000, bedrooms: 4, bathrooms: 3, sqft: 2800, property_type: "condo", year_built: 2023,
      description: "Ultra-luxury condo on Brickell Key with panoramic Biscayne Bay and downtown views. Private elevator, Italian porcelain floors, Gaggenau appliances. Full-service building with marina access.",
      features: ["Bay Views", "Private Elevator", "Italian Porcelain", "Gaggenau Appliances", "Marina Access", "Spa", "Infinity Pool"],
      photos: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200", "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200", "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200"],
      commission_rate: 2.5, lat: 25.7650, lng: -80.1860
    },
    {
      owner_id: larryId, status: "active", address: "2800 S University Blvd", city: "Denver", state: "CO", zip: "80210",
      price: 425000, bedrooms: 2, bathrooms: 1, sqft: 1200, lot_size: 3800, year_built: 1955,
      property_type: "single_family",
      description: "Charming DU-area bungalow with tons of character. Hardwood floors, arched doorways, and a sunroom. Walking distance to University of Denver, shops, and restaurants on South Pearl.",
      features: ["Hardwood Floors", "Arched Doorways", "Sunroom", "Near DU", "Walk to Pearl St", "Detached Garage"],
      photos: ["https://images.unsplash.com/photo-1598228723793-52759bba239c?w=1200", "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200", "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200"],
      commission_rate: 3.0, lat: 39.6778, lng: -104.9614
    },
    {
      owner_id: larryId, status: "draft", address: "9999 Placeholder Road", city: "Aspen", state: "CO", zip: "81611",
      price: 4500000, bedrooms: 5, bathrooms: 6, sqft: 5500, lot_size: 20000, year_built: 2024,
      property_type: "single_family",
      description: "Ski-in/ski-out estate with Aspen Mountain views. Under construction - completion expected Summer 2026.",
      features: ["Ski-In/Ski-Out", "Mountain Views", "New Construction", "Wine Room", "Hot Tub", "Elevator"],
      photos: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200", "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200"],
      commission_rate: 2.0, lat: 39.1911, lng: -106.8175
    }
  ];

  const createdIds = [];
  for (const p of properties) {
    const { data, error } = await supabase.from("properties").insert(p).select("id, mls_id, address, status").single();
    if (error) { console.log("ERROR:", p.address, error.message); continue; }
    console.log("Created:", data.mls_id, data.address, "(" + data.status + ")");
    createdIds.push(data);
  }

  // 2. Seed favorites - Larry saves some of Mike's properties
  console.log("\n--- Creating saved listings ---");
  const { data: mikeProps } = await supabase.from("properties").select("id, address").eq("owner_id", mikeId).eq("status", "active").limit(4);
  for (const p of (mikeProps || []).slice(0, 4)) {
    const { error } = await supabase.from("saved_listings").upsert({ user_id: larryId, property_id: p.id }, { onConflict: "user_id,property_id" });
    console.log(error ? "ERROR: " + error.message : "Larry saved: " + p.address);
  }

  // 3. Seed open houses for Larry's properties
  console.log("\n--- Creating open houses ---");
  const activeProps = createdIds.filter(p => p.status === "active");
  const openHouses = [
    { property_id: activeProps[0]?.id, event_date: "2026-04-13", start_time: "10:00", end_time: "13:00", notes: "Family-friendly open house" },
    { property_id: activeProps[1]?.id, event_date: "2026-04-19", start_time: "11:00", end_time: "14:00", notes: "Refreshments and live music" },
    { property_id: activeProps[2]?.id, event_date: "2026-04-20", start_time: "13:00", end_time: "16:00", notes: "Beachside cocktails after tour" },
  ];
  for (const oh of openHouses) {
    if (!oh.property_id) continue;
    const { error } = await supabase.from("open_houses").insert({ ...oh, agent_id: larryId });
    console.log(error ? "ERROR: " + error.message : "Open house: " + oh.event_date + " " + oh.start_time);
  }

  // 4. Seed analytics for Larry's properties
  console.log("\n--- Creating analytics ---");
  let viewCount = 0;
  for (const prop of createdIds) {
    if (prop.status === "draft") continue;
    const numViews = 20 + Math.floor(Math.random() * 80);
    const views = [];
    for (let i = 0; i < numViews; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      views.push({
        property_id: prop.id,
        viewer_id: null,
        source: ["direct", "search", "social", "email"][Math.floor(Math.random() * 4)],
        created_at: date.toISOString(),
      });
    }
    const { error } = await supabase.from("property_views").insert(views);
    console.log(error ? "ERROR: " + error.message : "Added " + numViews + " views for " + prop.address);
    viewCount += numViews;
  }

  // Events
  const eventTypes = ["share", "save", "contact", "showing_request"];
  const events = [];
  for (let i = 0; i < 20; i++) {
    const prop = createdIds[Math.floor(Math.random() * createdIds.length)];
    const daysAgo = Math.floor(Math.random() * 14);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    events.push({
      property_id: prop.id,
      event_type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      created_at: date.toISOString(),
    });
  }
  await supabase.from("property_events").insert(events);
  console.log("Added", events.length, "events");

  // 5. Seed notifications for Larry
  console.log("\n--- Creating notifications ---");
  const now = new Date();
  const notifications = [
    { type: "system", title: "Welcome to OneMLS!", body: "Your account is set up. Start by creating your first listing.", link: "/my-listings/create", read: true, created_at: new Date(now - 6 * 86400000).toISOString() },
    { type: "showing_request", title: "New Showing Request", body: "Mike Colyer requested a showing for 742 Evergreen Terrace on April 15 at 2:00 PM", link: "/showing-service", read: true, created_at: new Date(now - 5 * 86400000).toISOString() },
    { type: "new_save", title: "Listing Saved", body: "Someone saved your listing at 3200 Oceanside Drive", link: "/analytics", read: true, created_at: new Date(now - 4 * 86400000).toISOString() },
    { type: "listing_view_milestone", title: "50 Views!", body: "Your listing at 1600 Pennsylvania Avenue reached 50 views", link: "/analytics", read: false, created_at: new Date(now - 3 * 86400000).toISOString() },
    { type: "new_message", title: "New Message from Mike", body: "Mike Colyer sent you a message about 742 Evergreen Terrace", link: "/messages", read: false, created_at: new Date(now - 2 * 86400000).toISOString() },
    { type: "open_house_reminder", title: "Open House Tomorrow", body: "Reminder: Open house at 742 Evergreen Terrace tomorrow 10:00 AM - 1:00 PM", link: "/open-houses", read: false, created_at: new Date(now - 1 * 86400000).toISOString() },
    { type: "showing_approved", title: "Showing Confirmed", body: "Your showing at 2214 Faraday Avenue has been approved for April 14 at 3:00 PM", link: "/showing-service", read: false, created_at: new Date(now - 0.5 * 86400000).toISOString() },
    { type: "new_lead", title: "New Lead", body: "A buyer is interested in properties in Colorado Springs matching your listings", link: "/purchase-leads", read: false, created_at: new Date(now - 3600000).toISOString() },
    { type: "price_change", title: "Nearby Price Drop", body: "A competing listing near 2800 S University Blvd dropped its price by $15,000", link: "/search?q=Denver", read: false, created_at: new Date().toISOString() },
  ];
  for (const n of notifications) {
    const { error } = await supabase.from("notifications").insert({ ...n, user_id: larryId });
    if (error) console.log("ERROR:", error.message);
  }
  console.log("Added", notifications.length, "notifications");

  // 6. Price history for Larry's properties
  console.log("\n--- Adding price history ---");
  const priceHistories = [
    { address: "742 Evergreen Terrace", history: [{ date: "2025-10-01", price: 420000 }, { date: "2025-12-15", price: 410000 }, { date: "2026-02-01", price: 395000 }] },
    { address: "1600 Pennsylvania Avenue", history: [{ date: "2025-11-01", price: 575000 }, { date: "2026-01-15", price: 550000 }] },
    { address: "3200 Oceanside Drive", history: [{ date: "2025-09-01", price: 1800000 }, { date: "2025-11-01", price: 1750000 }, { date: "2026-01-01", price: 1700000 }, { date: "2026-03-01", price: 1650000 }] },
  ];
  for (const ph of priceHistories) {
    const { data } = await supabase.from("properties").select("id").eq("owner_id", larryId).ilike("address", "%" + ph.address + "%").single();
    if (data) {
      await supabase.from("properties").update({ price_history: ph.history }).eq("id", data.id);
      console.log("Price history for", ph.address);
    }
  }

  console.log("\n=== Done! Larry now has the full experience ===");
  console.log("Login: larry.homestar@gmail.com / OneMLS2026!");
}

seedLarry();
