import axios from 'axios';

/**
 * Estimates the visit duration for a place using Google Gemini.
 * @param {string} placeName - Name of the place.
 * @param {string} city - City where the place is located.
 * @returns {Promise<number>} - Estimated duration in minutes.
 */
export const getPlaceDuration = async (placeName, city) => {
    try {
        const prompt = `Estimate the average tourist visit duration for "${placeName}" in "${city}". 
        Rules:
        1. Return ONLY a single integer representing minutes (e.g. 90). 
        2. Do NOT write words like "minutes". Just the number.
        3. If it is a quick stop, return 30. If a big museum, return 120.
        4. minimum time is 90 minutes and for maximum time no limits.`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
            { contents: [{ parts: [{ text: prompt }] }] },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': process.env.GEMINI_KEY_TIME
                }
            }
        );

        // Extract the time from Gemini's response
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const estimatedTime = text ? parseInt(text.trim(), 10) : 60; // Default to 60 if parsing fails
        
        // Ensure reasonable bounds (fallback if AI returns weird number)
        if (isNaN(estimatedTime) || estimatedTime < 15) return 60;
        
        return estimatedTime;

    } catch (error) {
        console.error(`Gemini Estimate Error for ${placeName}:`, error.message);
        return 60; // Fallback default
    }
};
