// --- 1. DOTENV MUST BE IMPORTED AND CONFIGURED FIRST ---
import dotenv from "dotenv";
dotenv.config();

// --- 2. ALL OTHER IMPORTS CAN COME AFTER ---
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport";

import connectDB from "./config/database.js";
import passportConfig from "./config/passport.js";
import errorHandler from "./middlewares/errorHandler.js";

import authRoutes from "./routes/auth.js";
import cityRoutes from "./routes/cityRoutes.js";
import planTripRoutes from "./routes/planTrip.js";

// --- Connect to MongoDB (This is fine here, it uses the loaded env vars) ---
connectDB();

const app = express();

// --- Global Logger (for debugging requests) ---
app.use((req, res, next) => {
  console.log(`REQUEST RECEIVED: ${req.method} ${req.originalUrl}`);
  next();
});

// --- Security Middlewares ---
app.use(helmet());

// --- CORS Configuration ---
// Important for allowing frontend (React) to send cookies
const corsOptions = {
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true, // This allows cookies (credentials) to be sent
};
app.use(cors(corsOptions));

// --- Body Parser & Cookie Parser ---
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// --- Rate Limiting (Protect from spam) ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message:
    "Too many requests from this IP, please try again after 15 minutes.",
});
app.use("/api", limiter);

// --- Passport Setup (for Google OAuth & JWT Strategy) ---
app.use(passport.initialize());
passportConfig(passport);

// --- Routes ---
app.use("/api/auth",(res,req,next)=>{console.log("got some request..");next();}, authRoutes);       // Authentication routes
app.use("/api/cities", cityRoutes);     // City-related routes
app.use("/api", planTripRoutes);        // Trip planning routes

// --- Root Route ---
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// --- Error Handler (custom middleware) ---
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);