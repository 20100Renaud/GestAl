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

function paiementOwnerWhere(userId) {
  return {
    Prestation_Paiement: {
      is: {
        Proprietaire_Prestation: {
          is: {
            ID_User: userId,
          },
        },
      },
    },
  };
}

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

function validateEncaissement({
  dateEncaissement,
  montant,
  moyenPaiement,
  hasType,
}) {
  if (!dateEncaissement) {
    return null;
  }

  if (!(montant > 0)) {
    return "Un montant supérieur à zéro est nécessaire pour encaisser.";
  }

  if (!moyenPaiement) {
    return "Un moyen de paiement est nécessaire pour encaisser.";
  }

  if (!hasType) {
    return "Un type de paiement est nécessaire pour encaisser.";
  }

  return null;
}

export async function getPaiements(req, res) {
  try {
    const paiements = await prisma.t_Paiements.findMany({
      where: paiementOwnerWhere(req.user.userId),
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

    const paiement = await prisma.t_Paiements.findFirst({
      where: {
        ID_Paiement: id,
        ...paiementOwnerWhere(req.user.userId),
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
      Date_Declaration,
      Montant_Paiement,
      Moyen_Paiement,
    } = req.body;

    if (typeof ID_Prestation !== "string" || !ID_Prestation.trim()) {
      return res.status(400).json({
        error: "ID_Prestation is required",
      });
    }

    const prestation = await prisma.t_Prestations.findFirst({
      where: {
        ID_Prestation,
        Proprietaire_Prestation: {
          is: {
            ID_User: req.user.userId,
          },
        },
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

    const encaissementDate = parseDate(Date_Encaissement, "Date_Encaissement", {
      nullable: true,
    });

    if (encaissementDate?.error) {
      return res.status(400).json(encaissementDate);
    }

    const declarationDate = parseDate(Date_Declaration, "Date_Declaration", {
      nullable: true,
    });

    if (declarationDate?.error) {
      return res.status(400).json(declarationDate);
    }

    const validationError = validateEncaissement({
      dateEncaissement: encaissementDate,
      montant,
      moyenPaiement: hasMoyen,
      hasType,
    });

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    if (declarationDate && !encaissementDate) {
      return res.status(400).json({
        error: "Un paiement doit être encaissé avant d'être déclaré.",
      });
    }

    const data = {
      ID_Prestation: ID_Prestation.trim(),
      Montant_Paiement: montant,

      Moyen_Paiement: hasMoyen ? Moyen_Paiement.trim() : null,

      E_Reporting_Paiement: paymentTypes.eReporting,
      E_Facture_Paiement: paymentTypes.eFacture,
      E_Other_Paiement: paymentTypes.eOther,

      Date_Encaissement: encaissementDate,
      Date_Declaration: declarationDate,
    };

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

    const existingPaiement = await prisma.t_Paiements.findFirst({
      where: {
        ID_Paiement: id,
        ...paiementOwnerWhere(req.user.userId),
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
      Date_Declaration,
      Montant_Paiement,
      Moyen_Paiement,
      E_Reporting_Paiement,
      E_Facture_Paiement,
      E_Other_Paiement,
    } = req.body;

    const prestationId =
      ID_Prestation !== undefined
        ? ID_Prestation
        : existingPaiement.ID_Prestation;

    if (typeof prestationId !== "string" || !prestationId.trim()) {
      return res.status(400).json({
        error: "ID_Prestation is required",
      });
    }

    const montant = parseAmount(
      Montant_Paiement !== undefined
        ? Montant_Paiement
        : existingPaiement.Montant_Paiement,
    );

    if (montant === null) {
      return res.status(400).json({
        error: "Montant invalide",
      });
    }

    const moyenPaiementFinal =
      Moyen_Paiement !== undefined
        ? Moyen_Paiement
        : existingPaiement.Moyen_Paiement;

    if (
      moyenPaiementFinal !== null &&
      moyenPaiementFinal !== undefined &&
      typeof moyenPaiementFinal !== "string"
    ) {
      return res.status(400).json({
        error: "Moyen_Paiement is invalid",
      });
    }

    const hasMoyen =
      typeof moyenPaiementFinal === "string" &&
      moyenPaiementFinal.trim() !== "";

    const paymentTypes = validatePaymentTypes({
      E_Reporting_Paiement:
        E_Reporting_Paiement !== undefined
          ? E_Reporting_Paiement
          : existingPaiement.E_Reporting_Paiement,

      E_Facture_Paiement:
        E_Facture_Paiement !== undefined
          ? E_Facture_Paiement
          : existingPaiement.E_Facture_Paiement,

      E_Other_Paiement:
        E_Other_Paiement !== undefined
          ? E_Other_Paiement
          : existingPaiement.E_Other_Paiement,
    });

    if (paymentTypes.error) {
      return res.status(400).json({
        error: paymentTypes.error,
      });
    }

    const hasType =
      paymentTypes.eReporting || paymentTypes.eFacture || paymentTypes.eOther;


    const prestation = await prisma.t_Prestations.findFirst({
      where: {
        ID_Prestation: prestationId.trim(),
        Proprietaire_Prestation: {
          is: {
            ID_User: req.user.userId,
          },
        },
      },
    });

    if (!prestation) {
      return res.status(404).json({
        error: "Prestation not found",
      });
    }

    if (existingPaiement.Date_Declaration) {
      const forbiddenChanges = [];

      if (prestationId !== existingPaiement.ID_Prestation) {
        forbiddenChanges.push("Prestation");
      }

      if (
        Montant_Paiement !== undefined &&
        montant !== Number(existingPaiement.Montant_Paiement)
      ) {
        forbiddenChanges.push("Montant");
      }

      if (
        Moyen_Paiement !== undefined &&
        (moyenPaiementFinal?.trim() || null) !==
          (existingPaiement.Moyen_Paiement || null)
      ) {
        forbiddenChanges.push("Moyen de paiement");
      }

      if (
        E_Reporting_Paiement !== undefined &&
        paymentTypes.eReporting !== existingPaiement.E_Reporting_Paiement
      ) {
        forbiddenChanges.push("Type de paiement");
      }

      if (
        E_Facture_Paiement !== undefined &&
        paymentTypes.eFacture !== existingPaiement.E_Facture_Paiement
      ) {
        forbiddenChanges.push("Type de paiement");
      }

      if (
        E_Other_Paiement !== undefined &&
        paymentTypes.eOther !== existingPaiement.E_Other_Paiement
      ) {
        forbiddenChanges.push("Type de paiement");
      }

      if (Date_Declaration !== undefined) {
        const newDeclarationDate = parseDate(
          Date_Declaration,
          "Date_Declaration",
          { nullable: true },
        );

        if (newDeclarationDate?.error) {
          return res.status(400).json(newDeclarationDate);
        }

        if (
          !newDeclarationDate ||
          newDeclarationDate.getTime() !==
            existingPaiement.Date_Declaration.getTime()
        ) {
          forbiddenChanges.push("Date de déclaration");
        }
      }

      if (forbiddenChanges.length > 0) {
        return res.status(403).json({
          error:
            "Ce paiement est déjà déclaré. Seules la date de réception et la date d'encaissement peuvent être modifiées.",
        });
      }

      const data = {};

      if (Date_Paiement !== undefined) {
        const paiementDate = parseDate(Date_Paiement, "Date_Paiement");

        if (paiementDate?.error) {
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

        if (encaissementDate?.error) {
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
    }

    const encaissementDate =
      Date_Encaissement !== undefined
        ? parseDate(Date_Encaissement, "Date_Encaissement", { nullable: true })
        : existingPaiement.Date_Encaissement;

    if (encaissementDate?.error) {
      return res.status(400).json(encaissementDate);
    }

    const declarationDate =
      Date_Declaration !== undefined
        ? parseDate(Date_Declaration, "Date_Declaration", { nullable: true })
        : existingPaiement.Date_Declaration;

    if (declarationDate?.error) {
      return res.status(400).json(declarationDate);
    }

    const validationError = validateEncaissement({
      dateEncaissement: encaissementDate,
      montant,
      moyenPaiement: hasMoyen,
      hasType,
    });

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    if (declarationDate && !encaissementDate) {
      return res.status(400).json({
        error: "Un paiement doit être encaissé avant d'être déclaré.",
      });
    }

    const data = {
      ID_Prestation: prestationId.trim(),
      Montant_Paiement: montant,

      Moyen_Paiement: hasMoyen ? moyenPaiementFinal.trim() : null,

      E_Reporting_Paiement: paymentTypes.eReporting,
      E_Facture_Paiement: paymentTypes.eFacture,
      E_Other_Paiement: paymentTypes.eOther,

      Date_Encaissement: encaissementDate,
      Date_Declaration: declarationDate,
    };

    if (Date_Paiement !== undefined) {
      const paiementDate = parseDate(Date_Paiement, "Date_Paiement");

      if (paiementDate?.error) {
        return res.status(400).json(paiementDate);
      }

      data.Date_Paiement = paiementDate;
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

    const existingPaiement = await prisma.t_Paiements.findFirst({
      where: {
        ID_Paiement: id,
        ...paiementOwnerWhere(req.user.userId),
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
