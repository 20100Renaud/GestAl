import { recalculatePrestationAmount } from "../services/prestations.service.js";

import prisma from "../lib/prisma.js";

const consultationInclude = {
  Prestation_Consultation: {
    include: {
      Proprietaire_Prestation: true,
      Lieu_Prestation: true,
      Deplacement_Prestation: true,
    },
  },

  Animal_Consultation: {
    include: {
      Proprietaire_Animal: true,
    },
  },

  Tarif_Consultation: true,

  Zonages_Consultation: {
    include: {
      Zonage: true,
    },
  },
};

export async function getConsultations(req, res) {
  try {
    const consultations = await prisma.t_Consultations.findMany({
      orderBy: {
        Prestation_Consultation: {
          Date_Prestation: "desc",
        },
      },
      include: consultationInclude,
    });

    return res.json(consultations);
  } catch (error) {
    console.error("Get consultations error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getConsultation(req, res) {
  try {
    const { id } = req.params;

    const consultation = await prisma.t_Consultations.findUnique({
      where: {
        ID_Consultation: id,
      },
      include: consultationInclude,
    });

    if (!consultation) {
      return res.status(404).json({
        error: "Consultation non trouvée",
      });
    }

    return res.json(consultation);
  } catch (error) {
    console.error("Get consultation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function createConsultation(req, res) {
  try {
    const {
      ID_Prestation,
      ID_Animal,
      ID_Tarif,
      Quantite_Consultation,
      Motif_Consultation,
      Description_Consultation,
      Commentaire_Consultation,
    } = req.body;

    if (
      typeof ID_Prestation !== "string" ||
      !ID_Prestation.trim() ||
      typeof ID_Animal !== "string" ||
      !ID_Animal.trim() ||
      typeof ID_Tarif !== "string" ||
      !ID_Tarif.trim() ||
      typeof Motif_Consultation !== "string" ||
      !Motif_Consultation.trim() ||
      typeof Description_Consultation !== "string" ||
      !Description_Consultation.trim()
    ) {
      return res.status(400).json({
        error: "Prestation, Animal, Tarif, Motif et Description sont requis",
      });
    }

    const quantite =
      Quantite_Consultation === undefined || Quantite_Consultation === ""
        ? 1
        : Number(Quantite_Consultation);

    if (!Number.isFinite(quantite) || quantite < 1) {
      return res.status(400).json({
        error: "Quantité invalide",
      });
    }

    const [prestation, animal, tarif] = await Promise.all([
      prisma.t_Prestations.findUnique({
        where: {
          ID_Prestation,
        },
      }),

      prisma.t_Animaux.findUnique({
        where: {
          ID_Animal,
        },
      }),

      prisma.t_Tarifs.findUnique({
        where: {
          ID_Tarif,
        },
      }),
    ]);

    if (!prestation) {
      return res.status(404).json({
        error: "Prestation non trouvée",
      });
    }

    if (!animal) {
      return res.status(404).json({
        error: "Animal non trouvé",
      });
    }

    if (!tarif) {
      return res.status(404).json({
        error: "Tarif non trouvé",
      });
    }

    if (animal.ID_Proprietaire !== prestation.ID_Proprietaire) {
      return res.status(400).json({
        error:
          "L'animal ne peut pas être associé à cette prestation car il n'appartient pas au propriétaire selectionné",
      });
    }

    const consultation = await prisma.t_Consultations.create({
      data: {
        ID_Prestation,
        ID_Animal,
        ID_Tarif,
        Quantite_Consultation: quantite,
        Motif_Consultation: Motif_Consultation.trim(),
        Description_Consultation: Description_Consultation.trim(),
        Commentaire_Consultation:
          typeof Commentaire_Consultation === "string" &&
          Commentaire_Consultation.trim()
            ? Commentaire_Consultation.trim()
            : null,
      },
      include: consultationInclude,
    });

    await recalculatePrestationAmount(ID_Prestation);

    return res.status(201).json(consultation);
  } catch (error) {
    console.error("Create consultation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updateConsultation(req, res) {
  try {
    const { id } = req.params;

    const existingConsultation = await prisma.t_Consultations.findUnique({
      where: {
        ID_Consultation: id,
      },
    });

    if (!existingConsultation) {
      return res.status(404).json({
        error: "Consultation non trouvée",
      });
    }

    const oldPrestationId = existingConsultation.ID_Prestation;

    const {
      ID_Prestation,
      ID_Animal,
      ID_Tarif,
      Quantite_Consultation,
      Motif_Consultation,
      Description_Consultation,
      Commentaire_Consultation,
    } = req.body;

    // Validate IDs
    if (
      ID_Prestation !== undefined &&
      (typeof ID_Prestation !== "string" || !ID_Prestation.trim())
    ) {
      return res.status(400).json({
        error: "Prestation non valide",
      });
    }

    if (
      ID_Animal !== undefined &&
      (typeof ID_Animal !== "string" || !ID_Animal.trim())
    ) {
      return res.status(400).json({
        error: "Animal non valide",
      });
    }

    if (
      ID_Tarif !== undefined &&
      (typeof ID_Tarif !== "string" || !ID_Tarif.trim())
    ) {
      return res.status(400).json({
        error: "Tarif non valide",
      });
    }

    // Quantity
    const quantite =
      Quantite_Consultation === undefined || Quantite_Consultation === ""
        ? undefined
        : Number(Quantite_Consultation);

    if (
      quantite !== undefined &&
      (!Number.isFinite(quantite) || quantite < 1)
    ) {
      return res.status(400).json({
        error: "Quantité invalide",
      });
    }

    // Text fields
    if (
      Motif_Consultation !== undefined &&
      (typeof Motif_Consultation !== "string" || !Motif_Consultation.trim())
    ) {
      return res.status(400).json({
        error: "Motif non valide",
      });
    }

    if (
      Description_Consultation !== undefined &&
      (typeof Description_Consultation !== "string" ||
        !Description_Consultation.trim())
    ) {
      return res.status(400).json({
        error: "Description non valide",
      });
    }

    const finalPrestation = ID_Prestation ?? existingConsultation.ID_Prestation;

    const finalAnimal = ID_Animal ?? existingConsultation.ID_Animal;

    // Check prestation
    const prestation = await prisma.t_Prestations.findUnique({
      where: {
        ID_Prestation: finalPrestation,
      },
    });

    if (!prestation) {
      return res.status(404).json({
        error: "Prestation non trouvée",
      });
    }

    // Check animal
    const animal = await prisma.t_Animaux.findUnique({
      where: {
        ID_Animal: finalAnimal,
      },
    });

    if (!animal) {
      return res.status(404).json({
        error: "Animal non trouvé",
      });
    }

    // The animal must belong to the prestation owner.
    if (animal.ID_Proprietaire !== prestation.ID_Proprietaire) {
      return res.status(400).json({
        error:
          "L'animal ne peut pas être associé à cette prestation car il n'appartient pas au propriétaire de la prestation",
      });
    }

    // Check tariff if changed
    if (ID_Tarif !== undefined) {
      const tarif = await prisma.t_Tarifs.findUnique({
        where: {
          ID_Tarif,
        },
      });

      if (!tarif) {
        return res.status(404).json({
          error: "Tarif non trouvé",
        });
      }
    }

    const consultation = await prisma.t_Consultations.update({
      where: {
        ID_Consultation: id,
      },

      data: {
        ...(ID_Prestation !== undefined ? { ID_Prestation } : {}),

        ...(ID_Animal !== undefined ? { ID_Animal } : {}),

        ...(ID_Tarif !== undefined ? { ID_Tarif } : {}),

        ...(Quantite_Consultation !== undefined
          ? {
              Quantite_Consultation: quantite,
            }
          : {}),

        ...(Motif_Consultation !== undefined
          ? {
              Motif_Consultation: Motif_Consultation.trim(),
            }
          : {}),

        ...(Description_Consultation !== undefined
          ? {
              Description_Consultation: Description_Consultation.trim(),
            }
          : {}),

        ...(Commentaire_Consultation !== undefined
          ? {
              Commentaire_Consultation:
                typeof Commentaire_Consultation === "string" &&
                Commentaire_Consultation.trim()
                  ? Commentaire_Consultation.trim()
                  : null,
            }
          : {}),
      },

      include: consultationInclude,
    });

    const newPrestationId = ID_Prestation ?? existingConsultation.ID_Prestation;

    if (oldPrestationId !== newPrestationId) {
      await recalculatePrestationAmount(oldPrestationId);
    }

    await recalculatePrestationAmount(newPrestationId);

    const updatedConsultation = await prisma.t_Consultations.findUnique({
      where: {
        ID_Consultation: id,
      },
      include: consultationInclude,
    });

    return res.json(updatedConsultation);
  } catch (error) {
    console.error("Update consultation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deleteConsultation(req, res) {
  try {
    const { id } = req.params;

    const existingConsultation = await prisma.t_Consultations.findUnique({
      where: {
        ID_Consultation: id,
      },
    });

    if (!existingConsultation) {
      return res.status(404).json({
        error: "Consultation non trouvée",
      });
    }

    const prestationId = existingConsultation.ID_Prestation;

    await prisma.t_Consultations.delete({
      where: {
        ID_Consultation: id,
      },
    });

    await recalculatePrestationAmount(prestationId);

    return res.json({
      message: "Consultation supprimée",
    });

  } catch (error) {
    console.error("Delete consultation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
