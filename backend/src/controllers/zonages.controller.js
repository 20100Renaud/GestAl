import prisma from "../lib/prisma.js";

function normalizeOptionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function handleZonageError(error, res, action) {
  if (error.code === "P2002") {
    return res.status(409).json({
      error:
        "Un zonage identique existe déjà avec le même nom, la même position, la même orientation et la même technique.",
    });
  }

  if (error.code === "P2003") {
    return res.status(409).json({
      error:
        "Impossible de supprimer ce zonage car il est utilisé dans une ou plusieurs consultations.",
    });
  }

  console.error(`${action}:`, error);

  return res.status(500).json({
    error: "Une erreur serveur est survenue.",
  });
}

export async function getZonages(req, res) {
  try {
    const zonages = await prisma.t_Zonages.findMany({
      orderBy: [
        {
          Technique_Zonage: "asc",
        },
        {
          Nom_Zonage: "asc",
        },
      ],
    });

    return res.json(zonages);
  } catch (error) {
    console.error("Get zonages error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getZonage(req, res) {
  try {
    const { id } = req.params;

    const zonage = await prisma.t_Zonages.findUnique({
      where: {
        ID_Zonage: id,
      },
    });

    if (!zonage) {
      return res.status(404).json({
        error: "Zonage non trouvé",
      });
    }

    return res.json(zonage);
  } catch (error) {
    console.error("Get zonage error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function createZonage(req, res) {
  try {
    const {
      Nom_Zonage,
      Position_Zonage,
      Orientation_Zonage,
      Technique_Zonage,
    } = req.body;

    if (typeof Nom_Zonage !== "string" || !Nom_Zonage.trim()) {
      return res.status(400).json({
        error: "Nom de zonage est manquant",
      });
    }

    if (typeof Technique_Zonage !== "string" || !Technique_Zonage.trim()) {
      return res.status(400).json({
        error: "Technique est manquante",
      });
    }

    const zonage = await prisma.t_Zonages.create({
      data: {
        Nom_Zonage: Nom_Zonage.trim(),
        Position_Zonage: normalizeOptionalString(Position_Zonage),
        Orientation_Zonage: normalizeOptionalString(Orientation_Zonage),
        Technique_Zonage: Technique_Zonage.trim(),
      },
    });

    return res.status(201).json(zonage);
  } catch (error) {
    return handleZonageError(error, res, "Erreur de création du zonage");
  }
}

export async function updateZonage(req, res) {
  try {
    const { id } = req.params;

    const {
      Nom_Zonage,
      Position_Zonage,
      Orientation_Zonage,
      Technique_Zonage,
    } = req.body;

    if (typeof Nom_Zonage !== "string" || !Nom_Zonage.trim()) {
      return res.status(400).json({
        error: "Nom de zonage est manquant",
      });
    }

    if (typeof Technique_Zonage !== "string" || !Technique_Zonage.trim()) {
      return res.status(400).json({
        error: "Technique est manquante",
      });
    }

    const existingZonage = await prisma.t_Zonages.findUnique({
      where: {
        ID_Zonage: id,
      },
    });

    if (!existingZonage) {
      return res.status(404).json({
        error: "Zonage non trouvé",
      });
    }

    const zonage = await prisma.t_Zonages.update({
      where: {
        ID_Zonage: id,
      },
      data: {
        Nom_Zonage: Nom_Zonage.trim(),
        Position_Zonage: normalizeOptionalString(Position_Zonage),
        Orientation_Zonage: normalizeOptionalString(Orientation_Zonage),
        Technique_Zonage: Technique_Zonage.trim(),
      },
    });

    return res.json(zonage);
  } catch (error) {
    return handleZonageError(error, res, "Erreur de mise à jour du zonage");
  }
}

export async function deleteZonage(req, res) {
  try {
    const { id } = req.params;

    const existingZonage = await prisma.t_Zonages.findUnique({
      where: {
        ID_Zonage: id,
      },
    });

    if (!existingZonage) {
      return res.status(404).json({
        error: "Zonage non trouvé",
      });
    }

    await prisma.t_Zonages.delete({
      where: {
        ID_Zonage: id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    return handleZonageError(error, res, "Erreur de suppression du zonage");
  }
}
