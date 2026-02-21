// backend/routes/auth.routes.js
import express from "express";
import { loginUser } from "../controllers/auth.controller.js";

console.log("📁 auth.routes.js is loading...");
console.log("   loginUser:", loginUser ? "✅ Function" : "❌ Undefined");

const router = express.Router();

router.post("/login", loginUser);

console.log("   router:", router ? "✅ Created" : "❌ Failed");

export default router;