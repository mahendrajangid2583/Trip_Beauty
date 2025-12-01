// routes/planTrip.js
import express from "express";
import axios from "axios";
import Trip from "../models/Trip.js";
import passport from "passport";
import { getTimeDistanceMatrix, orderPlacesByMatrix, VISIT_DURATION_MIN } from "../utils/scheduler.js";
import { getPlaceDuration } from '../utils/gemini.js';

const router = express.Router();

function normalizeCategory(category) {
  if (Array.isArray(category)) return category.join(',');
  if (typeof category === 'string') return category;
  return '';
}

function minutesToHHMM(mins) {
  const hh = Math.floor(mins / 60) % 24;
  const mm = mins % 60;
  return `${String(hh).padStart(2,"0")}:${String(mm).padStart(2,"0")}`;
}

const MAX_DAY_MINUTES = 12 * 60;
const DAY_START_MIN = 9 * 60;
const LUNCH_HOUR = 13;
const DINNER_HOUR = 19;
const LUNCH_MIN = 60;
const DINNER_MIN = 60;
const SHORT_BREAK_MIN = 15;

// Helper to get matrix travel minutes between two original indices
function getTravelMinutes(matrixData, fromOrigIndex, toOrigIndex) {
  // matrixData.sources_to_targets[from][to].time is seconds
  try {
    const entry = matrixData.sources_to_targets[fromOrigIndex][toOrigIndex];
    if (!entry || typeof entry.time !== "number") return null;
    return Math.round(entry.time / 60); // minutes
  } catch (e) {
    return null;
  }
}

// Optional auth: try to authenticate, but don't fail if no token (so we can still generate plans for guests if needed, 
// though for "My Trips" we need them logged in. The prompt implies saving it, so we should probably enforce it or handle it).
// Let's use 'authenticate' but with { session: false }. If it fails, req.user will be undefined.
// Actually, passport.authenticate('jwt') usually sends 401 if it fails.
// We can use a custom middleware to make it optional, or just enforce it.
// Given the requirement "save this itinerary into mongoDb... fetch by clicking on my trips", 
// it strongly implies a logged-in user. Let's make it optional for now to not break guest usage, 
// but if they want to save, they should be logged in.

const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (user) req.user = user;
    next();
  })(req, res, next);
};

