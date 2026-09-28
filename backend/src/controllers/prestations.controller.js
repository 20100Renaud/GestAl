import { recalculatePrestationAmount } from "../services/prestations.service.js";

import prisma from "../lib/prisma.js";

const prestationInclude = {
  Proprietaire_Prestation: true,
  Lieu_Prestation: true,
  Deplacement_Prestation: true,
  Consultations_Prestation: {
    include: {
      Animal_Consultation: true,
      Tarif_Consultation: true,
      Zonages_Consultation: {
        include: {
          Zonage: true,
        },
      },
    },
  },
  Paiements_Prestation: true,
};

export async function getPrestations(req, res) {
  try {
    const prestations = await prisma.t_Prestations.findMany({
      orderBy: {
        Date_Prestation: "desc",
      },
      include: prestationInclude,
    });

    return res.json(prestations);
  } catch (error) {
    console.error("Get prestations error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getPrestation(req, res) {
  try {
    const { id } = req.params;

    const prestation = await prisma.t_Prestations.findUnique({
      where: {
        ID_Prestation: id,
      },
      include: prestationInclude,
    });

    if (!prestation) {
      return res.status(404).json({
        error: "Prestation non trouvée",
      });
    }

    return res.json(prestation);
  } catch (error) {
    console.error("Get prestation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function createPrestation(req, res) {
  try {
    const {
      ID_Proprietaire,
      ID_Lieu,
      ID_Deplacement,
      Date_Prestation,
      Remise_Prestation,
    } = req.body;

    if (typeof ID_Proprietaire !== "string" || !ID_Proprietaire.trim()) {
      return res.status(400).json({
        error: "Propriétaire requis",
      });
    }

    if (typeof ID_Lieu !== "string" || !ID_Lieu.trim()) {
      return res.status(400).json({
        error: "Lieu de prestation requis",
      });
    }

    if (typeof ID_Deplacement !== "string" || !ID_Deplacement.trim()) {
      return res.status(400).json({
        error: "Déplacement requis",
      });
    }

    const remise =
      Remise_Prestation === undefined || Remise_Prestation === ""
        ? 0
        : Number(Remise_Prestation);

    if (!Number.isFinite(remise) || remise < 0) {
      return res.status(400).json({
        error: "Remise invalide",
      });
    }

    const [proprietaire, lieu, deplacement] = await Promise.all([
      prisma.t_Proprietaires.findUnique({
        where: {
          ID_Proprietaire,
        },
      }),

      prisma.t_Proprietaires.findUnique({
        where: {
          ID_Proprietaire: ID_Lieu,
        },
      }),

      prisma.t_Deplacements.findUnique({
        where: {
          ID_Deplacement,
        },
      }),
    ]);

    if (!proprietaire) {
      return res.status(404).json({
        error: "Propriétaire non trouvé",
      });
    }

    if (!lieu) {
      return res.status(404).json({
        error: "Lieu non trouvé",
      });
    }

    if (!deplacement) {
      return res.status(404).json({
        error: "Déplacement non trouvé",
      });
    }

    let datePrestation;

    if (Date_Prestation) {
      datePrestation = new Date(Date_Prestation);

      if (Number.isNaN(datePrestation.getTime())) {
        return res.status(400).json({
          error: "Date de prestation invalide",
        });
      }
    }

    const prestation = await prisma.t_Prestations.create({
      data: {
        ID_Proprietaire,
        ID_Lieu,
        ID_Deplacement,

        ...(datePrestation
          ? {
              Date_Prestation: datePrestation,
            }
          : {}),

        Remise_Prestation: remise,
        Montant_Prestation: 0,
      },
    });

    const updatedPrestation = await recalculatePrestationAmount(
      prestation.ID_Prestation,
    );

    return res.status(201).json(updatedPrestation);
  } catch (error) {
    console.error("Create prestation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updatePrestation(req, res) {
  try {
    const { id } = req.params;

    const existingPrestation = await prisma.t_Prestations.findUnique({
      where: {
        ID_Prestation: id,
      },
      include: {
        Consultations_Prestation: true,
      },
    });

    if (!existingPrestation) {
      return res.status(404).json({
        error: "Prestation non trouvée",
      });
    }

    const {
      ID_Proprietaire,
      ID_Lieu,
      ID_Deplacement,
      Date_Prestation,
      Remise_Prestation,
    } = req.body;

    if (
      ID_Proprietaire !== undefined &&
      (typeof ID_Proprietaire !== "string" || !ID_Proprietaire.trim())
    ) {
      return res.status(400).json({
        error: "Propriétaire non valide",
      });
    }

    if (
      ID_Lieu !== undefined &&
      (typeof ID_Lieu !== "string" || !ID_Lieu.trim())
    ) {
      return res.status(400).json({
        error: "Lieu non valide",
      });
    }

    if (
      ID_Deplacement !== undefined &&
      (typeof ID_Deplacement !== "string" || !ID_Deplacement.trim())
    ) {
      return res.status(400).json({
        error: "Déplacement non valide",
      });
    }

    const remise =
      Remise_Prestation === undefined || Remise_Prestation === ""
        ? undefined
        : Number(Remise_Prestation);

    if (remise !== undefined && (!Number.isFinite(remise) || remise < 0)) {
      return res.status(400).json({
        error: "Remise invalide",
      });
    }

    const finalProprietaire =
      ID_Proprietaire ?? existingPrestation.ID_Proprietaire;

    const finalLieu = ID_Lieu ?? existingPrestation.ID_Lieu;

    const finalDeplacement =
      ID_Deplacement ?? existingPrestation.ID_Deplacement;

    const [proprietaire, lieu, deplacement] = await Promise.all([
      prisma.t_Proprietaires.findUnique({
        where: {
          ID_Proprietaire: finalProprietaire,
        },
      }),

      prisma.t_Proprietaires.findUnique({
        where: {
          ID_Proprietaire: finalLieu,
        },
      }),

      prisma.t_Deplacements.findUnique({
        where: {
          ID_Deplacement: finalDeplacement,
        },
      }),
    ]);

    if (!proprietaire) {
      return res.status(404).json({
        error: "Propriétaire non trouvé",
      });
    }

    if (!lieu) {
      return res.status(404).json({
        error: "Lieu non trouvé",
      });
    }

    if (!deplacement) {
      return res.status(404).json({
        error: "Déplacement non trouvé",
      });
    }

    let datePrestation;

    if (Date_Prestation !== undefined) {
      datePrestation = new Date(Date_Prestation);

      if (Number.isNaN(datePrestation.getTime())) {
        return res.status(400).json({
          error: "Date de prestation invalide",
        });
      }
    }

    const finalRemise = remise ?? Number(existingPrestation.Remise_Prestation);

    await prisma.t_Prestations.update({
      where: {
        ID_Prestation: id,
      },
      data: {
        ...(ID_Proprietaire !== undefined ? { ID_Proprietaire } : {}),

        ...(ID_Lieu !== undefined ? { ID_Lieu } : {}),

        ...(ID_Deplacement !== undefined ? { ID_Deplacement } : {}),

        ...(Date_Prestation !== undefined
          ? { Date_Prestation: datePrestation }
          : {}),

        ...(Remise_Prestation !== undefined
          ? { Remise_Prestation: finalRemise }
          : {}),
      },
      include: prestationInclude,
    });

    const prestation = await recalculatePrestationAmount(id);

    return res.json(prestation);
  } catch (error) {
    console.error("Update prestation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deletePrestation(req, res) {
  try {
    const { id } = req.params;

    const existingPrestation = await prisma.t_Prestations.findUnique({
      where: {
        ID_Prestation: id,
      },
    });

    if (!existingPrestation) {
      return res.status(404).json({
        error: "Prestation non trouvée",
      });
    }

    await prisma.t_Prestations.delete({
      where: {
        ID_Prestation: id,
      },
    });

    return res.json({
      message: "Prestation supprimée",
    });
  } catch (error) {
    console.error("Delete prestation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
