const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://xntomzmazspwsfymhirf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudG9tem1henNwd3NmeW1oaXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTIzOSwiZXhwIjoyMDgxNTcxMjM5fQ.fceN-SdzgKhMevDeOfem82D9lVwQjPRBAOGAamaH92g"
);

const mikeId = "251a476f-a9ec-4a9b-828a-59a70403c3c7";
const larryId = "355502a3-49fe-4ed0-9e12-50d4f814844c";

async function seed() {
  // Get all active properties
  const { data: properties } = await supabase
    .from("properties")
    .select("id, address")
    .eq("status", "active");

  if (!properties || properties.length === 0) {
    console.log("No active properties found");
    return;
  }

  console.log("Found", properties.length, "active properties");

  // Mike saves 5 favorites (the luxury ones)
  const mikeFavorites = properties.filter(p =>
    ["2214 Faraday Avenue", "901 Pearl Street", "15320 Via Rancho", "4200 Collins Avenue #1802", "9012 W Hampden Avenue"].includes(p.address)
  );

  // Larry saves 3 favorites (the affordable CO ones)
  const larryFavorites = properties.filter(p =>
    ["1234 S Monaco Parkway", "5678 E Dry Creek Road", "7890 W Colfax Avenue"].includes(p.address)
  );

  for (const prop of mikeFavorites) {
    const { error } = await supabase.from("saved_listings").upsert(
      { user_id: mikeId, property_id: prop.id },
      { onConflict: "user_id,property_id" }
    );
    console.log(error ? `ERROR: ${prop.address} - ${error.message}` : `Mike saved: ${prop.address}`);
  }

  for (const prop of larryFavorites) {
    const { error } = await supabase.from("saved_listings").upsert(
      { user_id: larryId, property_id: prop.id },
      { onConflict: "user_id,property_id" }
    );
    console.log(error ? `ERROR: ${prop.address} - ${error.message}` : `Larry saved: ${prop.address}`);
  }

  console.log("\nDone! Mike has", mikeFavorites.length, "favorites, Larry has", larryFavorites.length);
}
seed();
