import express from "express";
import multer from "multer";
import {
  createGarment,
  getGarmentById,
  getGarmentsByOrder,
  updateGarment,
  deleteGarment,
  updateGarmentImages,
  deleteGarmentImage,
} from "../controllers/garment.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Debug middleware
router.use((req, res, next) => {
  console.log(`📡 Garment Route: ${req.method} ${req.originalUrl}`);
  next();
});

// All routes require authentication
router.use(protect);

/**
 * @route   POST /api/garments/order/:orderId
 * @desc    Create new garment with images for a specific order
 * @access  Admin, Store Keeper
 */
router.post(
  "/order/:orderId",
  authorize("ADMIN", "STORE_KEEPER"),
  upload.fields([
    { name: "referenceImages", maxCount: 10 },      // Studio/designer images
    { name: "customerImages", maxCount: 10 },       // Customer digital images
    { name: "customerClothImages", maxCount: 10 },  // NEW: Customer physical cloth images
  ]),
  createGarment
);

/**
 * @route   GET /api/garments/order/:orderId
 * @desc    Get all garments for a specific order
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/order/:orderId", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getGarmentsByOrder);

/**
 * @route   GET /api/garments/:id
 * @desc    Get garment by ID
 * @access  Admin, Store Keeper, Cutting Master
 */
router.get("/:id", authorize("ADMIN", "STORE_KEEPER", "CUTTING_MASTER"), getGarmentById);

/**
 * @route   PUT /api/garments/:id
 * @desc    Update garment (without images)
 * @access  Admin, Store Keeper
 */
router.put("/:id", authorize("ADMIN", "STORE_KEEPER"), updateGarment);

/**
 * @route   PATCH /api/garments/:id/images
 * @desc    Update garment images
 * @access  Admin, Store Keeper
 */
router.patch(
  "/:id/images",
  authorize("ADMIN", "STORE_KEEPER"),
  upload.fields([
    { name: "referenceImages", maxCount: 10 },      // Studio/designer images
    { name: "customerImages", maxCount: 10 },       // Customer digital images
    { name: "customerClothImages", maxCount: 10 },  // NEW: Customer physical cloth images
  ]),
  updateGarmentImages
);

/**
 * @route   DELETE /api/garments/:id/images
 * @desc    Delete a specific image from garment
 * @access  Admin, Store Keeper
 */
router.delete("/:id/images", authorize("ADMIN", "STORE_KEEPER"), deleteGarmentImage);

/**
 * @route   DELETE /api/garments/:id
 * @desc    Delete garment (soft delete)
 * @access  Admin, Store Keeper
 */
router.delete("/:id", authorize("ADMIN", "STORE_KEEPER"), deleteGarment);

export default router;