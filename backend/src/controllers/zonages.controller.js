import prisma from "../lib/prisma.js";

export async function getZonages(req, res) {
  try {
    const zonages = await prisma.t_Zonages.findMany({
      orderBy: {
        Nom_Zonage: "asc",
      },
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
        error: "Zonage not found",
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
      Pratique_Zonage,
      Nom_Zonage,
      Position_Zonage,
      Orientation_Zonage,
      Technique_Zonage,
    } = req.body;

    if (
      typeof Pratique_Zonage !== "string" ||
      !Pratique_Zonage.trim() ||
      typeof Nom_Zonage !== "string" ||
      !Nom_Zonage.trim()
    ) {
      return res.status(400).json({
        error: "Pratique_Zonage and Nom_Zonage are required",
      });
    }

    const zonage = await prisma.t_Zonages.create({
      data: {
        Pratique_Zonage: Pratique_Zonage.trim(),
        Nom_Zonage: Nom_Zonage.trim(),

        Position_Zonage:
          typeof Position_Zonage === "string" && Position_Zonage.trim()
            ? Position_Zonage.trim()
            : null,

        Orientation_Zonage:
          typeof Orientation_Zonage === "string" && Orientation_Zonage.trim()
            ? Orientation_Zonage.trim()
            : null,

        Technique_Zonage:
          typeof Technique_Zonage === "string" && Technique_Zonage.trim()
            ? Technique_Zonage.trim()
            : null,
      },
    });

    return res.status(201).json(zonage);
  } catch (error) {
    console.error("Create zonage error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updateZonage(req, res) {
  try {
    const { id } = req.params;

    const {
      Pratique_Zonage,
      Nom_Zonage,
      Position_Zonage,
      Orientation_Zonage,
      Technique_Zonage,
    } = req.body;

    if (
      typeof Pratique_Zonage !== "string" ||
      !Pratique_Zonage.trim() ||
      typeof Nom_Zonage !== "string" ||
      !Nom_Zonage.trim()
    ) {
      return res.status(400).json({
        error: "Pratique_Zonage and Nom_Zonage are required",
      });
    }

    const existingZonage = await prisma.t_Zonages.findUnique({
      where: {
        ID_Zonage: id,
      },
    });

    if (!existingZonage) {
      return res.status(404).json({
        error: "Zonage not found",
      });
    }

    const zonage = await prisma.t_Zonages.update({
      where: {
        ID_Zonage: id,
      },
      data: {
        Pratique_Zonage: Pratique_Zonage.trim(),
        Nom_Zonage: Nom_Zonage.trim(),

        Position_Zonage:
          typeof Position_Zonage === "string" && Position_Zonage.trim()
            ? Position_Zonage.trim()
            : null,

        Orientation_Zonage:
          typeof Orientation_Zonage === "string" && Orientation_Zonage.trim()
            ? Orientation_Zonage.trim()
            : null,

        Technique_Zonage:
          typeof Technique_Zonage === "string" && Technique_Zonage.trim()
            ? Technique_Zonage.trim()
            : null,
      },
    });

    return res.json(zonage);
  } catch (error) {
    console.error("Update zonage error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
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
        error: "Zonage not found",
      });
    }

    await prisma.t_Zonages.delete({
      where: {
        ID_Zonage: id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete zonage error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
