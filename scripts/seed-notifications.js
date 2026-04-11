// Seed script for sample notifications
// Usage: node scripts/seed-notifications.js
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars
// Or set USER_ID env var directly

const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

async function seed() {
  // Find Mike's user or use USER_ID env var
  let userId = process.env.USER_ID;

  if (!userId) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, first_name")
      .ilike("first_name", "%mike%")
      .limit(1);

    if (profiles && profiles.length > 0) {
      userId = profiles[0].id;
      console.log(`Found user: ${profiles[0].first_name} (${profiles[0].email})`);
    } else {
      // Fallback: get first user
      const { data: allProfiles } = await supabase
        .from("profiles")
        .select("id, email, first_name")
        .limit(1);

      if (allProfiles && allProfiles.length > 0) {
        userId = allProfiles[0].id;
        console.log(`Using first user: ${allProfiles[0].first_name} (${allProfiles[0].email})`);
      } else {
        console.error("No users found in profiles table");
        process.exit(1);
      }
    }
  }

  const notifications = [
    {
      type: "showing_request",
      title: "New Showing Request",
      body: "John Smith requested a showing for 2214 Faraday Avenue on April 14 at 2:00 PM",
      link: "/showing-service",
      read: false,
      created_at: minutesAgo(5),
    },
    {
      type: "new_message",
      title: "New Message",
      body: "Sarah Johnson sent you a message about 901 Pearl Street",
      link: "/messages",
      read: false,
      created_at: minutesAgo(22),
    },
    {
      type: "new_save",
      title: "Listing Saved",
      body: "Someone saved your listing at 15320 Via Rancho",
      link: "/analytics",
      read: false,
      created_at: hoursAgo(1),
    },
    {
      type: "listing_view_milestone",
      title: "100 Views!",
      body: "Your listing at 4200 Collins Avenue reached 100 views",
      link: "/analytics",
      read: false,
      created_at: hoursAgo(3),
    },
    {
      type: "open_house_reminder",
      title: "Open House Tomorrow",
      body: "Reminder: Open house at 2214 Faraday Avenue tomorrow 1:00-4:00 PM",
      link: "/open-houses",
      read: false,
      created_at: hoursAgo(6),
    },
    {
      type: "showing_approved",
      title: "Showing Confirmed",
      body: "Your showing at 1234 S Monaco Parkway has been approved for April 15 at 10:00 AM",
      link: "/showing-service",
      read: false,
      created_at: hoursAgo(8),
    },
    {
      type: "price_change",
      title: "Price Alert",
      body: "A property you saved at 901 Pearl Street reduced its price by $25,000",
      link: "/saved",
      read: false,
      created_at: hoursAgo(12),
    },
    {
      type: "new_lead",
      title: "New Lead",
      body: "A buyer is interested in properties in Boulder, CO matching your listings",
      link: "/purchase-leads",
      read: true,
      created_at: daysAgo(1),
    },
    {
      type: "showing_denied",
      title: "Showing Declined",
      body: "The showing request for 7890 W Colfax Avenue on April 12 was declined",
      link: "/showing-service",
      read: true,
      created_at: daysAgo(1.5),
    },
    {
      type: "new_message",
      title: "New Message",
      body: "David Lee asked about commission structure for 4200 Collins Avenue",
      link: "/messages",
      read: true,
      created_at: daysAgo(2),
    },
    {
      type: "system",
      title: "Welcome to OneMLS!",
      body: "Your account is set up. Start by creating your first listing.",
      link: "/my-listings/create",
      read: true,
      created_at: daysAgo(3),
    },
    {
      type: "new_save",
      title: "Listing Saved",
      body: "3 people saved your listing at 1234 S Monaco Parkway this week",
      link: "/analytics",
      read: true,
      created_at: daysAgo(3),
    },
    {
      type: "showing_request",
      title: "New Showing Request",
      body: "Emily Chen requested a showing for 15320 Via Rancho on April 8 at 11:00 AM",
      link: "/showing-service",
      read: true,
      created_at: daysAgo(4),
    },
    {
      type: "listing_view_milestone",
      title: "50 Views!",
      body: "Your listing at 1234 S Monaco Parkway reached 50 views",
      link: "/analytics",
      read: true,
      created_at: daysAgo(5),
    },
    {
      type: "open_house_reminder",
      title: "Open House This Weekend",
      body: "Reminder: Open house at 901 Pearl Street Saturday 10:00 AM - 1:00 PM",
      link: "/open-houses",
      read: true,
      created_at: daysAgo(5),
    },
    {
      type: "price_change",
      title: "Market Update",
      body: "2 properties in your area changed prices today",
      link: "/dashboard",
      read: true,
      created_at: daysAgo(6),
    },
    {
      type: "system",
      title: "Profile Complete",
      body: "Your agent profile is 100% complete. You're ready to list properties!",
      link: "/profile",
      read: true,
      created_at: daysAgo(7),
    },
    {
      type: "new_lead",
      title: "New Lead",
      body: "A first-time buyer in Carlsbad, CA is looking for condos under $600K",
      link: "/purchase-leads",
      read: true,
      created_at: daysAgo(7),
    },
  ];

  const rows = notifications.map((n) => ({
    ...n,
    user_id: userId,
  }));

  const { data, error } = await supabase.from("notifications").insert(rows);

  if (error) {
    console.error("Error inserting notifications:", error.message);
    process.exit(1);
  }

  console.log(`Inserted ${rows.length} notifications for user ${userId}`);
}

seed();
