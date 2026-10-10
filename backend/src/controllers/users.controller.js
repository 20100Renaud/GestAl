import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";

const ALLOWED_ROLES = ["CLIENT", "ADMIN"];

const USER_FIELDS = {
  Civilite_User: "Civilite_User",
  Pratique: "Pratique",
  Nom_User: "Nom_User",
  Prenom_User: "Prenom_User",
  Email_User: "Email_User",
  Adresse_User: "Adresse_User",
  Ville_User: "Ville_User",
  CP_User: "CP_User",
  Tel_User: "Tel_User",
};

const SAFE_USER_SELECT = {
  ID_User: true,
  Role_User: true,
  Pratique: true,
  Civilite_User: true,
  Nom_User: true,
  Prenom_User: true,
  Email_User: true,
  Date_User: true,
  Adresse_User: true,
  Ville_User: true,
  CP_User: true,
  Tel_User: true,
};

function validateRole(role) {
  return role === undefined || ALLOWED_ROLES.includes(role);
}

function buildUserData(body) {
  const data = {};

  for (const [field] of Object.entries(USER_FIELDS)) {
    if (Object.hasOwn(body, field)) {
      data[field] = body[field];
    }
  }

  if (Object.hasOwn(body, "Role_User")) {
    data.Role_User = body.Role_User;
  }

  return data;
}

function validateUserFields(data) {
  const required = ["Nom_User", "Prenom_User", "Email_User"];

  for (const field of required) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      return `${field} is required`;
    }
  }

  if (
    typeof data.Email_User !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.Email_User.trim())
  ) {
    return "A valid email address is required";
  }

  for (const field of Object.keys(USER_FIELDS)) {
    if (
      Object.hasOwn(data, field) &&
      data[field] !== null &&
      typeof data[field] !== "string"
    ) {
      return `${field} must be a string or null`;
    }
  }

  return null;
}

function handlePrismaError(error, res) {
  if (error.code === "P2002") {
    return res.status(409).json({
      error: "This email address is already in use",
    });
  }

  if (error.code === "P2003" || error.code === "P2014") {
    return res.status(409).json({
      error: "This user has related records and cannot be deleted",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      error: "User not found",
    });
  }

  console.error("User management error:", error);

  return res.status(500).json({
    error: "Internal server error",
  });
}

// GET /api/users
export async function getUsers(req, res) {
  try {
    const users = await prisma.t_Users.findMany({
      where: {
        Role_User: "CLIENT",
      },
      select: SAFE_USER_SELECT,
      orderBy: {
        Date_User: "desc",
      },
    });

    return res.json({ users });
  } catch (error) {
    return handlePrismaError(error, res);
  }
}

// GET /api/users/:id
export async function getUserById(req, res) {
  try {
    const user = await prisma.t_Users.findUnique({
      where: {
        ID_User: req.params.id,
      },
      select: SAFE_USER_SELECT,
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({ user });
  } catch (error) {
    return handlePrismaError(error, res);
  }
}

// POST /api/users
export async function createUser(req, res) {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        error: "Invalid request body",
      });
    }

    if (
      typeof body.Password_Hash_User !== "string" ||
      body.Password_Hash_User.length < 6
    ) {
      return res.status(400).json({
        error: "Password must contain at least 6 characters",
      });
    }

    if (!validateRole(body.Role_User)) {
      return res.status(400).json({
        error: "Invalid user role",
      });
    }

    const data = buildUserData(body);
    const validationError = validateUserFields(data);

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    data.Email_User = data.Email_User.toLowerCase().trim();
    data.Nom_User = data.Nom_User.trim();
    data.Prenom_User = data.Prenom_User.trim();

    const passwordHash = await bcrypt.hash(body.Password_Hash_User, 12);

    const user = await prisma.t_Users.create({
      data: {
        ...data,
        Role_User: body.Role_User ?? "CLIENT",
        Password_Hash_User: passwordHash,
      },
      select: SAFE_USER_SELECT,
    });

    return res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    return handlePrismaError(error, res);
  }
}

// PUT /api/users/:id
export async function updateUser(req, res) {
  try {
    const body = req.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return res.status(400).json({
        error: "Invalid request body",
      });
    }

    if (!validateRole(body.Role_User)) {
      return res.status(400).json({
        error: "Invalid user role",
      });
    }

    const data = buildUserData(body);

    if (
      Object.keys(data).length === 0 &&
      body.Password_Hash_User === undefined
    ) {
      return res.status(400).json({
        error: "No fields to update",
      });
    }

    const validationError = validateUserFields({
      ...data,
      Nom_User: data.Nom_User ?? "valid",
      Prenom_User: data.Prenom_User ?? "valid",
      Email_User: data.Email_User ?? "valid@example.com",
    });

    if (validationError) {
      return res.status(400).json({
        error: validationError,
      });
    }

    if (data.Email_User !== undefined) {
      data.Email_User = data.Email_User.toLowerCase().trim();
    }

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
          error: "Password must contain at least 6 characters",
        });
      }

      data.Password_Hash_User = await bcrypt.hash(body.Password_Hash_User, 12);
    }

    const user = await prisma.t_Users.update({
      where: {
        ID_User: req.params.id,
      },
      data,
      select: SAFE_USER_SELECT,
    });

    return res.json({
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return handlePrismaError(error, res);
  }
}

// DELETE /api/users/:id
export async function deleteUser(req, res) {
  try {
    if (req.params.id === req.user.userId) {
      return res.status(400).json({
        error: "You cannot delete your own account",
      });
    }

    const target = await prisma.t_Users.findUnique({
      where: {
        ID_User: req.params.id,
      },
      select: {
        ID_User: true,
        Role_User: true,
      },
    });

    if (!target) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (target.Role_User === "ADMIN") {
      const adminCount = await prisma.t_Users.count({
        where: {
          Role_User: "ADMIN",
        },
      });

      if (adminCount <= 1) {
        return res.status(400).json({
          error: "Cannot delete the last administrator",
        });
      }
    }

    await prisma.t_Users.delete({
      where: {
        ID_User: req.params.id,
      },
    });

    return res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    return handlePrismaError(error, res);
  }
}
