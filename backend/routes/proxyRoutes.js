import express from 'express';
import axios from 'axios';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// --- Rate Limiting for Proxy ---
const proxyLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per minute
    message: "Too many proxy requests, please try again later."
});

router.use(proxyLimiter);

// --- Helper: Check for API Keys ---
// --- Helper: Check for API Keys ---
// --- Helper: Check for API Keys ---
const checkKeys = (req, res, next) => {
    const missingKeys = [];
    if (!process.env.GEMINI_KEY_BOT) missingKeys.push("GEMINI_KEY_BOT");
    if (!process.env.GEMINI_KEY_TIME) missingKeys.push("GEMINI_KEY_TIME");
    if (!process.env.GEOAPIFY_KEY) missingKeys.push("GEOAPIFY_KEY");
    // ORS_KEY is optional/backup, so we don't strictly warn if missing to avoid noise
    // if (!process.env.ORS_KEY) missingKeys.push("ORS_KEY");

    if (missingKeys.length > 0) {
        console.warn(`⚠️ MISSING API KEYS: ${missingKeys.join(", ")}. Some features may not work.`);
    }
    next();
};

router.use(checkKeys);

// --- 1. Google Gemini Chat Proxy ---
router.post('/gemini/chat', async (req, res) => {
    try {
        const { userMessage } = req.body;

        const SYSTEM_INSTRUCTION = `
You are **QuesterGuide**, the ultimate travel companion for the Quester App! 
Your Goal: Turn every user into a power-user.

**YOUR PERSONALITY:**
- **Tone:** Enthusiastic, adventurous, helpful. 
- **Style:**  Keep answers structured and properly formatted.
- **Identity:** You are a digital guide created by the **Quester Team**. You are 100% Free to use.
- **Language: **Same as input language or English if unknown.

---

**🧠 THE KNOWLEDGE BASE (Answers to Common Questions)**

**1. THEME & DESIGN**
- **"Why is it dark?"**: We use a **"Dark Luxury"** design theme to give you a premium, cinematic feel while you plan. It's easy on the eyes at night! 🌙
- **"Is it free?"**: Yes! Quester is a free tool for explorers. No hidden fees. 💸
- The bookmark icon is heart icon.

**2. 📝 PLANNING & EDITING TRIPS (My Trips)**
- **Create:** Go to "My Trips" -> Click the big **Glass "+" Card**.
- **Reorder Stops:** Inside a trip, simply **Drag and Drop** the items in the list to change their order! ↕️
- **Delete a Trip:** Click the **Trash Icon** 🗑️ on the Trip Card. Warning: This is permanent!
- **Delete a Place:** Inside the trip, hover over the place and click the **Trash Icon** 🗑️ on the right.
- **"Pending" Status:** This means our AI is currently calculating the estimated visit time. It usually takes a few seconds! ⏳

**3. 🤝 SHARING (Collaboration)**
- **How to Share:** Open a trip -> Click the **Share Icon** 🔗 -> Copy the link.
- **Join:** If you click a shared link, you become a **Collaborator**. You can edit the trip alongside your friends! 👯

**4. 🔍 SEARCH & DISCOVERY**
- **Global Search:** Type a **City** for local spots, or a **Country** to see top sights across the nation (using Smart Bounding Box). 🗺️
- **Discover Page:** A curated list of world-famous "Bucket List" destinations.
- **Images:** We fetch high-quality photos from Wikipedia to make your planning beautiful. 📸

**5. 🍔 DINING **
- **Smart Radius:** If you are in a remote area, the Dining search automatically **widens the radius** (up to 50km) until it finds food. 🍕
- **Distances:** We calculate real-time distance from your current GPS location. 📍

**6. 🚗 NAVIGATION (3D Mode)**
- **Start:** Click **"Go"** on any place card.
- **3D View:** The map tilts to 60° for a "Cockpit View."
- **Recenter:** Click the "Start Navigation" arrow button to lock the camera to your location.
- **Traffic:** We currently use open-source maps, so live traffic data is not available yet.

**7. 👤 ACCOUNT & PROFILE**
- **Log Out:** Go to your Profile -> Click the **Log Out** button.
- **Edit Profile:** You can update your details in the Profile tab.
- **Bookmarks:** Saved places live in the "Bookmarks" tab. You can add them to any trip later by clicking the **"+"** button on the card.

**8. 🛡️ GUARDRAILS (Refusals)**
- If asked about math, code, politics, or general knowledge: "I only know about adventures and maps! Let's get back to planning! 🧭"
**9. Nearby **
- ** It contains tourist place near current location of user. works same as dinning page works
`;
        const finalPrompt = `${SYSTEM_INSTRUCTION}\n\nUser Question: ${userMessage}`;

        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
            { contents: [{ parts: [{ text: finalPrompt }] }] },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': process.env.GEMINI_KEY_BOT
                }
            }
        );
        res.json(response.data);
    } catch (error) {
        console.error("Gemini Chat Proxy Error:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Gemini API Failed" });
    }
});

