// controllers/placeController.js
import fetch from "node-fetch";
import NodeCache from "node-cache";

// Cache with 24 hour TTL
const cache = new NodeCache({ stdTTL: 86400 });

/**
 * Get places from Geoapify Places API with Wikipedia descriptions and Unsplash images
 * Returns places within a radius (in meters) from the given location with rich data
 * Query params:
 *  - lat (required) - latitude of the city/location
 *  - lon (required) - longitude of the city/location
 *  - radius (optional, default 50000) - radius in meters (50km by default)
 *  - categories (optional) - comma-separated categories, default: "tourism"
 *  - limit (optional, default 10) - max number of places to return
 */
export const getPlaces = async (req, res) => {
  try {
    const { lat, lon, radius = 50000, categories = "tourism", limit = 10 } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({ error: "lat and lon are required query params" });
    }

    const cacheKey = `${lat},${lon},${radius},${categories},${limit}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log("✅ Cache hit:", cacheKey);
      return res.json({ count: cachedData.length, places: cachedData });
    }

    console.log("🔍 Cache miss:", cacheKey);

    // Get API keys - handle spaces in .env file
    let geoKey = process.env.GEOAPIFY_API_KEY;
    if (geoKey) {
      geoKey = geoKey.trim();
    }
    
    if (!geoKey || geoKey === '') {
      console.error("GEOAPIFY_API_KEY is not set in environment variables");
      return res.status(500).json({ error: "Geoapify API key not configured" });
    }

    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY?.trim() || null;
    if (!unsplashKey) {
      console.warn("UNSPLASH_ACCESS_KEY not set - images will be limited to Wikipedia thumbnails");
    }

    // Fetch from Geoapify
    const filter = `circle:${lon},${lat},${radius}`;
    const geoUrl = `https://api.geoapify.com/v2/places?categories=${encodeURIComponent(
      categories
    )}&filter=${encodeURIComponent(filter)}&limit=${encodeURIComponent(limit)}&apiKey=${geoKey}`;

    console.log("Fetching places from Geoapify:", { lat, lon, radius, categories, limit });

    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) {
      const text = await geoRes.text();
      console.error("Geoapify error:", geoRes.status, text);
      return res.status(502).json({ 
        error: "Geoapify returned error", 
        status: geoRes.status,
        details: text 
      });
    }

    const geoData = await geoRes.json();

    // Check if data has features
    if (!geoData || !geoData.features || !Array.isArray(geoData.features)) {
      console.error("Invalid response structure from Geoapify:", geoData);
      return res.json({ count: 0, places: [], warning: "No features found in response" });
    }

    // Fetch additional data for each place (Wikipedia and Unsplash)
    const places = await Promise.all(
      geoData.features.map(async (feature) => {
        const p = feature.properties || {};
        const name = p.name || p.formatted || p.address_line1;

        if (!name) return null;

        // Fetch Wikipedia data
        let wikiData = null;
        try {
          const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(name)}`;
          const wikiRes = await fetch(wikiUrl);
          if (wikiRes.ok) {
            wikiData = await wikiRes.json();
          }
        } catch (err) {
          console.log(`Wikipedia fetch failed for: ${name}`, err.message);
        }

        // Fetch Unsplash images
        let images = [];
        let thumbnail = null;

        if (unsplashKey) {
          try {
            const imgUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(name)}&client_id=${unsplashKey}&per_page=3`;
            const imgRes = await fetch(imgUrl);
            if (imgRes.ok) {
              const imgData = await imgRes.json();
              images = imgData?.results?.map((photo) => photo.urls?.small || photo.urls?.regular) || [];
              thumbnail = imgData?.results?.[0]?.urls?.regular || null;
            }
          } catch (err) {
            console.log(`Unsplash fetch failed for: ${name}`, err.message);
          }
        }

        // Use Wikipedia thumbnail if Unsplash doesn't have one
        if (!thumbnail && wikiData?.thumbnail?.source) {
          thumbnail = wikiData.thumbnail.source;
        }

        return {
          id: p.place_id || p.osm_id || `${p.lat}_${p.lon}` || `place_${Math.random().toString(36).substr(2, 9)}`,
          name: name,
          address: p.formatted || p.address_line1 || p.address_line2 || "",
          description: wikiData?.extract || "No description available",
          thumbnail: thumbnail || null,
          images: images,
          category: p.categories || p.category || null,
          lat: p.lat,
          lon: p.lon,
          dist: p.distance,
        };
      })
    );

    // Filter out null places (those without names)
    const filteredPlaces = places.filter(Boolean);

    console.log(`✅ Mapped ${filteredPlaces.length} places from ${geoData.features.length} features`);

    // Store in cache
    cache.set(cacheKey, filteredPlaces);

    res.json({ count: filteredPlaces.length, places: filteredPlaces });
  } catch (err) {
    console.error("Error in getPlaces:", err);
    res.status(500).json({ error: "Failed to fetch places", details: err.message });
  }
};
