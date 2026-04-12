const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://xntomzmazspwsfymhirf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudG9tem1henNwd3NmeW1oaXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTIzOSwiZXhwIjoyMDgxNTcxMjM5fQ.fceN-SdzgKhMevDeOfem82D9lVwQjPRBAOGAamaH92g"
);

const mikeId = "251a476f-a9ec-4a9b-828a-59a70403c3c7";

const sources = ["direct", "search", "social", "email", "zillow", "realtor"];
const eventTypes = ["save", "share", "contact", "showing_request"];

// Generate fake viewer IDs for uniqueness
function fakeViewerId(i) {
  const hex = (i * 7919 + 1234567).toString(16).padStart(8, "0");
  return `00000000-0000-0000-0000-${hex.slice(0, 12)}`;
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate a date within the last N days with a specific hour bias
function randomDate(daysBack, hourBias) {
  const now = new Date();
  const offset = Math.floor(Math.random() * daysBack);
  const d = new Date(now);
  d.setDate(d.getDate() - offset);

  let hour;
  if (hourBias !== undefined) {
    // Cluster around the biased hour +/- 2
    hour = hourBias + Math.floor(Math.random() * 5) - 2;
    if (hour < 0) hour += 24;
    if (hour > 23) hour -= 24;
  } else {
    // Weight towards business hours and evenings
    const r = Math.random();
    if (r < 0.15) hour = Math.floor(Math.random() * 6); // 0-5 (night)
    else if (r < 0.4) hour = 6 + Math.floor(Math.random() * 6); // 6-11 (morning)
    else if (r < 0.7) hour = 12 + Math.floor(Math.random() * 5); // 12-16 (afternoon)
    else hour = 17 + Math.floor(Math.random() * 4); // 17-20 (evening)
  }

  const minute = Math.floor(Math.random() * 60);
  const second = Math.floor(Math.random() * 60);
  d.setHours(hour, minute, second, 0);
  return d.toISOString();
}

async function seed() {
  console.log("Fetching Mike's properties...");
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, city, state, price")
    .eq("owner_id", mikeId);

  if (error || !properties || properties.length === 0) {
    console.error("No properties found:", error);
    return;
  }

  console.log(`Found ${properties.length} properties. Generating 250+ views and events...`);

  const views = [];
  const events = [];
  let viewerIdx = 0;

  // Distribute views unevenly across properties for interesting data
  for (const prop of properties) {
    // Some properties get more views than others
    const viewCount = 15 + Math.floor(Math.random() * 40);

    for (let i = 0; i < viewCount; i++) {
      viewerIdx++;
      views.push({
        property_id: prop.id,
        viewer_id: fakeViewerId(viewerIdx),
        source: randomFrom(sources),
        created_at: randomDate(30),
      });
    }

    // Generate events: saves, contacts, showing_requests
    const saveCount = Math.floor(Math.random() * 8) + 2;
    const contactCount = Math.floor(Math.random() * 5);
    const showingCount = Math.floor(Math.random() * 3);

    for (let i = 0; i < saveCount; i++) {
      events.push({
        property_id: prop.id,
        event_type: "save",
        user_id: fakeViewerId(viewerIdx + i + 100),
        metadata: {},
        created_at: randomDate(30),
      });
    }

    for (let i = 0; i < contactCount; i++) {
      events.push({
        property_id: prop.id,
        event_type: "contact",
        user_id: fakeViewerId(viewerIdx + i + 200),
        metadata: {},
        created_at: randomDate(21),
      });
    }

    for (let i = 0; i < showingCount; i++) {
      events.push({
        property_id: prop.id,
        event_type: "showing_request",
        user_id: fakeViewerId(viewerIdx + i + 300),
        metadata: {},
        created_at: randomDate(14),
      });
    }
  }

  console.log(`Inserting ${views.length} views...`);
  // Insert in batches of 50
  for (let i = 0; i < views.length; i += 50) {
    const batch = views.slice(i, i + 50);
    const { error: vErr } = await supabase.from("property_views").insert(batch);
    if (vErr) {
      console.error(`Views batch ${i} error:`, vErr.message);
    }
  }

  console.log(`Inserting ${events.length} events...`);
  for (let i = 0; i < events.length; i += 50) {
    const batch = events.slice(i, i + 50);
    const { error: eErr } = await supabase.from("property_events").insert(batch);
    if (eErr) {
      console.error(`Events batch ${i} error:`, eErr.message);
    }
  }

  console.log("Done! Market data seeded successfully.");
  console.log(`  Views: ${views.length}`);
  console.log(`  Events: ${events.length}`);
}

seed().catch(console.error);
