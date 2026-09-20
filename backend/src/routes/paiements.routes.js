import { Router } from "express";

import {
  getPaiements,
  getPaiement,
  createPaiement,
  updatePaiement,
  deletePaiement,
} from "../controllers/paiements.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getPaiements);
router.get("/:id", getPaiement);
router.post("/", createPaiement);
router.put("/:id", updatePaiement);
router.delete("/:id", deletePaiement);

export default router;
