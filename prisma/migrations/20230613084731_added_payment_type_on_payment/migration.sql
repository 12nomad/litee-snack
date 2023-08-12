/*
  Warnings:

  - You are about to drop the column `paymentIntentId` on the `payments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('ORDER', 'PROMOTION');

-- DropIndex
DROP INDEX "payments_paymentIntentId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "paymentIntentId",
ADD COLUMN     "stripePaymentIntentId" TEXT,
ADD COLUMN     "type" "PaymentType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");