// --- 2. Google Gemini Estimate Proxy ---
import { getPlaceDuration } from '../utils/gemini.js';

// ... (existing imports)

// --- 2. Google Gemini Estimate Proxy ---
router.post('/gemini/estimate', async (req, res) => {
    try {
        const { placeName, city } = req.body;
        const estimatedTime = await getPlaceDuration(placeName, city);
        res.json({ estimatedTime });
    } catch (error) {
        console.error("Gemini Estimate Proxy Error:", error.message);
        res.status(500).json({ error: "Gemini API Failed" });
    }
});

// --- 3. Geoapify Places Proxy ---
router.get('/geoapify/places', async (req, res) => {
    try {
        const response = await axios.get('https://api.geoapify.com/v2/places', {
            params: { ...req.query, apiKey: process.env.GEOAPIFY_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Geoapify Places Proxy Error:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Geoapify API Failed" });
    }
});

// --- 4. Geoapify Geocode Proxy ---
router.get('/geoapify/geocode', async (req, res) => {
    try {
        const response = await axios.get('https://api.geoapify.com/v1/geocode/search', {
            params: { ...req.query, apiKey: process.env.GEOAPIFY_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Geoapify Geocode Proxy Error:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Geoapify API Failed" });
    }
});

// --- 4b. Geoapify Autocomplete Proxy ---
router.get('/geoapify/autocomplete', async (req, res) => {
    try {
        const response = await axios.get('https://api.geoapify.com/v1/geocode/autocomplete', {
            params: { ...req.query, apiKey: process.env.GEOAPIFY_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Geoapify Autocomplete Proxy Error:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Geoapify API Failed" });
    }
});

// --- 4c. Geoapify Routing Proxy ---
router.get('/geoapify/routing', async (req, res) => {
    try {
        const response = await axios.get('https://api.geoapify.com/v1/routing', {
            params: { ...req.query, apiKey: process.env.GEOAPIFY_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Geoapify Routing Proxy Error:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "Geoapify API Failed" });
    }
});

// --- 5. OpenRouteService Directions Proxy ---
router.get('/ors/directions', async (req, res) => {
    try {
        const response = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
            params: { ...req.query, api_key: process.env.ORS_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("ORS Directions Proxy Error:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "ORS API Failed" });
    }
});

// --- 6. OpenRouteService Geocode Proxy ---
router.get('/ors/geocode', async (req, res) => {
    try {
        const response = await axios.get('https://api.openrouteservice.org/geocode/search', {
            params: { ...req.query, api_key: process.env.ORS_KEY }
        });
        res.json(response.data);
    } catch (error) {
        console.error("ORS Geocode Proxy Error:", error.message);
        res.status(error.response?.status || 500).json(error.response?.data || { error: "ORS API Failed" });
    }
});

// --- 7. Map Tile Proxy (Stream) ---
router.get('/tiles/:z/:x/:y', async (req, res) => {
    try {
        const { z, x, y } = req.params;
        const tileUrl = `https://maps.geoapify.com/v1/tile/osm-bright/${z}/${x}/${y}.png?apiKey=${process.env.GEOAPIFY_KEY}`;

        const response = await axios({
            url: tileUrl,
            method: 'GET',
            responseType: 'stream'
        });

        res.set('Content-Type', 'image/png');
        response.data.pipe(res);
    } catch (error) {
        console.error("Tile Proxy Error:", error.message);
        res.status(404).send("Tile not found");
    }
});

// --- 8. Map Style Proxy ---
router.get('/tiles/style.json', async (req, res) => {
    try {
        const styleUrl = `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${process.env.GEOAPIFY_KEY}`;
        const response = await axios.get(styleUrl);

        // We need to rewrite the tile source URLs in the style JSON to point to our proxy
        const style = response.data;

        // This is a simplified replacement. 
        // Real vector tile proxying is complex. For now, we proxy the raster tiles or just the style.
        // If using raster tiles in style:
        if (style.sources) {
            Object.keys(style.sources).forEach(sourceKey => {
                const source = style.sources[sourceKey];
                if (source.tiles) {
                    // Replace external tile URLs with our proxy URL
                    // Note: This assumes the structure matches. 
                    // For vector tiles, we'd need a vector tile proxy endpoint too.
                    // For now, let's just return the style and see if MapLibre accepts it.
                    // If we want to fully hide the key, we need to proxy the vector tiles too (pbf).
                }
            });
        }

        res.json(style);
    } catch (error) {
        console.error("Style Proxy Error:", error.message);
        res.status(500).json({ error: "Style fetch failed" });
    }
});

export default router;
