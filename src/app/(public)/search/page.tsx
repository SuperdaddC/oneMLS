import { Suspense } from "react";
import { searchProperties } from "@/lib/queries";
import SearchClient from "./SearchClient";

/* ---------- state name → code mapping ---------- */
const STATE_NAME_TO_CODE: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
  montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", ohio: "OH",
  oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI", "south carolina": "SC",
  "south dakota": "SD", tennessee: "TN", texas: "TX", utah: "UT", vermont: "VT",
  virginia: "VA", washington: "WA", "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
  "district of columbia": "DC",
};
const VALID_STATE_CODES = new Set(Object.values(STATE_NAME_TO_CODE));

function resolveStateCode(input: string): string | undefined {
  const trimmed = input.trim();
  const upper = trimmed.toUpperCase();
  if (VALID_STATE_CODES.has(upper)) return upper;
  return STATE_NAME_TO_CODE[trimmed.toLowerCase()];
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  const rawQuery = typeof params.q === "string" ? params.q : undefined;
  const rawState = typeof params.state === "string" ? params.state : undefined;

  // If the query itself is a state name/code, use it as a state filter instead
  let queryForSearch = rawQuery;
  let stateFilter = rawState ? resolveStateCode(rawState) : undefined;

  if (rawQuery && !stateFilter) {
    const resolved = resolveStateCode(rawQuery);
    if (resolved) {
      stateFilter = resolved;
      queryForSearch = undefined; // don't also text-search for the state name
    }
  }

  const filters = {
    query: queryForSearch,
    state: stateFilter,
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
