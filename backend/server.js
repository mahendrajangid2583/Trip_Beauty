import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cityRoutes from "./routes/cityRoutes.js";
import planTripRoutes from "./routes/planTrip.js";


dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/cities", cityRoutes);
app.use("/api", planTripRoutes);

// Sample Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("✅ Connected to MongoDB");
  app.listen(process.env.PORT || 5000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
  });
})
.catch(err => console.log("❌ DB Connection Error: ", err));
