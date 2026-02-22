import express from "express";
import { getAllSizeFields, createSizeField } from "../controllers/sizeField.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

// Get all size fields
router.get("/", getAllSizeFields);

// Create new size field (Admin only)
router.post("/", authorize("ADMIN","STORE_KEEPER"), createSizeField);

export default router;