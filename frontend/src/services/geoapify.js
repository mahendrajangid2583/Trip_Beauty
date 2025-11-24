import api from './api';

// API Key is now handled in the backend
const BASE_URL = '/api/proxy/geoapify/places';

/**
 * Fetches places based on a search term with support for Country/State Bbox and Pagination.
 * @param {string} searchTerm - The city or country name.
 * @param {number} offset - Pagination offset.
 * @param {number} limit - Number of results per page.
 * @param {Object} cachedMeta - (Optional) Previously fetched geocode data { lat, lon, bbox, matchType }.
 * @returns {Promise<{ results: Array, meta: Object }>}
 */
export const getPlacesByCity = async (searchTerm, offset = 0, limit = 20, cachedMeta = null) => {
    try {
        let meta = cachedMeta;

        // Step 1: Geocode (Only if no cached metadata)
        if (!meta) {
            const geocodeRes = await api.get(`/api/proxy/geoapify/geocode`, {
                params: {
                    text: searchTerm
                }
            });

            if (geocodeRes.data.features.length === 0) {
                return { results: [], meta: null };
            }

            const feature = geocodeRes.data.features[0];
            const props = feature.properties;

            meta = {
                lat: props.lat,
                lon: props.lon,
                bbox: feature.bbox, // [minLon, minLat, maxLon, maxLat]
                matchType: props.rank?.match_type || 'city',
                formatted: props.formatted
            };
        }

        // Step 2: Construct Filter
        let filter = '';
        if (meta.bbox && ['country', 'state', 'county', 'region'].includes(meta.matchType)) {
            filter = `rect:${meta.bbox.join(',')}`;
        } else {
            filter = `circle:${meta.lon},${meta.lat},5000`;
        }

        // Step 3: Fetch Places (Fetch MORE than limit to allow for filtering/sorting)
        // We fetch 100 items to ensure we have enough after deduplication and sorting
        const fetchLimit = 100;

        const placesRes = await api.get(BASE_URL, {
            params: {
                categories: 'tourism.sights',
                filter: filter,
                limit: fetchLimit,
                offset: offset, // Note: Offset might skip good results if we sort client-side. Ideally API sorts.
                // Geoapify doesn't strictly support 'sort=importance' in the free tier easily, 
                // so we fetch a batch and sort client-side.
            }
        });

        const rawPlaces = placesRes.data.features.map(feature => ({
            id: feature.properties.place_id,
            name: feature.properties.name || feature.properties.address_line1,
            address: feature.properties.formatted,
            lat: feature.properties.lat,
            lng: feature.properties.lon,
            categories: feature.properties.categories,
            distance: feature.properties.distance,
            importance: feature.properties.rank?.importance || 0, // Capture importance
            details: feature.properties
        }));

        // Step 4: Aggressive Deduplication
        const uniquePlaces = [];
        const seenNames = new Set();

        for (const p of rawPlaces) {
            const name = p.name;
            if (!name) continue;

            const normalized = name.toLowerCase().trim()
                .replace(/^the\s+/, '') // Remove leading "the"
                .replace(/\s+/g, ' '); // Normalize spaces

            // Filter generic names
            const genericNames = ['hotel', 'guest house', 'hostel', 'apartment', 'motel', 'resort'];
            if (genericNames.some(g => normalized.includes(g))) continue;

            if (!seenNames.has(normalized)) {
                seenNames.add(normalized);
                uniquePlaces.push(p);
            }
        }

        // Step 5: Sort by Importance (The "Fame" Fix)
        // Sort descending by importance
        uniquePlaces.sort((a, b) => b.importance - a.importance);

        // Step 6: Slice to requested limit
        const finalResults = uniquePlaces.slice(0, limit);

        return { results: finalResults, meta };

    } catch (error) {
        console.error("Error in getPlacesByCity:", error);
        return { results: [], meta: null };
    }
};

/**
 * Fetches restaurants near a location.
 */
export const getRestaurants = async (lat, lng, radius = 1000) => {
    try {
        const response = await api.get(BASE_URL, {
            params: {
                categories: 'catering.restaurant',
                filter: `circle:${lng},${lat},${radius}`,
                bias: `proximity:${lng},${lat}`,
                limit: 20
            }
        });

        const results = response.data.features.map(feature => ({
            id: feature.properties.place_id,
            name: feature.properties.name || feature.properties.address_line1,
            address: feature.properties.formatted,
            lat: feature.properties.lat,
            lng: feature.properties.lon,
            categories: feature.properties.categories,
            distance: feature.properties.distance,
            details: feature.properties
        }));

        if (results.length === 0 && radius < 50000) {
            return getRestaurants(lat, lng, radius * 2);
        }
        return results;

    } catch (error) {
        console.error("Error fetching restaurants:", error);
        return [];
    }
};

/**
 * Fetches sights near a location (Used by NearbySights).
 */
export const getSights = async (lat, lng, categories, radius = 5000, limit = 20) => {
    try {
        const response = await api.get(BASE_URL, {
            params: {
                categories: categories || 'tourism.sights',
                filter: `circle:${lng},${lat},${radius}`,
                limit
            }
        });
        return response.data.features.map(feature => ({
            id: feature.properties.place_id,
            name: feature.properties.name || feature.properties.address_line1,
            lat: feature.properties.lat,
            lng: feature.properties.lon,
            address: feature.properties.formatted,
            distance: feature.properties.distance // Ensure distance is passed
        }));
    } catch (error) {
        return [];
    }
};
