import { Router } from "express";

import {
  getProprietaires,
  getProprietaire,
  createProprietaire,
  updateProprietaire,
  deleteProprietaire,
} from "../controllers/proprietaires.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/", getProprietaires);
router.get("/:id", getProprietaire);
router.post("/", createProprietaire);
router.put("/:id", updateProprietaire);
router.delete("/:id", deleteProprietaire);

export default router;
