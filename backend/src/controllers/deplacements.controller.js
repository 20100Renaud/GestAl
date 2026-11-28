import prisma from "../lib/prisma.js";

// Deplacements and count all
export async function getDeplacements(req, res) {
  try {
    const deplacements = await prisma.t_Deplacements.findMany({
      where: {
        ID_User: req.user.userId,
      },
      orderBy: [
        { Annee_Deplacement: "desc" },
        { Denomination_Deplacement: "asc" },
      ],
      include: {
        _count: {
          select: {
            Prestations_Deplacement: true,
          },
        },
      },
    });

    return res.status(200).json({
      deplacements,
    });
  } catch (error) {
    console.error("Get deplacements error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Deplacements by ID
export async function getDeplacement(req, res) {
  try {
    const deplacement = await prisma.t_Deplacements.findFirst({
      where: {
        ID_Deplacement: req.params.id,
        ID_User: req.user.userId,
      },
    });

    if (!deplacement) {
      return res.status(404).json({
        error: "Deplacement not found",
      });
    }

    return res.status(200).json(deplacement);
  } catch (error) {
    console.error("Get deplacement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Create
export async function createDeplacement(req, res) {
  try {
    const { Annee_Deplacement, Denomination_Deplacement, Montant_Deplacement } =
      req.body;

    if (
      typeof Annee_Deplacement !== "string" ||
      !Annee_Deplacement.trim() ||
      typeof Denomination_Deplacement !== "string" ||
      !Denomination_Deplacement.trim()
    ) {
      return res.status(400).json({
        error: "Year and denomination are required",
      });
    }

    const montant =
      Montant_Deplacement === undefined || Montant_Deplacement === ""
        ? 0
        : Number(Montant_Deplacement);

    if (!Number.isFinite(montant) || montant < 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    const annee =
      Annee_Deplacement === undefined || Annee_Deplacement === ""
        ? new Date().getFullYear()
        : Number(Annee_Deplacement);

    if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
      return res.status(400).json({
        error: "Année invalide",
      });
    }

    const deplacement = await prisma.t_Deplacements.create({
      data: {
        ID_User: req.user.userId,
        Annee_Deplacement: annee,
        Denomination_Deplacement: Denomination_Deplacement.trim(),
        Montant_Deplacement: montant,
      },
    });

    return res.status(201).json(deplacement);
  } catch (error) {
    console.error("Create deplacement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Update
export async function updateDeplacement(req, res) {
  try {
    const { id } = req.params;

    const {
      Annee_Deplacement,
      Denomination_Deplacement,
      Montant_Deplacement,
    } = req.body;

    if (
      Annee_Deplacement === undefined ||
      Annee_Deplacement === null ||
      String(Annee_Deplacement).trim() === "" ||
      typeof Denomination_Deplacement !== "string" ||
      !Denomination_Deplacement.trim()
    ) {
      return res.status(400).json({
        error: "Year and denomination are required",
      });
    }

    const annee = Number(Annee_Deplacement);

    if (!Number.isInteger(annee) || annee < 2000 || annee > 2100) {
      return res.status(400).json({
        error: "Année invalide",
      });
    }

    const montant =
      Montant_Deplacement === undefined || Montant_Deplacement === ""
        ? 0
        : Number(Montant_Deplacement);

    if (!Number.isFinite(montant) || montant < 0) {
      return res.status(400).json({
        error: "Invalid amount",
      });
    }

    const result = await prisma.$transaction(
      async (tx) => {
        const existingDeplacement = await tx.t_Deplacements.findFirst({
          where: {
            ID_Deplacement: id,
            ID_User: req.user.userId,
          },
          include: {
            _count: {
              select: {
                Prestations_Deplacement: true,
              },
            },
          },
        });

        if (!existingDeplacement) {
          return {
            status: 404,
            error: "Deplacement not found",
          };
        }

        const isAssociated =
          existingDeplacement._count.Prestations_Deplacement > 0;

        const yearChanged =
          annee !== existingDeplacement.Annee_Deplacement;

        const amountChanged =
          montant !== Number(existingDeplacement.Montant_Deplacement);

        if (isAssociated && (yearChanged || amountChanged)) {
          return {
            status: 409,
            error:
              "Impossible de modifier l'année ou le montant de ce déplacement car il est associé à une ou plusieurs prestations.",
          };
        }

        const deplacement = await tx.t_Deplacements.update({
          where: {
            ID_Deplacement: id,
          },
          data: {
            Annee_Deplacement: isAssociated
              ? existingDeplacement.Annee_Deplacement
              : annee,
            Denomination_Deplacement: Denomination_Deplacement.trim(),
            Montant_Deplacement: isAssociated
              ? existingDeplacement.Montant_Deplacement
              : montant,
          },
        });

        return {
          status: 200,
          deplacement,
        };
      },
      {
        isolationLevel: "Serializable",
      },
    );

    if (result.error) {
      return res.status(result.status).json({
        error: result.error,
      });
    }

    return res.status(200).json(result.deplacement);
  } catch (error) {
    console.error("Update deplacement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Delete
export async function deleteDeplacement(req, res) {
  try {
    const { id } = req.params;

    const existingDeplacement = await prisma.t_Deplacements.findUnique({
      where: {
        ID_Deplacement: id,
        ID_User: req.user.userId,
      },
    });

    if (!existingDeplacement) {
      return res.status(404).json({
        error: "Deplacement not found",
      });
    }

    const prestationCount = await prisma.t_Prestations.count({
      where: {
        ID_Deplacement: id,
      },
    });

    if (prestationCount > 0) {
      return res.status(409).json({
        error:
          "Impossible de supprimer ce déplacement car il est utilisé par une ou plusieurs prestations",
      });
    }

    await prisma.t_Deplacements.delete({
      where: {
        ID_Deplacement: id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete deplacement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}


export async function copyDeplacements(req, res) {
  try {
    const { sourceYear, targetYear, deplacementIds } = req.body;
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
        error: "Les années source et destination doivent être différentes",
      });
    }

    if (
      !Array.isArray(deplacementIds) ||
      deplacementIds.length === 0 ||
      !deplacementIds.every((id) => typeof id === "string" && id.trim()) ||
      new Set(deplacementIds).size !== deplacementIds.length
    ) {
      return res.status(400).json({
        error: "Veuillez sélectionner au moins un déplacement valide",
      });
    }

    const count = await prisma.$transaction(
      async (tx) => {
        const source = await tx.t_Deplacements.findMany({
          where: {
            ID_User: userId,
            Annee_Deplacement: sourceYear,
            ID_Deplacement: {
              in: deplacementIds,
            },
          },
        });

        if (source.length !== deplacementIds.length) {
          throw new Error("INVALID_SOURCE_SELECTION");
        }

        const destination = await tx.t_Deplacements.findFirst({
          where: {
            ID_User: userId,
            Annee_Deplacement: targetYear,
          },
          select: {
            ID_Deplacement: true,
          },
        });

        if (destination) {
          throw new Error("TARGET_YEAR_EXISTS");
        }

        const result = await tx.t_Deplacements.createMany({
          data: source.map((deplacement) => ({
            ID_User: userId,
            Annee_Deplacement: targetYear,
            Denomination_Deplacement: deplacement.Denomination_Deplacement,
            Montant_Deplacement: deplacement.Montant_Deplacement,
          })),
        });

        return result.count;
      },
      {
        isolationLevel: "Serializable",
      },
    );

    return res.status(201).json({
      message: `${count} déplacement(s) copié(s) avec succès`,
      count,
      targetYear,
    });
  } catch (error) {
    if (error.message === "INVALID_SOURCE_SELECTION") {
      return res.status(400).json({
        error: "Un ou plusieurs déplacements sélectionnés sont introuvables",
      });
    }

    if (error.message === "TARGET_YEAR_EXISTS") {
      return res.status(409).json({
        error: "Des déplacements existent déjà pour cette année",
      });
    }

    console.error("Copy deplacements error:", error);

    return res.status(500).json({
      error: "Impossible de copier les déplacements",
    });
  }
}

