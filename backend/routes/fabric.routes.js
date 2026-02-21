import express from "express";
import multer from 'multer';
import {
  createFabric,
  getAllFabrics,
  getFabricById,
  updateFabric,
  deleteFabric,
  toggleFabricStatus
} from "../controllers/fabric.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(protect);
router.use(authorize("ADMIN", "STORE_KEEPER"));

// Routes
router.post("/", upload.single('image'), createFabric);
router.get("/", getAllFabrics);
router.get("/:id", getFabricById);
router.put("/:id", upload.single('image'), updateFabric);
router.delete("/:id", deleteFabric);
router.patch("/:id/toggle", toggleFabricStatus);

export default router; // ✅ Make sure this line exists