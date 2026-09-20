import prisma from "../lib/prisma.js";

export async function getConsultations(req, res) {
  try {
    const consultations = await prisma.t_Consultations.findMany({
      orderBy: {
        Date_Consultation: "desc",
      },
      include: {
        Animal_Consultation: {
          include: {
            Proprietaire_Animal: true,
          },
        },
      },
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
      include: {
        Animal_Consultation: {
          include: {
            Proprietaire_Animal: true,
          },
        },
      },
    });

    if (!consultation) {
      return res.status(404).json({
        error: "Consultation not found",
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
      ID_Lieu,
      ID_Animal,
      Date_Consultation,
      Quantite_Consultation,
      Motif_Consultation,
      Description_Consultation,
      Commentaire_Consultation,
    } = req.body;

    if (
      typeof ID_Lieu !== "string" ||
      !ID_Lieu.trim() ||
      typeof ID_Animal !== "string" ||
      !ID_Animal.trim() ||
      typeof Motif_Consultation !== "string" ||
      !Motif_Consultation.trim() ||
      typeof Description_Consultation !== "string" ||
      !Description_Consultation.trim()
    ) {
      return res.status(400).json({
        error: "ID_Lieu, ID_Animal, motif and description are required",
      });
    }

    const animal = await prisma.t_Animaux.findUnique({
      where: {
        ID_Animal,
      },
    });

    if (!animal) {
      return res.status(404).json({
        error: "Animal not found",
      });
    }

    const proprietaire = await prisma.t_Proprietaires.findUnique({
      where: {
        ID_Proprietaire: ID_Lieu,
      },
    });

    if (!proprietaire) {
      return res.status(404).json({
        error: "Proprietaire not found",
      });
    }

    const consultation = await prisma.t_Consultations.create({
      data: {
        ID_Lieu,
        ID_Animal,
        ...(Date_Consultation
          ? {
              Date_Consultation: new Date(Date_Consultation),
            }
          : {}),
        ...(Quantite_Consultation !== undefined
          ? {
              Quantite_Consultation: Quantite_Consultation,
            }
          : {}),
        Motif_Consultation: Motif_Consultation.trim(),
        Description_Consultation: Description_Consultation.trim(),
        Commentaire_Consultation:
          typeof Commentaire_Consultation === "string" &&
          Commentaire_Consultation.trim()
            ? Commentaire_Consultation.trim()
            : null,
      },
      include: {
        Animal_Consultation: {
          include: {
            Proprietaire_Animal: true,
          },
        },
      },
    });

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
        error: "Consultation not found",
      });
    }

    const {
      ID_Lieu,
      ID_Animal,
      Date_Consultation,
      Quantite_Consultation,
      Motif_Consultation,
      Description_Consultation,
      Commentaire_Consultation,
    } = req.body;

    if (
      ID_Lieu !== undefined &&
      (typeof ID_Lieu !== "string" || !ID_Lieu.trim())
    ) {
      return res.status(400).json({
        error: "Invalid ID_Lieu",
      });
    }

    if (
      ID_Animal !== undefined &&
      (typeof ID_Animal !== "string" || !ID_Animal.trim())
    ) {
      return res.status(400).json({
        error: "Invalid ID_Animal",
      });
    }

    if (
      Motif_Consultation !== undefined &&
      (typeof Motif_Consultation !== "string" || !Motif_Consultation.trim())
    ) {
      return res.status(400).json({
        error: "Invalid motif",
      });
    }

    if (
      Description_Consultation !== undefined &&
      (typeof Description_Consultation !== "string" ||
        !Description_Consultation.trim())
    ) {
      return res.status(400).json({
        error: "Invalid description",
      });
    }

    if (ID_Animal !== undefined) {
      const animal = await prisma.t_Animaux.findUnique({
        where: {
          ID_Animal,
        },
      });

      if (!animal) {
        return res.status(404).json({
          error: "Animal not found",
        });
      }
    }

    if (ID_Lieu !== undefined) {
      const proprietaire = await prisma.t_Proprietaires.findUnique({
        where: {
          ID_Proprietaire: ID_Lieu,
        },
      });

      if (!proprietaire) {
        return res.status(404).json({
          error: "Proprietaire not found",
        });
      }
    }

    const consultation = await prisma.t_Consultations.update({
      where: {
        ID_Consultation: id,
      },
      data: {
        ...(ID_Lieu !== undefined ? { ID_Lieu } : {}),
        ...(ID_Animal !== undefined ? { ID_Animal } : {}),
        ...(Date_Consultation !== undefined
          ? {
              Date_Consultation: new Date(Date_Consultation),
            }
          : {}),
        ...(Quantite_Consultation !== undefined
          ? {
              Quantite_Consultation,
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
      include: {
        Animal_Consultation: {
          include: {
            Proprietaire_Animal: true,
          },
        },
      },
    });

    return res.json(consultation);
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
        error: "Consultation not found",
      });
    }

    await prisma.t_Consultations.delete({
      where: {
        ID_Consultation: id,
      },
    });

    return res.json({
      message: "Consultation deleted",
    });
  } catch (error) {
    console.error("Delete consultation error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
