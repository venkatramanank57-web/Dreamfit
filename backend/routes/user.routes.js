// backend/routes/user.routes.js
import express from "express";
import { protect, authorize } from "../middleware/auth.middleware.js";
import {
  getAllStaff,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getProfile,
  updateProfile,
  changePassword,
  getUserById
} from "../controllers/user.controller.js";

console.log("📁 user.routes.js is loading...");
console.log("   getProfile:", getProfile ? "✅" : "❌");
console.log("   getAllStaff:", getAllStaff ? "✅" : "❌");
console.log("   createUser:", createUser ? "✅" : "❌");
console.log("   protect:", protect ? "✅" : "❌");

const router = express.Router();

// ========== ALL ROUTES NEED TOKEN ==========
router.use(protect);

// ========== PROFILE ROUTES ==========
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);

// ========== ADMIN ONLY ROUTES ==========
router.use(authorize("ADMIN"));

router.get("/all-staff", getAllStaff);
router.post("/create", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.put("/:id/toggle-status", toggleUserStatus);

console.log("   router:", router ? "✅ Created" : "❌ Failed");

export default router;