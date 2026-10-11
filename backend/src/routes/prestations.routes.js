import { Router } from "express";

import {
  getPrestations,
  getPrestation,
  createPrestation,
  updatePrestation,
  deletePrestation,
} from "../controllers/prestations.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireClient } from "../middleware/client.middleware.js";

const router = Router();

router.use(authenticate, requireClient);

router.get("/", getPrestations);
router.get("/:id", getPrestation);
router.post("/", createPrestation);
router.put("/:id", updatePrestation);
router.delete("/:id", deletePrestation);

export default router;
