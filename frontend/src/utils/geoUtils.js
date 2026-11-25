/**
 * Accurate client-side reverse geocoding utility for FoodFind.
 * Resolves GPS coordinates to real localities and neighborhoods (e.g. Gowlidoddy, Madhapur, Hyderabad).
 * Avoids falsely snapping users to distant or neighboring hubs.
 */

export async function reverseGeocode(lat, lng, fallbackHubs = []) {
  if (lat == null || lng == null) return "Unknown Location";

  // 1. Query BigDataCloud Client Reverse Geocode API (accurate neighborhood & city detection)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const locality = (data.locality || data.neighbourhood || '').trim();
      const city = (data.city || data.principalSubdivision || '').trim();

      if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
        return `${locality}, ${city}`;
      }
      if (locality) return locality;
      if (city) return city;
    }
  } catch (e) {
    // Fall through to OpenStreetMap Nominatim
  }

  // 2. Secondary: OpenStreetMap Nominatim Reverse Geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
      { 
        headers: { 'Accept': 'application/json' },
        signal: controller.signal 
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};
      const sub = (addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || '').trim();
      const city = (addr.city || addr.town || addr.village || addr.county || '').trim();

      if (sub && city && sub.toLowerCase() !== city.toLowerCase()) {
        return `${sub}, ${city}`;
      }
      if (sub) return sub;
      if (city) return city;
    }
  } catch (e) {
    // Fall through to fallback hubs
  }

  // 3. Fallback: only if online reverse geocoding failed, find nearest known food hub
  if (Array.isArray(fallbackHubs) && fallbackHubs.length > 0) {
    let closestHub = null;
    let minDistance = Number.MAX_VALUE;

    for (const hub of fallbackHubs) {
      const hLat = hub.latitude || hub.lat;
      const hLng = hub.longitude || hub.lng;
      if (hLat != null && hLng != null) {
        const d = Math.hypot(hLat - lat, hLng - lng);
        if (d < minDistance) {
          minDistance = d;
          closestHub = hub;
        }
      }
    }

    if (closestHub && minDistance < 0.22) {
      return closestHub.name;
    }
  }

  // 4. Ultimate clean fallback
  return `Live GPS (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
}
