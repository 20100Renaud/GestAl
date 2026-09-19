import { Router } from "express";

import { login } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import prisma from "../lib/prisma.js";

const router = Router();

router.post("/login", login);

router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.t_Users.findUnique({
      where: {
        ID_User: req.user.userId,
      },
      select: {
        ID_User: true,
        Role_User: true,
        Email_User: true,
        Prenom_User: true,
        Nom_User: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        error: "User not found",
      });
    }

    return res.json({
      user: {
        id: user.ID_User,
        role: user.Role_User,
        email: user.Email_User,
        firstName: user.Prenom_User,
        lastName: user.Nom_User,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  res.json({
    message: "Logout successful",
  });
});

export default router;
