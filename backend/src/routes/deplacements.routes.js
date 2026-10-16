import { Router } from "express";

import {
  getDeplacements,
  getDeplacement,
  createDeplacement,
  updateDeplacement,
  copyDeplacements,
  deleteDeplacement,
} from "../controllers/deplacements.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireClient } from "../middleware/client.middleware.js";

const router = Router();

router.use(authenticate, requireClient);

router.get("/", getDeplacements);
router.get("/:id", getDeplacement);
router.post("/", createDeplacement);
router.post("/copy", copyDeplacements);
router.put("/:id", updateDeplacement);
router.delete("/:id", deleteDeplacement);

export default router;
