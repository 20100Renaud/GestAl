import prisma from "../lib/prisma.js";

export async function getAnimals(req, res) {
  try {
    const animals = await prisma.t_Animaux.findMany({
      include: {
        Proprietaire_Animal: true,
      },
      orderBy: {
        Nom_Animal: "asc",
      },
    });

    return res.json(animals);
  } catch (error) {
    console.error("Get animals error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function getAnimal(req, res) {
  try {
    const { id } = req.params;

    const animal = await prisma.t_Animaux.findUnique({
      where: {
        ID_Animal: id,
      },
      include: {
        Proprietaire_Animal: true,
      },
    });

    if (!animal) {
      return res.status(404).json({
        error: "Animal not found",
      });
    }

    return res.json(animal);
  } catch (error) {
    console.error("Get animal error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function createAnimal(req, res) {
  try {
    const {
      ID_Proprietaire,
      Nom_Animal,
      Genre_Animal,
      Race_Animal,
      Date_Naissance_Animal,
      Memo_Animal,
      Sexe_Animal,
    } = req.body;

    if (
      typeof ID_Proprietaire !== "string" ||
      !ID_Proprietaire.trim() ||
      typeof Nom_Animal !== "string" ||
      !Nom_Animal.trim() ||
      typeof Genre_Animal !== "string" ||
      !Genre_Animal.trim() ||
      typeof Date_Naissance_Animal !== "string" ||
      !Date_Naissance_Animal.trim() ||
      typeof Sexe_Animal !== "string" ||
      !Sexe_Animal.trim()
    ) {
      return res.status(400).json({
        error: "Required fields are missing",
      });
    }

    const proprietaire = await prisma.t_Proprietaires.findUnique({
      where: {
        ID_Proprietaire,
      },
    });

    if (!proprietaire) {
      return res.status(400).json({
        error: "Proprietaire not found",
      });
    }

    const dateNaissance = new Date(Date_Naissance_Animal);

    if (Number.isNaN(dateNaissance.getTime())) {
      return res.status(400).json({
        error: "Invalid birth date",
      });
    }

    const animal = await prisma.t_Animaux.create({
      data: {
        ID_Proprietaire,
        Nom_Animal: Nom_Animal.trim(),
        Genre_Animal: Genre_Animal.trim(),
        Race_Animal:
          typeof Race_Animal === "string" && Race_Animal.trim()
            ? Race_Animal.trim()
            : null,
        Date_Naissance_Animal: dateNaissance,
        Memo_Animal:
          typeof Memo_Animal === "string" && Memo_Animal.trim()
            ? Memo_Animal.trim()
            : null,
        Sexe_Animal: Sexe_Animal.trim(),
      },
      include: {
        Proprietaire_Animal: true,
      },
    });

    return res.status(201).json(animal);
  } catch (error) {
    console.error("Create animal error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function updateAnimal(req, res) {
  try {
    const { id } = req.params;

    const existingAnimal = await prisma.t_Animaux.findUnique({
      where: {
        ID_Animal: id,
      },
    });

    if (!existingAnimal) {
      return res.status(404).json({
        error: "Animal not found",
      });
    }

    const {
      ID_Proprietaire,
      Nom_Animal,
      Genre_Animal,
      Race_Animal,
      Date_Naissance_Animal,
      Memo_Animal,
      Sexe_Animal,
    } = req.body;

    if (
      typeof ID_Proprietaire !== "string" ||
      !ID_Proprietaire.trim() ||
      typeof Nom_Animal !== "string" ||
      !Nom_Animal.trim() ||
      typeof Genre_Animal !== "string" ||
      !Genre_Animal.trim() ||
      typeof Date_Naissance_Animal !== "string" ||
      !Date_Naissance_Animal.trim() ||
      typeof Sexe_Animal !== "string" ||
      !Sexe_Animal.trim()
    ) {
      return res.status(400).json({
        error: "Required fields are missing",
      });
    }

    const proprietaire = await prisma.t_Proprietaires.findUnique({
      where: {
        ID_Proprietaire,
      },
    });

    if (!proprietaire) {
      return res.status(400).json({
        error: "Proprietaire not found",
      });
    }

    const dateNaissance = new Date(Date_Naissance_Animal);

    if (Number.isNaN(dateNaissance.getTime())) {
      return res.status(400).json({
        error: "Invalid birth date",
      });
    }

    const animal = await prisma.t_Animaux.update({
      where: {
        ID_Animal: id,
      },
      data: {
        ID_Proprietaire,
        Nom_Animal: Nom_Animal.trim(),
        Genre_Animal: Genre_Animal.trim(),
        Race_Animal:
          typeof Race_Animal === "string" && Race_Animal.trim()
            ? Race_Animal.trim()
            : null,
        Date_Naissance_Animal: dateNaissance,
        Memo_Animal:
          typeof Memo_Animal === "string" && Memo_Animal.trim()
            ? Memo_Animal.trim()
            : null,
        Sexe_Animal: Sexe_Animal.trim(),
      },
      include: {
        Proprietaire_Animal: true,
      },
    });

    return res.json(animal);
  } catch (error) {
    console.error("Update animal error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

export async function deleteAnimal(req, res) {
  try {
    const { id } = req.params;

    const existingAnimal = await prisma.t_Animaux.findUnique({
      where: {
        ID_Animal: id,
      },
    });

    if (!existingAnimal) {
      return res.status(404).json({
        error: "Animal not found",
      });
    }

    await prisma.t_Animaux.delete({
      where: {
        ID_Animal: id,
      },
    });

    return res.status(204).send();
  } catch (error) {
    console.error("Delete animal error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
