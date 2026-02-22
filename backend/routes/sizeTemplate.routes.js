import express from "express";
import {
  createTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  toggleTemplateStatus
} from "../controllers/sizeTemplate.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);
router.use(authorize("ADMIN", "STORE_KEEPER")); // Both can manage templates

router.post("/", createTemplate);
router.get("/", getAllTemplates);
router.get("/:id", getTemplateById);
router.put("/:id", updateTemplate);
router.delete("/:id", deleteTemplate);
router.patch("/:id/toggle", toggleTemplateStatus);

export default router;