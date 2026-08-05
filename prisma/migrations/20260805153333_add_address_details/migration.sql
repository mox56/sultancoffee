/*
  Warnings:

  - Added the required column `apartment` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `building` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floor` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "apartment" TEXT NOT NULL,
ADD COLUMN     "building" TEXT NOT NULL,
ADD COLUMN     "floor" TEXT NOT NULL;
