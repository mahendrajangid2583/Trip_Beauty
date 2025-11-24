import api from './api';

export const estimateDuration = async (placeName, city) => {
    try {
        console.log(`🧠 AI Estimating time for: ${placeName}, ${city}...`);

        // Call Backend Proxy
        const response = await api.post('/api/proxy/gemini/estimate', {
            placeName,
            city
        });

        // Backend returns: { estimatedTime: "90" }
        return response.data.estimatedTime;

    } catch (error) {
        console.error("❌ Gemini API Failed:", error);
        return "60"; // Default fallback
    }
};