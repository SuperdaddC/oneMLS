"use client";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase";

export default function ViewTracker({ propertyId, source = "direct" }: { propertyId: string; source?: string }) {
  useEffect(() => {
    const supabase = createClient();
    const record = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("property_views").insert({
        property_id: propertyId,
        viewer_id: user?.id || null,
        source,
      });
    };
    record();

    // Save to recently viewed in localStorage
    try {
      const stored = JSON.parse(localStorage.getItem("onemls_recently_viewed") || "[]");
      const entry = { id: propertyId, timestamp: Date.now() };
      const updated = [entry, ...stored.filter((e: { id: string }) => e.id !== propertyId)].slice(0, 10);
      localStorage.setItem("onemls_recently_viewed", JSON.stringify(updated));
    } catch {
      // localStorage may not be available
    }
  }, [propertyId, source]);
  return null;
}
