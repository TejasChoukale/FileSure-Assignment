import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import purchaseRoutes from "./routes/purchaseRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";

dotenv.config();
const app = express();

/* -------------------- CORS CONFIG -------------------- */
const allowedOrigins = [
  "https://file-sure-assignment.vercel.app", // ✅ Your production frontend
  process.env.PUBLIC_APP_URL, // ✅ Additional URL from env
  "http://localhost:3000", // ✅ Local dev
  "http://localhost:3001", // ✅ Alternative local port
].filter(Boolean); // ✅ Remove undefined/null values

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, curl, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        console.log("✅ CORS allowed for:", origin);
        return callback(null, true);
      } else {
        console.warn("🚫 Blocked CORS from:", origin);
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // ✅ Add all methods
    allowedHeaders: ["Content-Type", "Authorization"], // ✅ Add allowed headers
  })
);

app.use(express.json());

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* -------------------- HEALTH + DEBUG -------------------- */
app.get("/", (_req, res) => res.json({ 
  message: "FileSure API is running",
  timestamp: new Date().toISOString() 
}));

app.get("/health", (_req, res) => res.send("ok"));

app.get("/debug", (req, res) => res.json({
  headers: req.headers,
  allowedOrigins: allowedOrigins,
  env: {
    PUBLIC_APP_URL: process.env.PUBLIC_APP_URL || "NOT_SET",
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV || "development"
  }
}));

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 CORS allowed for: ${allowedOrigins.join(", ")}`);
});