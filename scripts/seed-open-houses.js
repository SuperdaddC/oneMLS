const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://xntomzmazspwsfymhirf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudG9tem1henNwd3NmeW1oaXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTIzOSwiZXhwIjoyMDgxNTcxMjM5fQ.fceN-SdzgKhMevDeOfem82D9lVwQjPRBAOGAamaH92g"
);

const mikeId = "251a476f-a9ec-4a9b-828a-59a70403c3c7";

const openHouses = [
  { address: "2214 Faraday Avenue", date: "2026-04-12", start: "13:00", end: "16:00", notes: "Refreshments provided" },
  { address: "901 Pearl Street", date: "2026-04-13", start: "10:00", end: "13:00", notes: "Flatirons views from rooftop" },
  { address: "15320 Via Rancho", date: "2026-04-12", start: "11:00", end: "14:00", notes: "Private estate tour" },
  { address: "4200 Collins Avenue #1802", date: "2026-04-19", start: "14:00", end: "17:00", notes: "Penthouse access via lobby" },
  { address: "1234 S Monaco Parkway", date: "2026-04-20", start: "12:00", end: "15:00", notes: null },
];

async function seed() {
  console.log("Seeding open houses...");

  for (const oh of openHouses) {
    // Look up property by address
    const { data: props, error: lookupErr } = await supabase
      .from("properties")
      .select("id, address")
      .ilike("address", `%${oh.address}%`)
      .limit(1);

    if (lookupErr) {
      console.error(`Error looking up "${oh.address}":`, lookupErr.message);
      continue;
    }

    if (!props || props.length === 0) {
      console.warn(`Property not found for address: "${oh.address}" - skipping`);
      continue;
    }

    const propertyId = props[0].id;
    console.log(`Found property "${props[0].address}" (${propertyId})`);

    const { error } = await supabase.from("open_houses").insert({
      property_id: propertyId,
      agent_id: mikeId,
      event_date: oh.date,
      start_time: oh.start,
      end_time: oh.end,
      notes: oh.notes,
      status: "scheduled",
    });

    if (error) {
      console.error(`Error inserting open house for "${oh.address}":`, error.message);
    } else {
      console.log(`Created open house: ${oh.address} on ${oh.date} ${oh.start}-${oh.end}`);
    }
  }

  console.log("Done seeding open houses.");
}

seed();
