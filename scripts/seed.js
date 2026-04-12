const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(
  "https://xntomzmazspwsfymhirf.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhudG9tem1henNwd3NmeW1oaXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTk5NTIzOSwiZXhwIjoyMDgxNTcxMjM5fQ.fceN-SdzgKhMevDeOfem82D9lVwQjPRBAOGAamaH92g"
);

const mikeId = "251a476f-a9ec-4a9b-828a-59a70403c3c7";

const listings = [
  {
    owner_id: mikeId, status: "active", address: "1234 S Monaco Parkway", city: "Denver", state: "CO", zip: "80224",
    price: 450000, bedrooms: 4, bathrooms: 3, sqft: 2400, lot_size: 6500, year_built: 2005,
    property_type: "single_family",
    description: "Stunning contemporary home in the heart of Denver. Features an open floor plan with soaring ceilings, gourmet kitchen with granite countertops and stainless steel appliances. Large backyard perfect for entertaining.",
    features: ["Granite Countertops", "Hardwood Floors", "Stainless Steel Appliances", "Open Floor Plan", "Fenced Yard", "Two-Car Garage"],
    commission_rate: 2.5, lat: 39.6847, lng: -104.9386
  },
  {
    owner_id: mikeId, status: "active", address: "5678 E Dry Creek Road", city: "Centennial", state: "CO", zip: "80112",
    price: 385000, bedrooms: 3, bathrooms: 2, sqft: 1850, lot_size: 5200, year_built: 1998,
    property_type: "single_family",
    description: "Charming ranch-style home in a quiet Centennial neighborhood. Updated kitchen and bathrooms, new roof in 2023. Walking distance to top-rated Cherry Creek schools.",
    features: ["Updated Kitchen", "New Roof", "Covered Patio", "Mature Trees", "Near Schools", "Ranch Style"],
    commission_rate: 3.0, lat: 39.5794, lng: -104.8690
  },
  {
    owner_id: mikeId, status: "active", address: "9012 W Hampden Avenue", city: "Lakewood", state: "CO", zip: "80227",
    price: 520000, bedrooms: 5, bathrooms: 4, sqft: 3100, lot_size: 8500, year_built: 2015,
    property_type: "single_family",
    description: "Spacious modern home with mountain views. Five generous bedrooms including a main-floor master suite. Finished basement with home theater. Smart home features throughout.",
    features: ["Mountain Views", "Master Suite", "Finished Basement", "Home Theater", "Smart Home", "Three-Car Garage"],
    commission_rate: 2.5, lat: 39.6478, lng: -105.0842
  },
  {
    owner_id: mikeId, status: "active", address: "2214 Faraday Avenue", city: "Carlsbad", state: "CA", zip: "92008",
    price: 1250000, bedrooms: 4, bathrooms: 3.5, sqft: 2800, lot_size: 7200, year_built: 2018,
    property_type: "single_family",
    description: "Luxury coastal living at its finest. Steps from Carlsbad Village and the beach. Designer finishes throughout including custom cabinetry, quartz waterfall island, and wide-plank oak floors. Rooftop deck with panoramic ocean views.",
    features: ["Ocean Views", "Rooftop Deck", "Custom Cabinetry", "Quartz Countertops", "Walk to Beach", "Solar Panels"],
    commission_rate: 2.5, lat: 33.1581, lng: -117.3506
  },
  {
    owner_id: mikeId, status: "active", address: "901 Pearl Street", city: "Boulder", state: "CO", zip: "80302",
    price: 875000, bedrooms: 3, bathrooms: 2.5, sqft: 2200, lot_size: 4800, year_built: 2010,
    property_type: "townhouse",
    description: "Prime Pearl Street location in downtown Boulder. Sleek modern townhouse with floor-to-ceiling windows and Flatirons views. Gourmet chef kitchen, private rooftop terrace, and attached two-car garage.",
    features: ["Flatirons Views", "Rooftop Terrace", "Floor-to-Ceiling Windows", "Chef Kitchen", "Walk to Pearl St", "Attached Garage"],
    commission_rate: 2.5, lat: 40.0176, lng: -105.2797
  },
  {
    owner_id: mikeId, status: "pending", address: "3456 S Broadway", city: "Englewood", state: "CO", zip: "80113",
    price: 340000, bedrooms: 2, bathrooms: 2, sqft: 1400, lot_size: 3500, year_built: 1985,
    property_type: "condo",
    description: "Updated condo in vibrant South Broadway corridor. New kitchen with quartz counters and soft-close cabinets. In-unit washer/dryer, private balcony, and one reserved parking space.",
    features: ["Updated Kitchen", "In-Unit Laundry", "Private Balcony", "Pool", "Gym", "Reserved Parking"],
    commission_rate: 3.0, lat: 39.6478, lng: -104.9878
  },
  {
    owner_id: mikeId, status: "active", address: "7890 W Colfax Avenue", city: "Lakewood", state: "CO", zip: "80215",
    price: 299000, bedrooms: 2, bathrooms: 1, sqft: 1100, lot_size: 3000, year_built: 1962,
    property_type: "single_family",
    description: "Classic mid-century bungalow with tons of charm. Original hardwood floors, large picture windows, and a sun-drenched living room. Great starter home or investment property.",
    features: ["Mid-Century Charm", "Hardwood Floors", "Large Windows", "Detached Garage", "Workshop", "Investment Opportunity"],
    commission_rate: 3.0, lat: 39.7405, lng: -105.0906
  },
  {
    owner_id: mikeId, status: "active", address: "15320 Via Rancho", city: "Saratoga", state: "CA", zip: "95070",
    price: 3200000, bedrooms: 6, bathrooms: 5, sqft: 4800, lot_size: 15000, year_built: 2020,
    property_type: "single_family",
    description: "Exceptional estate in prestigious Saratoga. Architecturally stunning with walls of glass overlooking the Santa Cruz Mountains. Resort-style backyard with infinity pool, outdoor kitchen, and fire pit.",
    features: ["Mountain Views", "Infinity Pool", "Outdoor Kitchen", "Wine Cellar", "Home Office", "Four-Car Garage", "Smart Home", "Solar"],
    commission_rate: 2.0, lat: 37.2639, lng: -122.0230
  },
  {
    owner_id: mikeId, status: "active", address: "4200 Collins Avenue #1802", city: "Miami Beach", state: "FL", zip: "33140",
    price: 1850000, bedrooms: 3, bathrooms: 3, sqft: 2100, property_type: "condo", year_built: 2022,
    description: "Breathtaking oceanfront penthouse on Collins Avenue. Unobstructed Atlantic Ocean views from every room. Italian marble floors, Miele appliances, and private elevator access.",
    features: ["Ocean Views", "Private Elevator", "Italian Marble", "Miele Appliances", "Concierge", "Spa", "Beach Access", "Infinity Pool"],
    commission_rate: 2.5, lat: 25.8154, lng: -80.1229
  },
  {
    owner_id: mikeId, status: "draft", address: "555 17th Street #4010", city: "Denver", state: "CO", zip: "80202",
    price: 675000, bedrooms: 2, bathrooms: 2, sqft: 1600, property_type: "condo", year_built: 2019,
    description: "Luxury downtown Denver high-rise living. Floor-to-ceiling windows with 40th floor city and mountain views. Chef kitchen with waterfall island.",
    features: ["City Views", "Mountain Views", "Concierge", "Rooftop Pool", "Fitness Center", "Dog Park", "Waterfall Island"],
    commission_rate: 2.5, lat: 39.7478, lng: -104.9955
  }
];

async function seed() {
  for (const listing of listings) {
    const { data, error } = await supabase.from("properties").insert(listing).select("mls_id, address, status").single();
    if (error) console.log("ERROR:", listing.address, error.message);
    else console.log("Created:", data.mls_id, data.address, "(" + data.status + ")");
  }
  console.log("\nDone! 10 sample listings created.");
}
seed();
