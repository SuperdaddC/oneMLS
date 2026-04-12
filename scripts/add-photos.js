const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://xntomzmazspwsfymhirf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudG9tem1henNwd3NmeW1oaXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTIzOSwiZXhwIjoyMDgxNTcxMjM5fQ.fceN-SdzgKhMevDeOfem82D9lVwQjPRBAOGAamaH92g"
);

// Free-to-use home photos from Unsplash
const photoSets = [
  // 1234 S Monaco - Denver contemporary
  [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  ],
  // 5678 E Dry Creek - Ranch style
  [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200",
  ],
  // 9012 W Hampden - Modern with views
  [
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200",
  ],
  // 2214 Faraday - Coastal luxury
  [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200",
    "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=1200",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200",
  ],
  // 901 Pearl St - Boulder townhouse
  [
    "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=1200",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200",
    "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=1200",
  ],
  // 3456 S Broadway - Condo
  [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200",
    "https://images.unsplash.com/photo-1560448075-cbc16bb4af8e?w=1200",
    "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1200",
  ],
  // 7890 W Colfax - Mid-century bungalow
  [
    "https://images.unsplash.com/photo-1598228723793-52759bba239c?w=1200",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200",
    "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=1200",
  ],
  // 15320 Via Rancho - Saratoga estate
  [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200",
    "https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?w=1200",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=1200",
    "https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1200",
    "https://images.unsplash.com/photo-1600573472591-ee6981cf81d6?w=1200",
  ],
  // 4200 Collins Ave - Miami penthouse
  [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200",
    "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200",
  ],
  // 555 17th St - Denver high-rise
  [
    "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=1200",
    "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?w=1200",
    "https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=1200",
  ],
];

async function addPhotos() {
  const { data: properties, error } = await supabase
    .from("properties")
    .select("id, address, mls_id")
    .order("mls_id", { ascending: true });

  if (error) {
    console.log("Error fetching properties:", error.message);
    return;
  }

  for (let i = 0; i < properties.length && i < photoSets.length; i++) {
    const { error: updateError } = await supabase
      .from("properties")
      .update({ photos: photoSets[i] })
      .eq("id", properties[i].id);

    if (updateError) {
      console.log("ERROR:", properties[i].address, updateError.message);
    } else {
      console.log("Added", photoSets[i].length, "photos to", properties[i].mls_id, properties[i].address);
    }
  }
  console.log("\nDone! All listings now have photos.");
}
addPhotos();
