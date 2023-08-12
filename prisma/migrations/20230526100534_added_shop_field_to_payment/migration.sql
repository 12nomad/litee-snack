/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "paymentId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "shops_paymentId_key" ON "shops"("paymentId");

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
