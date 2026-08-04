// src/lib/orderNumber.ts
import { prisma } from "@/lib/db";

// Generates BS-10234 style human-friendly order numbers
export async function generateOrderNumber(): Promise<string> {
  const count = await prisma.order.count();
  const next = 10001 + count; // starts at BS-10001
  return `BS-${next}`;
}