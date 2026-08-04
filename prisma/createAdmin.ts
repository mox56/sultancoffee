// prisma/createAdmin.ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("test123", 10); // change before running

  const admin = await prisma.user.upsert({
    where: { email: "admin@sultancoffee.com" },
    update: {},
    create: {
      email: "admin@sultancoffee.com",
      password: hashedPassword,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log("Admin created:", admin.email);
}

main().finally(() => prisma.$disconnect());