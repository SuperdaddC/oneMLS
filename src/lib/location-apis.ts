// Walk Score API
// Docs: https://www.walkscore.com/professional/api-sample-code.php
// Endpoint: https://api.walkscore.com/score?format=json&address=ADDRESS&lat=LAT&lon=LON&transit=1&bike=1&wsapikey=KEY

export async function getWalkScore(lat: number, lng: number, address: string) {
  const key = process.env.WALKSCORE_API_KEY;
  if (!key) return null;

  try {
    const params = new URLSearchParams({
      format: "json",
      address: encodeURIComponent(address),
      lat: lat.toString(),
      lon: lng.toString(),
      transit: "1",
      bike: "1",
      wsapikey: key,
    });
    const res = await fetch(`https://api.walkscore.com/score?${params}`, {
      next: { revalidate: 86400 },
    }); // cache 24h
    const data = await res.json();
    if (data.status !== 1) return null;
    return {
      walk: data.walkscore ?? 0,
      transit: data.transit?.score ?? 0,
      bike: data.bike?.score ?? 0,
      description: data.description ?? "",
      transitDescription: data.transit?.description ?? "",
      bikeDescription: data.bike?.description ?? "",
    };
  } catch {
    return null;
  }
}

// GreatSchools API
// Docs: https://documenter.getpostman.com/view/13485071/2s93sgXWUY
// Endpoint: https://gs-api.greatschools.org/nearby-schools?lat=LAT&lon=LON&limit=10

export async function getNearbySchools(lat: number, lng: number) {
  const key = process.env.GREATSCHOOLS_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://gs-api.greatschools.org/nearby-schools?lat=${lat}&lon=${lng}&limit=10&distance=5`,
      {
        headers: { "x-api-key": key },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return (
      data.schools?.map((s: Record<string, unknown>) => ({
        name: s.name,
        rating: s.rating,
        distance: s.distance,
        type: s.type || "Public",
        level: s.level || "Elementary", // elementary, middle, high
        enrollment: s.enrollment,
        grades: s.gradeLevels || "",
        url: (s.links as Record<string, string> | undefined)?.website ||
          (s.links as Record<string, string> | undefined)?.profile ||
          null,
      })) || null
    );
  } catch {
    return null;
  }
}

// Census Bureau API (free, no key)
// Docs: https://api.census.gov/data.html
// Get demographics by zip code

export async function getCensusData(zip: string) {
  try {
    // ACS 5-Year Data: median income, median age, total population
    const res = await fetch(
      `https://api.census.gov/data/2022/acs/acs5?get=B19013_001E,B01002_001E,B01003_001E&for=zip%20code%20tabulation%20area:${zip}`,
      { next: { revalidate: 604800 } } // cache 7 days
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.length < 2) return null;
    const [, values] = data;
    return {
      medianIncome: parseInt(values[0]) || null,
      medianAge: parseFloat(values[1]) || null,
      population: parseInt(values[2]) || null,
    };
  } catch {
    return null;
  }
}
