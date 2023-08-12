/*
  Warnings:

  - You are about to drop the column `option` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "option",
ADD COLUMN     "options" JSONB;
