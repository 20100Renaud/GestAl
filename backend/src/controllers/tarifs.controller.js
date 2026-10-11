import prisma from "../lib/prisma.js";

export async function getTarifs(req, res) {
  try {
    const tarifs = await prisma.t_Tarifs.findMany({
      where: {
        ID_User: req.user.userId,
      },
      orderBy: [
        { Annee_Tarif: "desc" },
        { Denomination_Tarif: "asc" }
      ],
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
