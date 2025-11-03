import express from "express";
import { searchCities } from "../controllers/cityController.js";
import { getPlaces } from "../controllers/placeController.js";

const router = express.Router();

// GET /api/cities/search?query=del
router.get("/search", searchCities);
// GET /api/cities/places?lat=...&lon=...
router.get("/places", getPlaces);

export default router;
