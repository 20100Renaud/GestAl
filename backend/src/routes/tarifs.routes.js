import { Router } from "express";

import {
  getTarifs,
  getTarif,
  createTarif,
  updateTarif,
  deleteTarif,
} from "../controllers/tarifs.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getTarifs);
router.get("/:id", getTarif);
router.post("/", createTarif);
router.put("/:id", updateTarif);
router.delete("/:id", deleteTarif);

export default router;
