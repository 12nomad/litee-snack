/*
  Warnings:

  - You are about to drop the `options` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "options" DROP CONSTRAINT "options_productId_fkey";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "option" JSONB;

-- DropTable
DROP TABLE "options";
