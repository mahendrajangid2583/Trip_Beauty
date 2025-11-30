import axios from 'axios';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary/';
const WIKIPEDIA_SEARCH_URL = 'https://en.wikipedia.org/w/rest.php/v1/search/page';

/**
 * Fetches place details from Wikipedia with robust error handling.
 * Strategy: Search first -> Get correct title -> Fetch summary.
 * @param {string} placeName - Name of the place.
 * @returns {Promise<Object>} - Place details (image, description, url).
 */
export const getPlaceDetails = async (placeName) => {
    if (!placeName) return null;

    try {
        // 1. Search for the correct title
        const searchRes = await axios.get(WIKIPEDIA_SEARCH_URL, {
            params: { q: placeName, limit: 1 }
        });

        let titleToFetch = placeName;
        if (searchRes.data.pages && searchRes.data.pages.length > 0) {
            titleToFetch = searchRes.data.pages[0].key;
        }

        // 2. Fetch Summary using the correct title
        const response = await axios.get(`${WIKIPEDIA_API_URL}${encodeURIComponent(titleToFetch)}`);

        return {
            title: response.data.title,
            description: response.data.extract,
            image: response.data.thumbnail?.source || null,
            pageUrl: response.data.content_urls?.desktop?.page
        };

    } catch (error) {
        // 3. Fallback (Safe Object) - No console error spam
        return {
            title: placeName,
            description: "Explore this amazing destination.",
            image: null, // UI should handle null image with a placeholder
            pageUrl: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(placeName)}`
        };
    }
};

/**
 * Fetches random places (kept for compatibility, though Discover uses curated list now).
 */
export const getRandomPlaces = async (count = 10) => {
    // Implementation kept simple or empty if not used
    return [];
};
