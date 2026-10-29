import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";

// Configuration avant le chargement des modules de l'application.
const { findUnique, comparePassword } = vi.hoisted(() => {
  process.env.JWT_SECRET = "test-secret-for-integration-only";
  process.env.NODE_ENV = "test";

  return {
    findUnique: vi.fn(),
    comparePassword: vi.fn(),
  };
});

// Simuler Prisma.
vi.mock("../lib/prisma.js", () => ({
  default: {
    t_Users: {
      findUnique,
    },
  },
}));

// Simuler bcrypt sans effectuer de véritable hachage.
vi.mock("bcrypt", () => ({
  default: {
    compare: comparePassword,
    hash: vi.fn(),
  },
}));

import app from "../app.js";

const testUser = {
  ID_User: "user-test-1",
  Role_User: "CLIENT",
  Email_User: "test@example.com",
  Prenom_User: "Camille",
  Nom_User: "Test",
  Password_Hash_User: "fake-password-hash",
};

describe("Intégration de l'authentification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /api/auth/login", () => {
    it("accepte des identifiants corrects", async () => {
      findUnique.mockResolvedValue(testUser);
      comparePassword.mockResolvedValue(true);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "motdepasse123",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Login successful");
      expect(response.body.user).toMatchObject({
        id: "user-test-1",
        role: "CLIENT",
        email: "test@example.com",
        firstName: "Camille",
        lastName: "Test",
      });

      expect(response.headers["set-cookie"]).toBeDefined();
    });

    it("refuse un mot de passe incorrect", async () => {
      findUnique.mockResolvedValue(testUser);
      comparePassword.mockResolvedValue(false);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "mauvais-mot-de-passe",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Invalid email or password");

      expect(response.headers["set-cookie"]).toBeUndefined();
    });

    it("normalise l'adresse email avant la recherche", async () => {
      findUnique.mockResolvedValue(testUser);
      comparePassword.mockResolvedValue(true);

      const response = await request(app).post("/api/auth/login").send({
        email: "  TEST@EXAMPLE.COM  ",
        password: "motdepasse123",
      });

      expect(response.status).toBe(200);

      expect(findUnique).toHaveBeenCalledWith({
        where: {
          Email_User: "test@example.com",
        },
      });
    });

    it("configure correctement le cookie d'authentification", async () => {
      findUnique.mockResolvedValue(testUser);
      comparePassword.mockResolvedValue(true);

      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "motdepasse123",
      });

      expect(response.status).toBe(200);

      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();

      const authCookie = cookies.find((cookie) =>
        cookie.startsWith("access_token="),
      );

      expect(authCookie).toBeDefined();
      expect(authCookie).toMatch(/HttpOnly/i);
      expect(authCookie).toMatch(/SameSite=Lax/i);
      expect(authCookie).toMatch(/Path=\//i);
      expect(authCookie).toMatch(/Max-Age=3600/i);
      expect(authCookie).not.toMatch(/;\s*Secure(?:;|$)/i);

      const token = authCookie.split(";")[0].slice("access_token=".length);

      expect(jwt.verify(token, process.env.JWT_SECRET)).toMatchObject({
        userId: "user-test-1",
        role: "CLIENT",
      });
    });
  });

  describe("GET /api/auth/me", () => {
    it("refuse l'accès au profil sans cookie", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("Authentication required");
    });

    it("refuse un jeton invalide", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", "access_token=jeton-invalide");

      expect(response.status).toBe(401);
      expect(response.body.error).toBe(
        "Invalid or expired authentication token",
      );
    });

    it("retourne le profil avec un jeton valide", async () => {
      const token = jwt.sign(
        {
          userId: "user-test-1",
          role: "CLIENT",
        },
        process.env.JWT_SECRET,
        { expiresIn: "60m" },
      );

      findUnique.mockResolvedValue({
        ID_User: "user-test-1",
        Role_User: "CLIENT",
        Email_User: "test@example.com",
        Prenom_User: "Camille",
        Nom_User: "Test",
        Pratique: "Ostéopathie animale",
        Civilite_User: null,
        Adresse_User: null,
        Ville_User: null,
        CP_User: null,
        Tel_User: null,
      });

      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", `access_token=${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toMatchObject({
        id: "user-test-1",
        role: "CLIENT",
        email: "test@example.com",
        firstName: "Camille",
        lastName: "Test",
      });

      expect(findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { ID_User: "user-test-1" },
        }),
      );
    });

    it("refuse un jeton valide si l'utilisateur n'existe plus", async () => {
      const token = jwt.sign(
        {
          userId: "user-inexistant",
          role: "CLIENT",
        },
        process.env.JWT_SECRET,
        { expiresIn: "60m" },
      );

      findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/auth/me")
        .set("Cookie", `access_token=${token}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe("User not found");
    });
  });
});
