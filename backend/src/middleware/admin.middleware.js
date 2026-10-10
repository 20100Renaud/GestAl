import prisma from "../lib/prisma.js";

export async function requireAdmin(req, res, next) {
  try {
    const user = await prisma.t_Users.findUnique({
      where: {
        ID_User: req.user.userId,
      },
      select: {
        Role_User: true,
      },
    });

    if (!user || user.Role_User !== "ADMIN") {
      return res.status(403).json({
        error: "Administrator access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    return res.status(500).json({
      error: "Internal server error",
    });
  }
}
