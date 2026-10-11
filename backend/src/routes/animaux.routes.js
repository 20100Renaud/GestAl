import { Router } from "express";

import {
  getAnimals,
  getAnimal,
  createAnimal,
  updateAnimal,
  deleteAnimal,
} from "../controllers/animaux.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireClient } from "../middleware/client.middleware.js";

const router = Router();

router.use(authenticate, requireClient);

router.get("/", getAnimals);
router.get("/:id", getAnimal);
router.post("/", createAnimal);
router.put("/:id", updateAnimal);
router.delete("/:id", deleteAnimal);

export default router;