router.post("/", optionalAuth, async (req, res) => {
  console.log("Received plan-trip request");
  try {
    const { city, places } = req.body;
    console.log(`City: ${city}, Places count: ${places?.length}`);
    
    if (!places || !Array.isArray(places) || places.length === 0) {
      console.error("Invalid places array");
      return res.status(400).json({ error: "places array required" });
    }



// ... (existing imports)

    // Keep original indices to map back to matrix
    const placesWithIndex = places.map((p, idx) => ({ ...p, _origIndex: idx }));

    // 0) Fetch dynamic visit durations from Gemini with concurrency limit
    console.log("Fetching AI duration estimates...");
    
    // Simple batch processor to avoid 429 errors
    const BATCH_SIZE = 2;
    const durations = [];
    for (let i = 0; i < placesWithIndex.length; i += BATCH_SIZE) {
        const batch = placesWithIndex.slice(i, i + BATCH_SIZE);
        const batchPromises = batch.map(p => getPlaceDuration(p.name, city));
        const batchResults = await Promise.all(batchPromises);
        durations.push(...batchResults);
        // Delay between batches if not the last batch
        if (i + BATCH_SIZE < placesWithIndex.length) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    
    // Attach durations to places
    placesWithIndex.forEach((p, idx) => {
        p.aiDuration = durations[idx];
    });
    console.log("AI durations received.");

    // 1) Get real time-distance matrix from Geoapify
    let matrixData = null;
    try {
      console.log("Fetching matrix from Geoapify...");
      matrixData = await getTimeDistanceMatrix(placesWithIndex);
      console.log("Matrix data received:", matrixData ? "Yes" : "No");
    } catch (e) {
      console.warn("Matrix fetch failed (using fallback):", e.message);
      // matrixData remains null
    }

    // 2) Determine an optimized visiting order using matrix travel times
    // orderPlacesByMatrix expects matrixData and original places order
    let orderedByMatrix = placesWithIndex;
    if (matrixData) {
      console.log("Ordering places...");
      orderedByMatrix = orderPlacesByMatrix(matrixData, placesWithIndex);
      console.log("Places ordered.");
    } else {
      console.log("Using original order (fallback).");
    }
    // 3) Build day-wise itinerary using matrix travel times & visit estimates
    const days = [];
    let dayNumber = 1;
    let dayItems = [];
    let dayTotalMin = 0;
    let clockMin = DAY_START_MIN;
    let lastOrigIndex = null; // original index in matrix

    // Track meal flags per day
    const hadLunch = () => dayItems.some(i => i.type === "break" && i.name === "Lunch");
    const hadDinner = () => dayItems.some(i => i.type === "break" && i.name === "Dinner");

    const pushDay = () => {
      days.push({ dayNumber, items: dayItems, totalMinutes: dayTotalMin });
      dayNumber++;
      dayItems = [];
      dayTotalMin = 0;
      clockMin = DAY_START_MIN;
      lastOrigIndex = null;
    };

    for (let i = 0; i < orderedByMatrix.length; i++) {
      const p = orderedByMatrix[i];
      // Use AI duration if available, otherwise fallback to category default
      const visitMin = p.aiDuration || VISIT_DURATION_MIN[p.category] || VISIT_DURATION_MIN.default;

      // travel minutes from last place
      let travelMin = 0;
      if (lastOrigIndex !== null) {
        let val = null;
        if (matrixData) {
          val = getTravelMinutes(matrixData, lastOrigIndex, p._origIndex);
        }
        // fallback (rare) to haversine rough guess if API didn't return times
        // Assume 30km/h avg speed for haversine distance
        travelMin = typeof val === "number" ? val :  Math.round((calcHaversineKm(orderedByMatrix[i-1].lat, orderedByMatrix[i-1].lon, p.lat, p.lon) / 30) * 60);
      }

      // If travel needed, consider adding travel item
      if (travelMin > 0) {
        // if adding travel would exceed day, start new day
        if (dayTotalMin + travelMin > MAX_DAY_MINUTES) {
          pushDay();
        }
        const start = clockMin;
        const end = clockMin + travelMin;
        dayItems.push({
          type: "travel",
          name: `Travel to ${p.name}`,
          durationMin: travelMin,
          startTime: minutesToHHMM(start),
          endTime: minutesToHHMM(end),
          details: { fromIndex: lastOrigIndex, toIndex: p._origIndex }
        });
        clockMin = end;
        dayTotalMin += travelMin;
      }

      // Meal break insertion logic: if it's around lunch/dinner and not had yet, insert break
      const hourNow = Math.floor(clockMin / 60);
      if (!hadLunch() && hourNow >= LUNCH_HOUR && hourNow < LUNCH_HOUR + 2) {
        if (dayTotalMin + LUNCH_MIN + visitMin > MAX_DAY_MINUTES) {
          pushDay();
        }
        dayItems.push({
          type: "break",
          name: "Lunch",
          durationMin: LUNCH_MIN,
          startTime: minutesToHHMM(clockMin),
          endTime: minutesToHHMM(clockMin + LUNCH_MIN)
        });
        clockMin += LUNCH_MIN;
        dayTotalMin += LUNCH_MIN;
      } else if (!hadDinner() && hourNow >= DINNER_HOUR && hourNow < DINNER_HOUR + 3) {
        if (dayTotalMin + DINNER_MIN + visitMin > MAX_DAY_MINUTES) {
          pushDay();
        }
        dayItems.push({
          type: "break",
          name: "Dinner",
          durationMin: DINNER_MIN,
          startTime: minutesToHHMM(clockMin),
          endTime: minutesToHHMM(clockMin + DINNER_MIN)
        });
        clockMin += DINNER_MIN;
        dayTotalMin += DINNER_MIN;
      } else {
        // optionally add short rest if > 3 hours active
        const lastActive = dayItems.reduce((acc, it) => acc + (it.durationMin||0), 0);
        if (lastActive >= 180 && Math.random() < 0.25) {
          if (dayTotalMin + SHORT_BREAK_MIN + visitMin > MAX_DAY_MINUTES) {
            pushDay();
          }
          dayItems.push({
            type: "break",
            name: "Short break",
            durationMin: SHORT_BREAK_MIN,
            startTime: minutesToHHMM(clockMin),
            endTime: minutesToHHMM(clockMin + SHORT_BREAK_MIN)
          });
          clockMin += SHORT_BREAK_MIN;
          dayTotalMin += SHORT_BREAK_MIN;
        }
      }

      // Now check if adding visit will overflow the day
      if (dayTotalMin + visitMin > MAX_DAY_MINUTES) {
        pushDay();
      }

      // Add visit item
      const vStart = clockMin;
      const vEnd = clockMin + visitMin;
      dayItems.push({
        type: "visit",
        id: p.id,
        name: p.name,
        address: p.address,
        lat: p.lat,
        lon: p.lon,
        thumbnail: p.thumbnail,
        description: p.description,
        category: normalizeCategory(p.category),
        durationMin: visitMin,
        startTime: minutesToHHMM(vStart),
        endTime: minutesToHHMM(vEnd)
      });
      clockMin = vEnd;
      dayTotalMin += visitMin;
      lastOrigIndex = p._origIndex;
    }

    // push last day
    if (dayItems.length) pushDay();

    // 4) Save to MongoDB (Trip Model)
    console.log("Saving trip to DB...");
    
    // Check for user in request (assuming auth middleware populates req.user)
    // If no user, we can still return the JSON but maybe not save it, or save as anonymous?
    // For "My Trips" to work, we need a user.
    // We'll assume the frontend sends the token and the route is protected or we check here.
    
    let tripId = null;
    
    // NOTE: In a real app, you'd want to ensure req.user exists. 
    // If you are calling this from a public route, you might need to handle anonymous trips differently.
    // For now, we'll try to save if req.user exists, otherwise just return JSON.
    
    // However, the prompt implies we WANT to save it. 
    // So let's assume we will pass the token from frontend.
    
    // Extract unique places from itinerary for flat list view
    const uniquePlaces = new Map();
    days.forEach(day => {
        day.items.forEach(item => {
            if (item.type === 'visit' && !uniquePlaces.has(item.id)) {
                uniquePlaces.set(item.id, {
                    name: item.name,
                    externalId: item.id,
                    lat: item.lat,
                    lng: item.lon, // Note: Schema uses 'lng', itinerary uses 'lon'
                    estimatedTime: item.durationMin,
                    status: 'pending',
                    image: item.thumbnail,
                    description: item.description,
                    // source: 'generated' 
                });
            }
        });
    });

    if (req.user) {
        const newTrip = new Trip({
            user: req.user._id,
            owner: req.user._id,
            name: `Trip to ${city}`,
            city: city, // We might need to add 'city' to Trip schema if not there, or just rely on name
            status: 'upcoming',
            itinerary: days,
            places: Array.from(uniquePlaces.values()) // Populate places from uniquePlaces
        });
        
        await newTrip.save();
        tripId = newTrip._id;
        console.log("Trip saved to User account:", tripId);
    } else {
        console.log("No user found in request, returning ephemeral trip plan.");
        // We could still save it to TripPlan for anonymous users if we wanted, 
        // but the goal is "My Trips", so we really want a user.
        // For now, let's just return the plan.
    }

    // 5) Return JSON with itinerary and trip id
    return res.json({
      success: true,
      tripId: tripId, // This might be null if not logged in
      city,
      totalDays: days.length,
      days,
      places: Array.from(uniquePlaces.values()), // Return places for immediate frontend use
      trip: tripId ? await Trip.findById(tripId) : null // Return full trip object if saved
    });

  } catch (err) {
    console.error("plan-trip error:", err?.response?.data || err.message || err);
    return res.status(500).json({ success: false, error: err.message || "Server error" });
  }
});

export default router;


// small helper: Haversine fallback (used if matrix data missing)
function calcHaversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
