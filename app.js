
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

// Routes
import authRoutes from "./src/routes/authRoutes.js";

const app = express();

// ==========================================
// 1. APPLICATION CONFIGURATION
// ==========================================

app.disable("x-powered-by");

// ==========================================
// 2. SECURITY MIDDLEWARE
// ==========================================

app.use(helmet());

// ==========================================
// 3. CORS CONFIGURATION
// ==========================================

// Supports multiple frontend URLs separated by commas.
const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (Postman, server-to-server requests).
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Browser requests from unapproved origins
      // will not receive CORS permission.
      return callback(null, false);
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);

// ==========================================
// 4. REQUEST PARSING
// ==========================================

app.use(
  express.json({
    limit: "10kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  })
);

// ==========================================
// 5. COOKIE PARSER
// ==========================================

app.use(cookieParser());

// ==========================================
// 6. REQUEST LOGGING
// ==========================================

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// ==========================================
// 7. GLOBAL API RATE LIMITING
// ==========================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// ==========================================
// 8. HEALTH CHECK
// ==========================================

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Doctor Tracker API is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 9. AUTHENTICATION ROUTES
// ==========================================

app.use("/api/v1/auth", authRoutes);

// ==========================================
// 10. 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    path: req.originalUrl,
  });
});

// ==========================================
// 11. GLOBAL ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Request failed";

  // Invalid JSON
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON request body.";
  }

  // Request body too large
  if (err.type === "entity.too.large") {
    statusCode = 413;
    message = "Request body is too large.";
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Database validation failed.";
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid resource identifier.";
  }

  // Never expose internal server errors
  if (statusCode >= 500) {
    console.error("Server Error:", err);

    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
});

export default app;
