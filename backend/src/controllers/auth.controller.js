import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../lib/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

const JWT_EXPIRES_IN = "60m";

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.t_Users.findUnique({
      where: {
        Email_User: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const passwordValid = await bcrypt.compare(
      password,
      user.Password_Hash_User,
    );

    if (!passwordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.ID_User,
        role: user.Role_User,
        pratique: user.Pratique ?? "",
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      },
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user.ID_User,
        role: user.Role_User,
        email: user.Email_User,
        firstName: user.Prenom_User,
        lastName: user.Nom_User,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}

const PROFILE_FIELDS = [
  "Civilite_User",
  "Pratique",
  "Nom_User",
  "Prenom_User",
  "Email_User",
  "Adresse_User",
  "Ville_User",
  "CP_User",
  "Tel_User",
];

const PROFILE_SELECT = {
  ID_User: true,
  Civilite_User: true,
  Pratique: true,
  Nom_User: true,
  Prenom_User: true,
  Email_User: true,
  Adresse_User: true,
  Ville_User: true,
  CP_User: true,
  Tel_User: true,
  Date_User: true,
};

function profileError(error, res) {
  if (error.code === "P2002") {
    return res.status(409).json({
      error: "Cette adresse email est déjà utilisée.",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      error: "Utilisateur introuvable.",
    });
  }

  console.error("Profile error:", error);

  return res.status(500).json({
    error: "Erreur interne du serveur.",
  });
}

// GET /api/auth/profile
export async function getMyProfile(req, res) {
  try {
    const user = await prisma.t_Users.findUnique({
      where: {
        ID_User: req.user.userId,
      },
      select: PROFILE_SELECT,
    });

    if (!user) {
      return res.status(404).json({
        error: "Utilisateur introuvable.",
      });
    }

    return res.json({ user });
  } catch (error) {
    return profileError(error, res);
  }
}

// PUT /api/auth/profile
export async function updateMyProfile(req, res) {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        error: "Corps de requête invalide.",
      });
    }

    const data = {};

    for (const field of PROFILE_FIELDS) {
      if (Object.hasOwn(body, field)) {
        data[field] = body[field];
      }
    }

    if (
      Object.keys(data).length === 0 &&
      body.Password_Hash_User === undefined
    ) {
      return res.status(400).json({
        error: "Aucune modification à enregistrer.",
      });
    }

    for (const [field, value] of Object.entries(data)) {
      if (value !== null && typeof value !== "string") {
        return res.status(400).json({
          error: `${field} doit être une chaîne de caractères ou null.`,
        });
      }
    }

    const currentUser = await prisma.t_Users.findUnique({
      where: {
        ID_User: req.user.userId,
      },
      select: PROFILE_SELECT,
    });

    if (!currentUser) {
      return res.status(404).json({
        error: "Utilisateur introuvable.",
      });
    }

    const merged = { ...currentUser, ...data };

    for (const field of ["Nom_User", "Prenom_User", "Email_User"]) {
      if (typeof merged[field] !== "string" || !merged[field].trim()) {
        return res.status(400).json({
          error: `${field} est obligatoire.`,
        });
      }
    }

    const email = merged.Email_User.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        error: "Adresse email invalide.",
      });
    }

    data.Email_User = email;

    if (data.Nom_User !== undefined) {
      data.Nom_User = data.Nom_User.trim();
    }

    if (data.Prenom_User !== undefined) {
      data.Prenom_User = data.Prenom_User.trim();
    }

    if (body.Password_Hash_User !== undefined) {
      if (
        typeof body.Password_Hash_User !== "string" ||
        body.Password_Hash_User.length < 6
      ) {
        return res.status(400).json({
          error: "Le mot de passe doit contenir au moins 6 caractères.",
        });
      }

      data.Password_Hash_User = await bcrypt.hash(body.Password_Hash_User, 12);
    }

    const user = await prisma.t_Users.update({
      where: {
        ID_User: req.user.userId,
      },
      data,
      select: PROFILE_SELECT,
    });

    return res.json({
      message: "Profil mis à jour avec succès.",
      user,
    });
  } catch (error) {
    return profileError(error, res);
  }
}
