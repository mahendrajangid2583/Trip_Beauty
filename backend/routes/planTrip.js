// routes/planTrip.js
import express from "express";
import axios from "axios";
import TripPlan from "../models/TripPlan.js";
import { getTimeDistanceMatrix, orderPlacesByMatrix, VISIT_DURATION_MIN } from "../utils/scheduler.js";

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

router.post("/plan-trip", async (req, res) => {
  try {
    const { city, places } = req.body;
    if (!places || !Array.isArray(places) || places.length === 0) {
      return res.status(400).json({ error: "places array required" });
    }

    // Keep original indices to map back to matrix
    const placesWithIndex = places.map((p, idx) => ({ ...p, _origIndex: idx }));

    // 1) Get real time-distance matrix from Geoapify
    const matrixData = await getTimeDistanceMatrix(placesWithIndex);
    // matrixData.sources_to_targets available

    // 2) Determine an optimized visiting order using matrix travel times
    // orderPlacesByMatrix expects matrixData and original places order
    const orderedByMatrix = orderPlacesByMatrix(matrixData, placesWithIndex);

    // orderedByMatrix keeps objects with _origIndex too

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
      const visitMin = VISIT_DURATION_MIN[p.category] || VISIT_DURATION_MIN.default;

      // travel minutes from last place
      let travelMin = 0;
      if (lastOrigIndex !== null) {
        const val = getTravelMinutes(matrixData, lastOrigIndex, p._origIndex);
        // fallback (rare) to haversine rough guess if API didn't return times
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

    // 4) Save to MongoDB
    const tripDoc = new TripPlan({
      city: city || "",
      totalDays: days.length,
      days,
      createdAt: new Date()
    });
    await tripDoc.save();

    // 5) Return JSON with itinerary and trip id
    return res.json({
      success: true,
      tripId: tripDoc._id,
      city,
      totalDays: days.length,
      days
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
