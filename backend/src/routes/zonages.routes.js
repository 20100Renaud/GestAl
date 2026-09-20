import { Router } from "express";

import {
  getZonages,
  getZonage,
  createZonage,
  updateZonage,
  deleteZonage,
} from "../controllers/zonages.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getZonages);
router.get("/:id", getZonage);
router.post("/", createZonage);
router.put("/:id", updateZonage);
router.delete("/:id", deleteZonage);

export default router;
