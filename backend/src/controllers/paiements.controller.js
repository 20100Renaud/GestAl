import prisma from "../lib/prisma.js";

export async function getPaiements(req, res) {
  try {
    const paiements = await prisma.t_Paiements.findMany({
      orderBy: {
        Date_Paiement: "desc",
      },
      include: {
        Consultation_Paiement: true,
        Tarif_Paiements: true,
        Deplacement_Paiements: true,
      },
    });

    return res.json(paiements);
  } catch (error) {
    console.error("Get paiements error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getPaiement(req, res) {
  try {
    const { id } = req.params;

    const paiement = await prisma.t_Paiements.findUnique({
      where: {
        ID_Paiement: id,
      },
      include: {
        Consultation_Paiement: true,
        Tarif_Paiements: true,
        Deplacement_Paiements: true,
      },
    });

    if (!paiement) {
      return res.status(404).json({
        error: "Paiement not found",
      });
    }

    return res.json(paiement);
  } catch (error) {
    console.error("Get paiement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function createPaiement(req, res) {
  try {
    const {
      ID_Consultation,
      ID_Tarif,
      ID_Deplacement,
      Date_Paiement,
      Montant_Paiement,
      Remise_Paiement,
      Moyen_Paiement,
      Selection_Paiement,
    } = req.body;

    if (
      typeof ID_Consultation !== "string" ||
      !ID_Consultation.trim() ||
      typeof ID_Tarif !== "string" ||
      !ID_Tarif.trim() ||
      typeof ID_Deplacement !== "string" ||
      !ID_Deplacement.trim()
    ) {
      return res.status(400).json({
        error: "ID_Consultation, ID_Tarif and ID_Deplacement are required",
      });
    }

    const [consultation, tarif, deplacement] = await Promise.all([
      prisma.t_Consultations.findUnique({
        where: {
          ID_Consultation,
        },
      }),
      prisma.t_Tarifs.findUnique({
        where: {
          ID_Tarif,
        },
      }),
      prisma.t_Deplacements.findUnique({
        where: {
          ID_Deplacement,
        },
      }),
    ]);

    if (!consultation) {
      return res.status(404).json({
        error: "Consultation not found",
      });
    }

    if (!tarif) {
      return res.status(404).json({
        error: "Tarif not found",
      });
    }

    if (!deplacement) {
      return res.status(404).json({
        error: "Deplacement not found",
      });
    }

    const data = {
      ID_Consultation,
      ID_Tarif,
      ID_Deplacement,
      Montant_Paiement:
        Montant_Paiement !== undefined && Montant_Paiement !== ""
          ? Montant_Paiement
          : 0,
      Remise_Paiement:
        Remise_Paiement !== undefined && Remise_Paiement !== ""
          ? Remise_Paiement
          : 0,
      Moyen_Paiement:
        typeof Moyen_Paiement === "string" && Moyen_Paiement.trim()
          ? Moyen_Paiement.trim()
          : null,
      Selection_Paiement:
        typeof Selection_Paiement === "boolean" ? Selection_Paiement : false,
    };

    if (Date_Paiement) {
      data.Date_Paiement = new Date(Date_Paiement);
    }

    const paiement = await prisma.t_Paiements.create({
      data,
      include: {
        Consultation_Paiement: true,
        Tarif_Paiements: true,
        Deplacement_Paiements: true,
      },
    });

    return res.status(201).json(paiement);
  } catch (error) {
    console.error("Create paiement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updatePaiement(req, res) {
  try {
    const { id } = req.params;

    const {
      ID_Consultation,
      ID_Tarif,
      ID_Deplacement,
      Date_Paiement,
      Montant_Paiement,
      Remise_Paiement,
      Moyen_Paiement,
      Selection_Paiement,
    } = req.body;

    if (
      typeof ID_Consultation !== "string" ||
      !ID_Consultation.trim() ||
      typeof ID_Tarif !== "string" ||
      !ID_Tarif.trim() ||
      typeof ID_Deplacement !== "string" ||
      !ID_Deplacement.trim()
    ) {
      return res.status(400).json({
        error: "ID_Consultation, ID_Tarif and ID_Deplacement are required",
      });
    }

    const existingPaiement = await prisma.t_Paiements.findUnique({
      where: {
        ID_Paiement: id,
      },
    });

    if (!existingPaiement) {
      return res.status(404).json({
        error: "Paiement not found",
      });
    }

    const [consultation, tarif, deplacement] = await Promise.all([
      prisma.t_Consultations.findUnique({
        where: {
          ID_Consultation,
        },
      }),
      prisma.t_Tarifs.findUnique({
        where: {
          ID_Tarif,
        },
      }),
      prisma.t_Deplacements.findUnique({
        where: {
          ID_Deplacement,
        },
      }),
    ]);

    if (!consultation) {
      return res.status(404).json({
        error: "Consultation not found",
      });
    }

    if (!tarif) {
      return res.status(404).json({
        error: "Tarif not found",
      });
    }

    if (!deplacement) {
      return res.status(404).json({
        error: "Deplacement not found",
      });
    }

    const data = {
      ID_Consultation,
      ID_Tarif,
      ID_Deplacement,
      Montant_Paiement:
        Montant_Paiement !== undefined && Montant_Paiement !== ""
          ? Montant_Paiement
          : 0,
      Remise_Paiement:
        Remise_Paiement !== undefined && Remise_Paiement !== ""
          ? Remise_Paiement
          : 0,
      Moyen_Paiement:
        typeof Moyen_Paiement === "string" && Moyen_Paiement.trim()
          ? Moyen_Paiement.trim()
          : null,
      Selection_Paiement:
        typeof Selection_Paiement === "boolean" ? Selection_Paiement : false,
    };

    if (Date_Paiement) {
      data.Date_Paiement = new Date(Date_Paiement);
    }

    const paiement = await prisma.t_Paiements.update({
      where: {
        ID_Paiement: id,
      },
      data,
      include: {
        Consultation_Paiement: true,
        Tarif_Paiements: true,
        Deplacement_Paiements: true,
      },
    });

    return res.json(paiement);
  } catch (error) {
    console.error("Update paiement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deletePaiement(req, res) {
  try {
    const { id } = req.params;

    const existingPaiement = await prisma.t_Paiements.findUnique({
      where: {
        ID_Paiement: id,
      },
    });

    if (!existingPaiement) {
      return res.status(404).json({
        error: "Paiement not found",
      });
    }

    await prisma.t_Paiements.delete({
      where: {
        ID_Paiement: id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete paiement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
