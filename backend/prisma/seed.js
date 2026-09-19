import "dotenv/config";
import bcrypt from "bcrypt";

import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adminEmailEnv = process.env.ADMIN_EMAIL;
const adminPasswordEnv = process.env.ADMIN_PASSWORD;

if (typeof adminEmailEnv !== "string" || adminEmailEnv.length === 0) {
  throw new Error("ADMIN_EMAIL is required");
}

if (typeof adminPasswordEnv !== "string" || adminPasswordEnv.length === 0) {
  throw new Error("ADMIN_PASSWORD is required");
}

const normalizedAdminEmail = adminEmailEnv.toLowerCase().trim();

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const existingAdmin = await prisma.t_Users.findUnique({
    where: {
      Email_User: normalizedAdminEmail,
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists (password NOT modified)");
    return;
  }

  const passwordHash = await bcrypt.hash(adminPasswordEnv, 12);

  const admin = await prisma.t_Users.create({
    data: {
      Role_User: "ADMIN",
      Nom_User: "Admin",
      Prenom_User: "System",
      Email_User: normalizedAdminEmail,
      Password_Hash_User: passwordHash,
    },
  });

  console.log(`Admin created: ${admin.Email_User}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
