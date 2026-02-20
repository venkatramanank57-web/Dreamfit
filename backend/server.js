import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import customerRoutes from "./routes/customer.routes.js"; // 1. Inga Import pannunga

// Load env variables
dotenv.config();

// Create app
const app = express();

// Connect MongoDB
connectDB();

// Security middleware
app.use(helmet());

// Body parser
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  })
);

// Test route
app.get("/", (req, res) => {
  res.send("Dreamfit API Running 🚀");
});

// 🔐 AUTH ROUTES
app.use("/api/auth", authRoutes);

// 👤 CUSTOMER ROUTES
app.use("/api/customers", customerRoutes); 

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});