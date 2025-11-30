import apiInstance from '../services/api';

// API Key is now handled in the backend

export const api = {
    searchPlaces: async (query) => {
        if (!query) return [];

        try {
            const response = await apiInstance.get(`/api/proxy/geoapify/autocomplete`, {
                params: {
                    text: query,
                    limit: 5
                }
            });

            if (response.data && response.data.features) {
                return response.data.features.map(feature => ({
                    id: feature.properties.place_id || crypto.randomUUID(),
                    name: feature.properties.formatted,
                    lat: feature.properties.lat,
                    lng: feature.properties.lon,
                    status: 'pending'
                }));
            }
            return [];
        } catch (error) {
            console.error("Geoapify search error:", error);
            return [];
        }
    },

    getRoute: async (start, end, mode = 'drive') => {
        if (!start || !end) return null;

        // Map UI modes to Geoapify modes
        const modeMap = {
            'drive': 'drive',
            'walk': 'walk',
            'bike': 'bicycle',
            'transit': 'transit'
        };
        const apiMode = modeMap[mode] || 'drive';

        try {
            const waypoints = `${start.lat},${start.lng}|${end.lat},${end.lng}`;
            const response = await apiInstance.get(`/api/proxy/geoapify/routing`, {
                params: {
                    waypoints: waypoints,
                    mode: apiMode,
                    units: 'metric'
                }
            });

            if (response.data && response.data.features && response.data.features.length > 0) {
                const feature = response.data.features[0];
                return {
                    coordinates: feature.geometry.coordinates[0], // GeoJSON is [lon, lat], MapLibre needs [lon, lat]
                    distance: feature.properties.distance, // meters
                    time: feature.properties.time // seconds
                };
            }
            return null;
        } catch (error) {
            console.error("Geoapify routing error:", error);
            return null;
        }
    },

    getReviews: async () => {
        try {
            const response = await apiInstance.get('/api/reviews?sort=rating_desc');
            if (Array.isArray(response.data)) {
                return response.data;
            } else if (response.data && Array.isArray(response.data.reviews)) {
                return response.data.reviews;
            } else if (response.data && Array.isArray(response.data.data)) {
                return response.data.data;
            }
            return [];
        } catch (error) {
            console.error("Error fetching reviews:", error);
            return [];
        }
    },

    submitReview: async (reviewData) => {
        try {
            const response = await apiInstance.post('/api/reviews', reviewData);
            return response.data;
        } catch (error) {
            console.error("Error submitting review:", error);
            throw error;
        }
    }
};
