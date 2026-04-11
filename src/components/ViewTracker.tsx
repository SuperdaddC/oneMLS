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
  }, [propertyId, source]);
  return null;
}
