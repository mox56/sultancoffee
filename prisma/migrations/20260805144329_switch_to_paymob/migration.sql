/*
  Warnings:

  - The values [FAWRY_REF,FAWRY_CARD,FAWRY_WALLET] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `fawryRefNumber` on the `Order` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('PAYMOB_CARD', 'PAYMOB_WALLET', 'CASH_ON_DELIVERY');
ALTER TABLE "Order" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- DropIndex
DROP INDEX "Order_fawryRefNumber_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "fawryRefNumber",
ADD COLUMN     "paymentRefNumber" TEXT;

-- CreateIndex
CREATE INDEX "Order_paymentRefNumber_idx" ON "Order"("paymentRefNumber");
