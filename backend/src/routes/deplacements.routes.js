import { Router } from "express";

import {
  getDeplacements,
  getDeplacement,
  createDeplacement,
  updateDeplacement,
  deleteDeplacement,
} from "../controllers/deplacements.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getDeplacements);
router.get("/:id", getDeplacement);
router.post("/", createDeplacement);
router.put("/:id", updateDeplacement);
router.delete("/:id", deleteDeplacement);

export default router;
