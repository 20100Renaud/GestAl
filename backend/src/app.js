import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import proprietairesRoutes from "./routes/proprietaires.routes.js";
import animauxRoutes from "./routes/animaux.routes.js";
import prestationsRoutes from "./routes/prestations.routes.js";
import consultationsRoutes from "./routes/consultations.routes.js";
import paiementsRoutes from "./routes/paiements.routes.js";
import tarifsRoutes from "./routes/tarifs.routes.js";
import deplacementsRoutes from "./routes/deplacements.routes.js";
import zonagesRoutes from "./routes/zonages.routes.js";
import consultationZonagesRoutes from "./routes/consultation-zonages.routes.js";


const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/proprietaires", proprietairesRoutes);
app.use("/api/animaux", animauxRoutes);
app.use("/api/prestations", prestationsRoutes);
app.use("/api/consultations", consultationsRoutes);
app.use("/api/paiements", paiementsRoutes);
app.use("/api/tarifs", tarifsRoutes);
app.use("/api/deplacements", deplacementsRoutes);
app.use("/api/zonages", zonagesRoutes);
app.use("/api/consultation-zonages", consultationZonagesRoutes);

export default app;
