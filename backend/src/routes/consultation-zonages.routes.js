import { Router } from "express";

import {
  getConsultationZonages,
  createConsultationZonage,
  updateConsultationZonage,
  deleteConsultationZonage,
} from "../controllers/consultation-zonages.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);
router.get("/:consultationId/zonages", getConsultationZonages);
router.post("/:consultationId/zonages", createConsultationZonage);
router.put("/:consultationId/zonages/:zonageId", updateConsultationZonage);
router.delete("/:consultationId/zonages/:zonageId", deleteConsultationZonage);

export default router;
