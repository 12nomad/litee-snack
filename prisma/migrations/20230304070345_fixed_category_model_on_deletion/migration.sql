/*
  Warnings:

  - Made the column `shopId` on table `categories` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_shopId_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "shopId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
