import prisma from "../lib/prisma.js";

function validateProprietaireData(body) {
  const requiredFields = [
    "nom",
    "prenom",
    "email",
    "adresse",
    "ville",
    "cp",
    "tel",
  ];

  for (const field of requiredFields) {
    if (typeof body[field] !== "string" || body[field].trim().length === 0) {
      return `${field} is required`;
    }
  }

  if (body.civilite !== undefined && typeof body.civilite !== "string") {
    return "civilite must be a string";
  }

  if (
    body.raisonSociale !== undefined &&
    typeof body.raisonSociale !== "string"
  ) {
    return "raisonSociale must be a string";
  }

  if (
    body.etablissement !== undefined &&
    typeof body.etablissement !== "string"
  ) {
    return "etablissement must be a string";
  }

  return null;
}

function normalizeNom(value) {
  return typeof value === "string" ? value.trim().toUpperCase() : "";
}

function normalizePrenom(value) {
  return typeof value === "string"
    ? value
        .trim()
        .toLowerCase()
        .replace(/(^|[\s-])(\p{L})/gu, (_, separator, letter) => {
          return separator + letter.toUpperCase();
        })
    : "";
}

function normalizeData(body) {
  return {
    Raison_sociale:
      typeof body.raisonSociale === "string" && body.raisonSociale.trim()
        ? body.raisonSociale.trim()
        : "Particulier",

    Etablissement:
      typeof body.etablissement === "string"
        ? body.etablissement.trim() || null
        : null,

    Civilite_Proprietaire:
      typeof body.civilite === "string" ? body.civilite.trim() || null : null,

    Nom_Proprietaire: normalizeNom(body.nom),
    Prenom_Proprietaire: normalizePrenom(body.prenom),
    Email_Proprietaire: body.email.toLowerCase().trim(),
    Adresse_Proprietaire: body.adresse.trim(),
    Ville_Proprietaire: body.ville.trim(),
    CP_Proprietaire: body.cp.trim(),
    Tel_Proprietaire: body.tel.trim(),
  };
}

export async function getProprietaires(req, res) {
  try {
    const proprietaires = await prisma.t_Proprietaires.findMany({
      orderBy: [
        {
          Nom_Proprietaire: "asc",
        },
        {
          Prenom_Proprietaire: "asc",
        },
      ],
    });

    return res.status(200).json({
      proprietaires,
    });
  } catch (error) {
    console.error("Get proprietaires error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getProprietaire(req, res) {
  try {
    const { id } = req.params;

    const proprietaire = await prisma.t_Proprietaires.findUnique({
      where: {
        ID_Proprietaire: id,
      },
    });

    if (!proprietaire) {
      return res.status(404).json({
        error: "Proprietaire not found",
      });
    }

    return res.status(200).json({
      proprietaire,
    });
  } catch (error) {
    console.error("Get proprietaire error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function createProprietaire(req, res) {
  try {
    const validationError = validateProprietaireData(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const data = normalizeData(req.body);

    const proprietaire = await prisma.t_Proprietaires.create({
      data: {
        ...data,

        User_Proprietaires: {
          connect: {
            ID_User: req.user.userId,
          },
        },
      },
    });

    return res.status(201).json({
      proprietaire,
    });
  } catch (error) {
    console.error("Create proprietaire error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updateProprietaire(req, res) {
  try {
    const { id } = req.params;

    const validationError = validateProprietaireData(req.body);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    const existing = await prisma.t_Proprietaires.findUnique({
      where: {
        ID_Proprietaire: id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Proprietaire not found",
      });
    }

    const data = normalizeData(req.body);

    const proprietaire = await prisma.t_Proprietaires.update({
      where: {
        ID_Proprietaire: id,
      },
      data,
    });

    return res.status(200).json({
      proprietaire,
    });
  } catch (error) {
    console.error("Update proprietaire error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deleteProprietaire(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.t_Proprietaires.findUnique({
      where: {
        ID_Proprietaire: id,
      },
    });

    if (!existing) {
      return res.status(404).json({
        error: "Proprietaire not found",
      });
    }

    const lieuTexte =
      typeof existing.Etablissement === "string" &&
      existing.Etablissement.trim()
        ? existing.Etablissement.trim()
        : existing.Nom_Proprietaire.trim();

    await prisma.$transaction(async (tx) => {
      await tx.t_Consultations.updateMany({
        where: {
          ID_Lieu: id,
        },
        data: {
          Lieu_Consultation_Texte: lieuTexte,
          ID_Lieu: null,
        },
      });

      await tx.t_Proprietaires.delete({
        where: {
          ID_Proprietaire: id,
        },
      });
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete proprietaire error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

