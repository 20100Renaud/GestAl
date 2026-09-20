import prisma from "../lib/prisma.js";

export async function getDeplacements(req, res) {
  try {
    const deplacements = await prisma.t_Deplacements.findMany({
      orderBy: [
        {
          Annee_Deplacement: "desc",
        },
        {
          Denomination_Deplacement: "asc",
        },
      ],
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

export async function getDeplacement(req, res) {
  try {
    const { id } = req.params;

    const deplacement = await prisma.t_Deplacements.findUnique({
      where: {
        ID_Deplacement: id,
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

    const deplacement = await prisma.t_Deplacements.create({
      data: {
        Annee_Deplacement: Annee_Deplacement.trim(),
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

export async function updateDeplacement(req, res) {
  try {
    const { id } = req.params;

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

    const existingDeplacement = await prisma.t_Deplacements.findUnique({
      where: {
        ID_Deplacement: id,
      },
    });

    if (!existingDeplacement) {
      return res.status(404).json({
        error: "Deplacement not found",
      });
    }

    const deplacement = await prisma.t_Deplacements.update({
      where: {
        ID_Deplacement: id,
      },
      data: {
        Annee_Deplacement: Annee_Deplacement.trim(),
        Denomination_Deplacement: Denomination_Deplacement.trim(),
        Montant_Deplacement: montant,
      },
    });

    return res.status(200).json(deplacement);
  } catch (error) {
    console.error("Update deplacement error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deleteDeplacement(req, res) {
  try {
    const { id } = req.params;

    const existingDeplacement = await prisma.t_Deplacements.findUnique({
      where: {
        ID_Deplacement: id,
      },
    });

    if (!existingDeplacement) {
      return res.status(404).json({
        error: "Deplacement not found",
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
