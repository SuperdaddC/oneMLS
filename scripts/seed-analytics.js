const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://xntomzmazspwsfymhirf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudG9tem1henNwd3NmeW1oaXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTIzOSwiZXhwIjoyMDgxNTcxMjM5fQ.fceN-SdzgKhMevDeOfem82D9lVwQjPRBAOGAamaH92g"
);

const mikeId = "251a476f-a9ec-4a9b-828a-59a70403c3c7";

const sources = ["direct", "search", "social", "email"];
const eventTypes = ["save", "share", "contact", "showing_request"];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysBack) {
  const now = new Date();
  const offset = Math.floor(Math.random() * daysBack);
  const hour = Math.floor(Math.random() * 14) + 8; // 8am-10pm
  const minute = Math.floor(Math.random() * 60);
  const d = new Date(now);
  d.setDate(d.getDate() - offset);
  d.setHours(hour, minute, Math.floor(Math.random() * 60), 0);
  return d.toISOString();
}

async function seed() {
  console.log("Fetching Mike's properties...");
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, price, address")
    .eq("owner_id", mikeId);

  if (error) {
    console.error("Error fetching properties:", error);
    return;
  }

  if (!properties || properties.length === 0) {
    console.log("No properties found for Mike.");
    return;
  }

  console.log(`Found ${properties.length} properties.`);

  // Weight views by price (higher price = more views)
  const maxPrice = Math.max(...properties.map((p) => p.price));
  const totalTarget = 300 + Math.floor(Math.random() * 200); // 300-500 total views
  const weights = properties.map((p) => 0.3 + 0.7 * (p.price / maxPrice)); // min weight 0.3
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const views = [];
  let viewCount = 0;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];
    const propViewCount = Math.round((weights[i] / weightSum) * totalTarget);

    for (let j = 0; j < propViewCount; j++) {
      views.push({
        property_id: prop.id,
        viewer_id: null,
        source: randomFrom(sources),
        created_at: randomDate(30),
      });
      viewCount++;
    }
  }

  // Insert views in batches of 100
  console.log(`Inserting ${viewCount} views...`);
  for (let i = 0; i < views.length; i += 100) {
    const batch = views.slice(i, i + 100);
    const { error: vErr } = await supabase.from("property_views").insert(batch);
    if (vErr) {
      console.error("Error inserting views batch:", vErr);
      return;
    }
  }
  console.log(`Inserted ${viewCount} views.`);

  // Generate events: 25-45 total
  const eventCount = 25 + Math.floor(Math.random() * 20);
  const events = [];

  for (let i = 0; i < eventCount; i++) {
    const prop = randomFrom(properties);
    events.push({
      property_id: prop.id,
      event_type: randomFrom(eventTypes),
      user_id: null,
      metadata: {},
      created_at: randomDate(30),
    });
  }

  console.log(`Inserting ${eventCount} events...`);
  const { error: eErr } = await supabase.from("property_events").insert(events);
  if (eErr) {
    console.error("Error inserting events:", eErr);
    return;
  }

  console.log(`Inserted ${eventCount} events.`);
  console.log("Analytics seed complete!");
}

seed();
