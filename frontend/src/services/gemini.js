import api from './api';

export const askBot = async (userMessage) => {
    try {
        // Call Backend Proxy
        const response = await api.post('/api/proxy/gemini/chat', {
            userMessage
        });

        // Gemini Response Structure: response.data.candidates[0].content.parts[0].text
        const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
        return botReply || "I'm having trouble thinking right now. Try again!";

    } catch (error) {
        console.error("❌ Gemini API Error:", error);
        return "Sorry, I can't connect to the server right now.";
    }
};