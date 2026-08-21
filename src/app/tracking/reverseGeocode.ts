// Simple in-memory cache + reverse geocoding via OSM Nominatim.
// Free, no API key needed — be considerate of rate limits (max ~1 req/sec).

interface GeocodeResult {
  displayName: string;
  shortName: string;
}

const cache = new Map<string, GeocodeResult>();

function cacheKey(lat: number, lng: number): string {
  // Round to ~11m precision so nearby pings reuse the same cached lookup
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  const key = cacheKey(lat, lng);
  const cached = cache.get(key);
  if (cached) return cached;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();

    const addr = data.address || {};
    const shortName =
      addr.road ||
      addr.neighbourhood ||
      addr.suburb ||
      addr.village ||
      addr.town ||
      addr.city_district ||
      addr.city ||
      "Unknown area";

    const displayName: string = data.display_name || shortName;

    const result: GeocodeResult = { displayName, shortName };
    cache.set(key, result);
    return result;
  } catch (e) {
    console.warn("Reverse geocode failed:", e);
    return null;
  }
}