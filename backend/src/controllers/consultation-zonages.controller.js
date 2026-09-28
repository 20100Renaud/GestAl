import prisma from "../lib/prisma.js";

export async function getConsultationZonages(req, res) {
  try {
    const { consultationId } = req.params;

    const consultation = await prisma.t_Consultations.findUnique({
      where: {
        ID_Consultation: consultationId,
      },
    });

    if (!consultation) {
      return res.status(404).json({
        error: "Consultation not found",
      });
    }

    const consultationZonages = await prisma.t_Consultation_Zonages.findMany({
      where: {
        ID_Consultation: consultationId,
      },
      include: {
        Zonage: true,
      },
      orderBy: {
        Zonage: {
          Nom_Zonage: "asc",
        },
      },
    });

    return res.json(consultationZonages);
  } catch (error) {
    console.error("Get consultation zonages error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function createConsultationZonage(req, res) {
  try {
    const { consultationId } = req.params;
    const { ID_Zonage, Commentaire_Zonage } = req.body;

    if (typeof ID_Zonage !== "string" || !ID_Zonage.trim()) {
      return res.status(400).json({
        error: "ID_Zonage is required",
      });
    }

    const consultation = await prisma.t_Consultations.findUnique({
      where: {
        ID_Consultation: consultationId,
      },
    });

    if (!consultation) {
      return res.status(404).json({
        error: "Consultation not found",
      });
    }

    const zonage = await prisma.t_Zonages.findUnique({
      where: {
        ID_Zonage,
      },
    });

    if (!zonage) {
      return res.status(404).json({
        error: "Zonage not found",
      });
    }

    const existing = await prisma.t_Consultation_Zonages.findUnique({
      where: {
        ID_Consultation_ID_Zonage: {
          ID_Consultation: consultationId,
          ID_Zonage,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        error: "Zonage already assigned to this consultation",
      });
    }

    const consultationZonage = await prisma.t_Consultation_Zonages.create({
      data: {
        ID_Consultation: consultationId,
        ID_Zonage,
        Commentaire_Zonage:
          typeof Commentaire_Zonage === "string" && Commentaire_Zonage.trim()
            ? Commentaire_Zonage.trim()
            : null,
      },
      include: {
        Zonage: true,
      },
    });

    return res.status(201).json(consultationZonage);
  } catch (error) {
    console.error("Create consultation zonage error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updateConsultationZonage(req, res) {
  try {
    const { consultationId, zonageId } = req.params;
    const { Commentaire_Zonage } = req.body;

    const existing = await prisma.t_Consultation_Zonages.findUnique({
      where: {
        ID_Consultation_ID_Zonage: {
          ID_Consultation: consultationId,
          ID_Zonage: zonageId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Consultation zonage not found",
      });
    }

    const consultationZonage = await prisma.t_Consultation_Zonages.update({
      where: {
        ID_Consultation_ID_Zonage: {
          ID_Consultation: consultationId,
          ID_Zonage: zonageId,
        },
      },
      data: {
        Commentaire_Zonage:
          typeof Commentaire_Zonage === "string" && Commentaire_Zonage.trim()
            ? Commentaire_Zonage.trim()
            : null,
      },
      include: {
        Zonage: true,
      },
    });

    return res.json(consultationZonage);
  } catch (error) {
    console.error("Update consultation zonage error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deleteConsultationZonage(req, res) {
  try {
    const { consultationId, zonageId } = req.params;

    const existing = await prisma.t_Consultation_Zonages.findUnique({
      where: {
        ID_Consultation_ID_Zonage: {
          ID_Consultation: consultationId,
          ID_Zonage: zonageId,
        },
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Consultation zonage not found",
      });
    }

    await prisma.t_Consultation_Zonages.delete({
      where: {
        ID_Consultation_ID_Zonage: {
          ID_Consultation: consultationId,
          ID_Zonage: zonageId,
        },
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete consultation zonage error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
