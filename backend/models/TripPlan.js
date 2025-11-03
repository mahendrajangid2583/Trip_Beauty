// models/TripPlan.js
import mongoose from "mongoose";

const itineraryItemSchema = new mongoose.Schema({
  type: { type: String }, // "visit", "travel", "break"
  name: String,           // for visit or break label
  id: String,             // place id (for visit)
  address: String,
  lat: Number,
  lon: Number,
  thumbnail: String,
  description: String,
  category: String,
  durationMin: Number,    // duration in minutes
  startTime: String,      // "09:00"
  endTime: String,        // "10:30"
  details: mongoose.Schema.Types.Mixed
});

const daySchema = new mongoose.Schema({
  dayNumber: Number,
  items: [itineraryItemSchema],
  totalMinutes: Number
});

const tripPlanSchema = new mongoose.Schema({
  city: String,
  totalDays: Number,
  days: [daySchema],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("TripPlan", tripPlanSchema);
