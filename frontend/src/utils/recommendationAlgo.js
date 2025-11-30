/**
 * Calculates the distance between two coordinates using the Haversine formula.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @returns {number} Distance in kilometers
 */
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

/**
 * Returns the closest pending place as the recommended next stop.
 * @param {Array} places - Array of place objects { id, status, lat, lng, ... }
 * @param {number} currentLat 
 * @param {number} currentLng 
 * @returns {Object|null} The recommended place or null if no pending places.
 */
export const getNextRecommendation = (places, currentLat, currentLng) => {
    if (!places || places.length === 0) return null;

    const pendingPlaces = places.filter(p => p.status === 'pending');

    if (pendingPlaces.length === 0) return null;

    let closestPlace = null;
    let minDistance = Infinity;

    pendingPlaces.forEach(place => {
        const distance = getDistanceFromLatLonInKm(currentLat, currentLng, place.lat, place.lng);
        if (distance < minDistance) {
            minDistance = distance;
            closestPlace = place;
        }
    });

    return closestPlace;
};
