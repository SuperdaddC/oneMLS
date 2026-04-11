"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";

interface FavoriteButtonProps {
  propertyId: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
};

export default function FavoriteButton({ propertyId, size = "md" }: FavoriteButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
        supabase
          .from("saved_listings")
          .select("id")
          .eq("user_id", data.user.id)
          .eq("property_id", propertyId)
          .single()
          .then(({ data: saved }) => {
            if (saved) setIsSaved(true);
          });
      }
    });
  }, [propertyId]);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (!userId) return;

      const supabase = createClient();

      if (isSaved) {
        await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", userId)
          .eq("property_id", propertyId);
        setIsSaved(false);
      } else {
        await supabase
          .from("saved_listings")
          .insert({ user_id: userId, property_id: propertyId });
        setIsSaved(true);
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    },
    [userId, isSaved, propertyId]
  );

  const iconSize = sizeMap[size];

  return (
    <button
      onClick={handleToggle}
      aria-label={isSaved ? "Unsave listing" : "Save listing"}
      style={{
        background: "none",
        border: "none",
        cursor: userId ? "pointer" : "default",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease",
        transform: isAnimating ? "scale(1.3)" : "scale(1)",
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={isSaved ? "#ef4444" : "none"}
        stroke={isSaved ? "#ef4444" : "#94a3b8"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: "all 0.2s ease",
          filter: isSaved ? "drop-shadow(0 0 4px rgba(239,68,68,0.4))" : "none",
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
