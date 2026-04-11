/**
 * Seed virtual_tour_url for sample properties.
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-virtual-tours.js
 *
 * If env vars are not set, falls back to .env.local values (requires dotenv).
 */

const { createClient } = require("@supabase/supabase-js");

// Try loading .env.local for local dev
try {
  require("dotenv").config({ path: ".env.local" });
} catch {
  // dotenv not installed — env vars must be set manually
}

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Set env vars or install dotenv."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const tours = [
  {
    address: "2214 Faraday Avenue",
    virtual_tour_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    address: "15320 Via Rancho",
    virtual_tour_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    address: "4200 Collins Avenue #1802",
    virtual_tour_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

async function main() {
  for (const { address, virtual_tour_url } of tours) {
    const { data, error } = await supabase
      .from("properties")
      .update({ virtual_tour_url })
      .ilike("address", `%${address}%`)
      .select("id, address");

    if (error) {
      console.error(`Error updating "${address}":`, error.message);
    } else if (!data || data.length === 0) {
      console.warn(`No property found matching "${address}"`);
    } else {
      console.log(
        `Updated "${data[0].address}" (${data[0].id}) with virtual tour URL`
      );
    }
  }

  console.log("\nDone seeding virtual tours.");
}

main();
