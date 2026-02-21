import express from "express";
import {
  createItem, getItems, getItemById,
  updateItem, deleteItem, toggleItemStatus
} from "../controllers/item.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);
router.use(authorize("ADMIN", "STORE_KEEPER"));

router.post("/", createItem);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);
router.patch("/:id/toggle", toggleItemStatus);

export default router;