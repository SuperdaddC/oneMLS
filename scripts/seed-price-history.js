/**
 * Seed price_history (jsonb) for sample properties.
 *
 * Usage:
 *   SUPABASE_URL=<url> SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/seed-price-history.js
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

// Each entry: address (partial match), current price, and history entries
// History entries are listed oldest to newest
const priceHistories = [
  {
    address: "2214 Faraday Avenue",
    price_history: [
      { date: "2025-10-01", price: 1350000 },
      { date: "2025-12-15", price: 1299000 },
      { date: "2026-02-01", price: 1250000 },
    ],
  },
  {
    address: "901 Pearl",
    price_history: [
      { date: "2025-11-01", price: 899000 },
      { date: "2026-01-15", price: 875000 },
    ],
  },
  {
    address: "1234 S Monaco",
    price_history: [
      { date: "2025-09-15", price: 475000 },
      { date: "2025-11-01", price: 460000 },
      { date: "2026-01-10", price: 450000 },
    ],
  },
  {
    address: "15320 Via Rancho",
    price_history: [
      { date: "2025-08-01", price: 1650000 },
      { date: "2025-10-15", price: 1595000 },
      { date: "2025-12-01", price: 1549000 },
      { date: "2026-02-15", price: 1499000 },
    ],
  },
  {
    address: "4200 Collins Avenue",
    price_history: [
      { date: "2025-10-01", price: 925000 },
      { date: "2025-12-01", price: 899000 },
      { date: "2026-02-01", price: 875000 },
    ],
  },
  {
    address: "567 Mountain View",
    price_history: [
      { date: "2025-11-15", price: 725000 },
      { date: "2026-01-01", price: 699000 },
    ],
  },
  {
    address: "890 Sunset",
    price_history: [
      { date: "2025-09-01", price: 1100000 },
      { date: "2025-11-15", price: 1050000 },
      { date: "2026-01-15", price: 999000 },
    ],
  },
  {
    address: "321 Ocean",
    price_history: [
      { date: "2025-10-15", price: 2200000 },
      { date: "2026-01-01", price: 2100000 },
      { date: "2026-03-01", price: 1995000 },
    ],
  },
];

async function main() {
  for (const { address, price_history } of priceHistories) {
    const { data, error } = await supabase
      .from("properties")
      .update({ price_history })
      .ilike("address", `%${address}%`)
      .select("id, address");

    if (error) {
      console.error(`Error updating "${address}":`, error.message);
    } else if (!data || data.length === 0) {
      console.warn(`No property found matching "${address}"`);
    } else {
      console.log(
        `Updated "${data[0].address}" (${data[0].id}) with ${price_history.length} price history entries`
      );
    }
  }

  console.log("\nDone seeding price history.");
}

main();
