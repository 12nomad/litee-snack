/*
  Warnings:

  - The primary key for the `payments` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_paymentId_fkey";

-- DropForeignKey
ALTER TABLE "shops" DROP CONSTRAINT "shops_paymentId_fkey";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "paymentId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "payments" DROP CONSTRAINT "payments_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "payments_id_seq";

-- AlterTable
ALTER TABLE "shops" ALTER COLUMN "paymentId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "shops" ADD CONSTRAINT "shops_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
