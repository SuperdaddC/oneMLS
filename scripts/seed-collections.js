const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://xntomzmazspwsfymhirf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudG9tem1henNwd3NmeW1oaXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTIzOSwiZXhwIjoyMDgxNTcxMjM5fQ.fceN-SdzgKhMevDeOfem82D9lVwQjPRBAOGAamaH92g"
);

const mikeId = "251a476f-a9ec-4a9b-828a-59a70403c3c7";

async function seedCollections() {
  console.log("Seeding collections...");

  // Get Denver-area properties for "Colyer Family Home Search"
  const { data: denverProps, error: dErr } = await supabase
    .from("properties")
    .select("id, address, city, state")
    .eq("owner_id", mikeId)
    .eq("state", "CO")
    .limit(3);

  if (dErr) {
    console.error("Error fetching Denver properties:", dErr);
    return;
  }

  // Get Carlsbad + Miami (or any coastal) properties for "Luxury Oceanfront Portfolio"
  const { data: coastalProps, error: cErr } = await supabase
    .from("properties")
    .select("id, address, city, state")
    .eq("owner_id", mikeId)
    .in("state", ["CA", "FL"])
    .limit(2);

  if (cErr) {
    console.error("Error fetching coastal properties:", cErr);
    return;
  }

  // If we don't have enough coastal, fall back to any properties
  let luxuryProps = coastalProps || [];
  if (luxuryProps.length < 2) {
    const { data: fallback } = await supabase
      .from("properties")
      .select("id, address, city, state")
      .eq("owner_id", mikeId)
      .not("state", "eq", "CO")
      .limit(2);
    luxuryProps = fallback || luxuryProps;
  }

  // Create Collection 1: Colyer Family Home Search
  const { data: col1, error: col1Err } = await supabase
    .from("collections")
    .insert({
      agent_id: mikeId,
      name: "Colyer Family Home Search",
      description: "Curated homes for the Colyer family - Denver metro area, 3+ bedrooms, good schools",
      client_name: "Sarah Colyer",
      client_email: "sarah.colyer@example.com",
    })
    .select("id")
    .single();

  if (col1Err) {
    console.error("Error creating collection 1:", col1Err);
    return;
  }
  console.log("Created collection: Colyer Family Home Search", col1.id);

  // Add Denver properties to collection 1
  if (denverProps && denverProps.length > 0) {
    const items1 = denverProps.map((p, i) => ({
      collection_id: col1.id,
      property_id: p.id,
      agent_notes: i === 0 ? "Top pick - great school district" : i === 1 ? "Backup option - needs minor updates" : "Good value, large lot",
      position: i,
    }));

    const { error: items1Err } = await supabase.from("collection_items").insert(items1);
    if (items1Err) {
      console.error("Error adding items to collection 1:", items1Err);
    } else {
      console.log(`Added ${items1.length} properties to Colyer Family collection`);
    }
  }

  // Create Collection 2: Luxury Oceanfront Portfolio
  const { data: col2, error: col2Err } = await supabase
    .from("collections")
    .insert({
      agent_id: mikeId,
      name: "Luxury Oceanfront Portfolio",
      description: "Premium coastal properties - investment grade oceanfront homes",
      client_name: "David Chen",
      client_email: "david.chen@example.com",
    })
    .select("id")
    .single();

  if (col2Err) {
    console.error("Error creating collection 2:", col2Err);
    return;
  }
  console.log("Created collection: Luxury Oceanfront Portfolio", col2.id);

  // Add coastal properties to collection 2
  if (luxuryProps && luxuryProps.length > 0) {
    const items2 = luxuryProps.map((p, i) => ({
      collection_id: col2.id,
      property_id: p.id,
      agent_notes: i === 0 ? "Client's top choice - ocean views" : "Strong rental income potential",
      position: i,
    }));

    const { error: items2Err } = await supabase.from("collection_items").insert(items2);
    if (items2Err) {
      console.error("Error adding items to collection 2:", items2Err);
    } else {
      console.log(`Added ${items2.length} properties to Luxury Oceanfront collection`);
    }
  }

  console.log("Done seeding collections!");
}

seedCollections().catch(console.error);
