import { Suspense } from "react";
import { searchProperties } from "@/lib/queries";
import SearchClient from "./SearchClient";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const filters = {
    query: typeof params.q === "string" ? params.q : undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    beds: params.beds ? Number(params.beds) : undefined,
    baths: params.baths ? Number(params.baths) : undefined,
    propertyType: typeof params.type === "string" ? params.type : undefined,
    sort: typeof params.sort === "string" ? params.sort : "newest",
    page: params.page ? Number(params.page) : 1,
    limit: 24,
  };

  const { properties, total } = await searchProperties(filters);

  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-[#94a3b8]">Loading...</div>
      }
    >
      <SearchClient
        initialProperties={properties}
        initialTotal={total}
        initialFilters={filters}
      />
    </Suspense>
  );
}
