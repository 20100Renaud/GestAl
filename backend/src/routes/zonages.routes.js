import { Router } from "express";

import {
  getZonages,
  getZonage,
  createZonage,
  updateZonage,
  deleteZonage,
} from "../controllers/zonages.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getZonages);
router.get("/:id", getZonage);
router.post("/", requireAdmin, createZonage);
router.put("/:id", requireAdmin, updateZonage);
router.delete("/:id", requireAdmin, deleteZonage);

export default router;
