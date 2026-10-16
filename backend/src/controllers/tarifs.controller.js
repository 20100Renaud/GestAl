import prisma from "../lib/prisma.js";

// Read all
export async function getTarifs(req, res) {
  try {
    const tarifs = await prisma.t_Tarifs.findMany({
      where: {
        ID_User: req.user.userId,
      },
      orderBy: [{ Annee_Tarif: "desc" }, { Denomination_Tarif: "asc" }],
    });

    return res.status(200).json({
      tarifs,
    });
  } catch (error) {
    console.error("Get tarifs error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Read by ID
export async function getTarif(req, res) {
  try {
    const tarif = await prisma.t_Tarifs.findFirst({
      where: {
        ID_Tarif: req.params.id,
        ID_User: req.user.userId,
      },
    });

    if (!tarif) {
      return res.status(404).json({
        error: "Tarif not found",
      });
    }

    return res.status(200).json(tarif);
  } catch (error) {
    console.error("Get tarif error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Create
export async function createTarif(req, res) {
  try {
    const { Annee_Tarif, Denomination_Tarif, Montant_Tarif } = req.body;

    if (
      typeof Annee_Tarif !== "string" ||
      !Annee_Tarif.trim() ||
      typeof Denomination_Tarif !== "string" ||
      !Denomination_Tarif.trim()
    ) {
      return res.status(400).json({
        error: "Year and denomination are required",
      });
    }

    const annee = Number(Annee_Tarif);

    if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
      return res.status(400).json({
        error: "Année invalide",
      });
    }

    const montant =
      Montant_Tarif === undefined || Montant_Tarif === ""
        ? 0
        : Number(Montant_Tarif);

    if (!Number.isFinite(montant) || montant < 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    const tarif = await prisma.t_Tarifs.create({
      data: {
        ID_User: req.user.userId,
        Annee_Tarif: annee,
        Denomination_Tarif: Denomination_Tarif.trim(),
        Montant_Tarif: montant,
      },
    });

    return res.status(201).json(tarif);
  } catch (error) {
    console.error("Create tarif error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Update
export async function updateTarif(req, res) {
  try {
    const { Annee_Tarif, Denomination_Tarif, Montant_Tarif } = req.body;

    if (
      Annee_Tarif === undefined ||
      Annee_Tarif === null ||
      String(Annee_Tarif).trim() === "" ||
      typeof Denomination_Tarif !== "string" ||
      !Denomination_Tarif.trim()
    ) {
      return res.status(400).json({
        error: "Year and denomination are required",
      });
    }

    const montant =
      Montant_Tarif === undefined || Montant_Tarif === ""
        ? 0
        : Number(Montant_Tarif);

    const annee = Number(Annee_Tarif);

    if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
      return res.status(400).json({
        error: "Année invalide",
      });
    }

    if (!Number.isFinite(montant) || montant < 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    const existingTarif = await prisma.t_Tarifs.findUnique({
      where: {
        ID_Tarif: req.params.id,
        ID_User: req.user.userId,
      },
    });

    if (!existingTarif) {
      return res.status(404).json({
        error: "Tarif not found",
      });
    }

    const tarif = await prisma.t_Tarifs.update({
      where: {
        ID_Tarif: req.params.id,
        ID_User: req.user.userId,
      },
      data: {
        Annee_Tarif: annee,
        Denomination_Tarif: Denomination_Tarif.trim(),
        Montant_Tarif: montant,
      },
    });

    return res.status(200).json(tarif);
  } catch (error) {
    console.error("Update tarif error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Delete
export async function deleteTarif(req, res) {
  try {
    const { id } = req.params;

    const existingTarif = await prisma.t_Tarifs.findUnique({
      where: {
        ID_Tarif: id,
        ID_User: req.user.userId,
      },
    });

    if (!existingTarif) {
      return res.status(404).json({
        error: "Tarif not found",
      });
    }

    const consultationCount = await prisma.t_Consultations.count({
      where: {
        ID_Tarif: id,
      },
    });

    if (consultationCount > 0) {
      return res.status(409).json({
        error:
          "Impossible de supprimer ce tarif car il est utilisé par une ou plusieurs consultations",
      });
    }

    await prisma.t_Tarifs.delete({
      where: {
        ID_Tarif: id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete tarif error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Copy
export async function copyTarifs(req, res) {
  try {
    const { sourceYear, targetYear } = req.body;
    const userId = req.user.userId;

    if (
      !Number.isInteger(sourceYear) ||
      sourceYear < 2000 ||
      sourceYear > 2100 ||
      !Number.isInteger(targetYear) ||
      targetYear < 2000 ||
      targetYear > 2100
    ) {
      return res.status(400).json({
        error: "Année invalide",
      });
    }

    if (sourceYear === targetYear) {
      return res.status(400).json({
        error: "Les années doivent être différentes",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const sourceTarifs = await tx.t_Tarifs.findMany({
          where: {
            ID_User: userId,
            Annee_Tarif: sourceYear,
          },
        });

        if (sourceTarifs.length === 0) {
          throw new Error("SOURCE_YEAR_EMPTY");
        }

        const existingTarget = await tx.t_Tarifs.findFirst({
          where: {
            ID_User: userId,
            Annee_Tarif: targetYear,
          },
          select: {
            ID_Tarif: true,
          },
        });

        if (existingTarget) {
          throw new Error("TARGET_YEAR_EXISTS");
        }

        const copied = await tx.t_Tarifs.createMany({
          data: sourceTarifs.map((tarif) => ({
            ID_User: userId,
            Annee_Tarif: targetYear,
            Denomination_Tarif: tarif.Denomination_Tarif,
            Montant_Tarif: tarif.Montant_Tarif,
          })),
        });

        return copied.count;
      },
      {
        isolationLevel: "Serializable",
      },
    );

    return res.status(201).json({
      message: `${result} tarif(s) copié(s) avec succès`,
      count: result,
      targetYear,
    });
  } catch (error) {
    if (error.message === "SOURCE_YEAR_EMPTY") {
      return res.status(400).json({
        error: "Aucun tarif trouvé pour l'année à copier",
      });
    }

    if (error.message === "TARGET_YEAR_EXISTS") {
      return res.status(409).json({
        error: "Des tarifs existent déjà pour cette année",
      });
    }

    console.error("Copy tarifs error:", error);

    return res.status(500).json({
      error: "Impossible de copier les tarifs",
    });
  }
}
