/*
  Warnings:

  - You are about to drop the column `shopId` on the `categories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_shopId_fkey";

-- AlterTable
ALTER TABLE "categories" DROP COLUMN "shopId";

-- CreateTable
CREATE TABLE "CategoriesOnShops" (
    "shopId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,

    CONSTRAINT "CategoriesOnShops_pkey" PRIMARY KEY ("shopId","categoryId")
);

-- AddForeignKey
ALTER TABLE "CategoriesOnShops" ADD CONSTRAINT "CategoriesOnShops_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesOnShops" ADD CONSTRAINT "CategoriesOnShops_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
