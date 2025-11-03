import express from "express";
//import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/auth.js";

dotenv.config();
connectDB();
const app = express();

// Middlewares
app.use(express.json({limit:"5mb"}));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Sample Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.use("/api/auth",authRoutes);

app.use(errorHandler);
const PORT=process.env.PORT||5000;
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));