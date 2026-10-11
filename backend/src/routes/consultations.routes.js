import { Router } from "express";

import {
  getConsultations,
  getConsultation,
  createConsultation,
  updateConsultation,
  deleteConsultation,
} from "../controllers/consultations.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireClient } from "../middleware/client.middleware.js";

const router = Router();

router.use(authenticate, requireClient);

router.get("/", getConsultations);
router.get("/:id", getConsultation);
router.post("/", createConsultation);
router.put("/:id", updateConsultation);
router.delete("/:id", deleteConsultation);

export default router;
