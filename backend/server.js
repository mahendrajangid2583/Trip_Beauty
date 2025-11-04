import express from "express";
//import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.js";
import cityRoutes from "./routes/cityRoutes.js";
import planTripRoutes from "./routes/planTrip.js";


dotenv.config();
connectDB();
const app = express();

// Middlewares
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/cities", cityRoutes);
app.use("/api", planTripRoutes);

// Sample Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/auth",authRoutes);

app.use(errorHandler);
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
