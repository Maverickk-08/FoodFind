/**
 * Accurate client-side reverse geocoding utility for FoodFind.
 * Resolves GPS coordinates to real localities and cities (e.g. Visakhapatnam, Hyderabad).
 * Avoids falsely mapping users to distant cities.
 */

export async function reverseGeocode(lat, lng, fallbackHubs = []) {
  if (lat == null || lng == null) return "Unknown Location";

  // 1. If very close (< 3.5 km ~ 0.035 deg) to a known food hub, return the exact hub name
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

    if (closestHub && minDistance < 0.035) {
      return closestHub.name;
    }
  }

  // 2. Query BigDataCloud Client Reverse Geocode API (free, fast, CORS-enabled, no API key needed)
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
      const locality = (data.locality || '').trim();
      const city = (data.city || data.principalSubdivision || '').trim();

      if (locality && city && locality.toLowerCase() !== city.toLowerCase()) {
        return `${locality}, ${city}`;
      }
      if (city) return city;
      if (locality) return locality;
    }
  } catch (e) {
    // Fall through to secondary reverse geocoding
  }

  // 3. Fallback: OpenStreetMap Nominatim Reverse Geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14`,
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
      if (city) return city;
      if (sub) return sub;
    }
  } catch (e) {
    // Fall through to coordinate string
  }

  // 4. Fallback: check if reasonably close (< 25km ~ 0.22 deg) to any known hub
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
      return `Near ${closestHub.name}`;
    }
  }

  // 5. Ultimate clean fallback: Live GPS coordinates
  return `Live GPS (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
}
