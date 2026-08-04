// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding...");

  // Clean slate for repeatable seeding
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const category = await prisma.category.create({
    data: {
      nameAr: "بن عربي",
      nameEn: "Arabic Coffee",
      slug: "arabic-coffee",
    },
  });

  const kolombi = await prisma.product.create({
    data: {
      nameAr: "بن كولومبي",
      nameEn: "Colombian Coffee",
      descriptionAr: "بن كولومبي فاخر، تحميص متوسط، نكهة غنية بلمسة من الكراميل.",
      descriptionEn: "Premium Colombian coffee, medium roast, rich caramel notes.",
      slug: "colombian-coffee",
      images: [],
      categoryId: category.id,
      variants: {
        create: [
          {
            weightGrams: 250,
            roastLevel: "Medium",
            grindType: "Whole Bean",
            sku: "KOL-250-WB",
            price: 250,
            stock: 40,
          },
          {
            weightGrams: 250,
            roastLevel: "Medium",
            grindType: "Ground",
            sku: "KOL-250-GR",
            price: 260,
            stock: 35,
          },
          {
            weightGrams: 500,
            roastLevel: "Medium",
            grindType: "Whole Bean",
            sku: "KOL-500-WB",
            price: 470,
            stock: 20,
          },
        ],
      },
    },
  });

  const ethiopian = await prisma.product.create({
    data: {
      nameAr: "بن إثيوبي",
      nameEn: "Ethiopian Coffee",
      descriptionAr: "بن إثيوبي، تحميص فاتح، نكهات فاكهية مميزة.",
      descriptionEn: "Ethiopian coffee, light roast, distinctive fruity notes.",
      slug: "ethiopian-coffee",
      images: [],
      categoryId: category.id,
      variants: {
        create: [
          {
            weightGrams: 250,
            roastLevel: "Light",
            grindType: "Whole Bean",
            sku: "ETH-250-WB",
            price: 280,
            stock: 3, // intentionally low, to test low-stock logic later
          },
          {
            weightGrams: 500,
            roastLevel: "Light",
            grindType: "Fine",
            sku: "ETH-500-FN",
            price: 530,
            stock: 15,
          },
        ],
      },
    },
  });

  console.log("Seeded:", { kolombi: kolombi.id, ethiopian: ethiopian.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });