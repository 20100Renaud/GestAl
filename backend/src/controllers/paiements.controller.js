import prisma from "../lib/prisma.js";

const paiementInclude = {
  Prestation_Paiement: {
    include: {
      Proprietaire_Prestation: true,
      Lieu_Prestation: true,
      Deplacement_Prestation: true,
      Consultations_Prestation: {
        include: {
          Tarif_Consultation: true,
          Animal_Consultation: {
            include: {
              Proprietaire_Animal: true,
            },
          },
        },
      },
    },
  },
};

function parseDate(value, fieldName, { nullable = false } = {}) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    if (nullable) {
      return null;
    }

    return {
      error: `${fieldName} is invalid`,
    };
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return {
      error: `${fieldName} is invalid`,
    };
  }

  return date;
}

function validatePaymentTypes(body) {
  const { E_Reporting_Paiement, E_Facture_Paiement, E_Other_Paiement } = body;

  const checkboxFields = [
    ["E_Reporting_Paiement", E_Reporting_Paiement],
    ["E_Facture_Paiement", E_Facture_Paiement],
    ["E_Other_Paiement", E_Other_Paiement],
  ];

  for (const [field, value] of checkboxFields) {
    if (value !== undefined && typeof value !== "boolean") {
      return {
        error: `${field} must be a boolean`,
      };
    }
  }

  const eReporting = E_Reporting_Paiement === true;
  const eFacture = E_Facture_Paiement === true;
  const eOther = E_Other_Paiement === true;

  const selectedCount = Number(eReporting) + Number(eFacture) + Number(eOther);

  if (selectedCount > 1) {
    return {
      error: "Only one payment type can be selected",
    };
  }

  return {
    eReporting,
    eFacture,
    eOther,
  };
}

function parseAmount(value) {
  if (value === undefined || value === "") {
    return 0;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return null;
  }

  return amount;
}

export async function getPaiements(req, res) {
  try {
    const paiements = await prisma.t_Paiements.findMany({
      orderBy: {
        Date_Paiement: "desc",
      },
      include: paiementInclude,
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
      include: paiementInclude,
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
      ID_Prestation,
      Date_Encaissement,
      Montant_Paiement,
      Moyen_Paiement,
      E_Reporting_Paiement,
      E_Facture_Paiement,
      E_Other_Paiement,
    } = req.body;

    if (typeof ID_Prestation !== "string" || !ID_Prestation.trim()) {
      return res.status(400).json({
        error: "ID_Prestation is required",
      });
    }

    const prestation = await prisma.t_Prestations.findUnique({
      where: {
        ID_Prestation,
      },
    });

    if (!prestation) {
      return res.status(404).json({
        error: "Prestation not found",
      });
    }

    const paymentTypes = validatePaymentTypes(req.body);

    if (paymentTypes.error) {
      return res.status(400).json({
        error: paymentTypes.error,
      });
    }

    const montant = parseAmount(Montant_Paiement);

    if (montant === null) {
      return res.status(400).json({
        error: "Montant invalide",
      });
    }

    const hasMoyen =
      typeof Moyen_Paiement === "string" && Moyen_Paiement.trim() !== "";

    const hasType =
      paymentTypes.eReporting || paymentTypes.eFacture || paymentTypes.eOther;

    if (Date_Encaissement && (!hasMoyen || !hasType)) {
      return res.status(400).json({
        error:
          "Moyen_Paiement and payment type are required for Date_Encaissement",
      });
    }

    const data = {
      ID_Prestation: ID_Prestation.trim(),

      Montant_Paiement: montant,

      Moyen_Paiement:
        typeof Moyen_Paiement === "string" && Moyen_Paiement.trim()
          ? Moyen_Paiement.trim()
          : null,

      E_Reporting_Paiement: paymentTypes.eReporting,
      E_Facture_Paiement: paymentTypes.eFacture,
      E_Other_Paiement: paymentTypes.eOther,
    };

    const encaissementDate = parseDate(Date_Encaissement, "Date_Encaissement", {
      nullable: true,
    });

    if (
      encaissementDate &&
      typeof encaissementDate === "object" &&
      encaissementDate.error
    ) {
      return res.status(400).json(encaissementDate);
    }

    if (encaissementDate !== undefined) {
      data.Date_Encaissement = encaissementDate;
    }

    const paiement = await prisma.t_Paiements.create({
      data,
      include: paiementInclude,
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

    const {
      ID_Prestation,
      Date_Paiement,
      Date_Encaissement,
      Montant_Paiement,
      Moyen_Paiement,
      E_Reporting_Paiement,
      E_Facture_Paiement,
      E_Other_Paiement,
    } = req.body;

    if (typeof ID_Prestation !== "string" || !ID_Prestation.trim()) {
      return res.status(400).json({
        error: "ID_Prestation is required",
      });
    }

    const prestation = await prisma.t_Prestations.findUnique({
      where: {
        ID_Prestation,
      },
    });

    if (!prestation) {
      return res.status(404).json({
        error: "Prestation not found",
      });
    }

    const paymentTypes = validatePaymentTypes(req.body);

    if (paymentTypes.error) {
      return res.status(400).json({
        error: paymentTypes.error,
      });
    }

    const montant = parseAmount(Montant_Paiement);

    if (montant === null) {
      return res.status(400).json({
        error: "Montant invalide",
      });
    }

    const hasMoyen =
      typeof Moyen_Paiement === "string" && Moyen_Paiement.trim() !== "";

    const hasType =
      paymentTypes.eReporting || paymentTypes.eFacture || paymentTypes.eOther;

    if (Date_Encaissement && (!hasMoyen || !hasType)) {
      return res.status(400).json({
        error:
          "Moyen_Paiement and payment type are required for Date_Encaissement",
      });
    }

    const data = {
      ID_Prestation: ID_Prestation.trim(),

      Montant_Paiement: montant,

      Moyen_Paiement:
        typeof Moyen_Paiement === "string" && Moyen_Paiement.trim()
          ? Moyen_Paiement.trim()
          : null,

      E_Reporting_Paiement: paymentTypes.eReporting,
      E_Facture_Paiement: paymentTypes.eFacture,
      E_Other_Paiement: paymentTypes.eOther,
    };

    if (Date_Paiement !== undefined) {
      const paiementDate = parseDate(Date_Paiement, "Date_Paiement");

      if (
        paiementDate &&
        typeof paiementDate === "object" &&
        paiementDate.error
      ) {
        return res.status(400).json(paiementDate);
      }

      data.Date_Paiement = paiementDate;
    }

    if (Date_Encaissement !== undefined) {
      const encaissementDate = parseDate(
        Date_Encaissement,
        "Date_Encaissement",
        { nullable: true },
      );

      if (
        encaissementDate &&
        typeof encaissementDate === "object" &&
        encaissementDate.error
      ) {
        return res.status(400).json(encaissementDate);
      }

      data.Date_Encaissement = encaissementDate;
    }

    const paiement = await prisma.t_Paiements.update({
      where: {
        ID_Paiement: id,
      },
      data,
      include: paiementInclude,
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
