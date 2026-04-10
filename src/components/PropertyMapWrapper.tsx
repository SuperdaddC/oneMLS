"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/PropertyMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[300px] items-center justify-center rounded-xl border border-[#2a2a3a] bg-[#161620]">
      <div className="text-sm text-[#94a3b8]">Loading map...</div>
    </div>
  ),
});

export default function PropertyMapWrapper({ lat, lng, address }: { lat?: number | null; lng?: number | null; address: string }) {
  return <PropertyMap lat={lat} lng={lng} address={address} />;
}
