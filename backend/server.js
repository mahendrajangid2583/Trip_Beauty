// --- 1. DOTENV MUST BE IMPORTED AND CONFIGURED FIRST ---
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import passport from "passport";

// --- Config & Middleware Imports ---
import connectDB from "./config/database.js";
import passportConfig from "./config/passport.js";
import errorHandler from "./middlewares/errorHandler.js";

// --- Route Imports ---
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import tripRoutes from "./routes/tripRoutes.js";
import planTripRoutes from "./routes/planTrip.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cityRoutes from "./routes/cityRoutes.js";
import proxyRoutes from "./routes/proxyRoutes.js";

// --- Initialize Socket.io ---
import { initSocket } from "./socket.js";

// --- Configure Dotenv ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, ".env");
console.log("Loading .env from:", envPath);
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env:", result.error);
} else {
  console.log(".env loaded successfully");
  console.log("Loaded Keys:", Object.keys(result.parsed || {}));
}

// --- Connect to Database ---
connectDB();

// --- Initialize App ---
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
  max: 1000, // Increased for dev/testing
  message:
    "Too many requests from this IP, please try again after 15 minutes.",
});
app.use("/api", limiter);

// --- Passport Setup (for Google OAuth & JWT Strategy) ---
app.use(passport.initialize());
passportConfig(passport);

// --- Mount Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/plan-trip", planTripRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/proxy", proxyRoutes);

// --- Error Handler (custom middleware) ---
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// --- Initialize Socket.io ---
initSocket(server);