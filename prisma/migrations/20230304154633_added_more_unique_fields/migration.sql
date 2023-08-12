/*
  Warnings:

  - A unique constraint covering the columns `[categorySlug,categoryName]` on the table `CategoriesOnShops` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,name,slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryName` to the `CategoriesOnShops` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CategoriesOnShops" DROP CONSTRAINT "CategoriesOnShops_categoryId_categorySlug_fkey";

-- DropIndex
DROP INDEX "CategoriesOnShops_categorySlug_key";

-- DropIndex
DROP INDEX "categories_slug_id_key";

-- AlterTable
ALTER TABLE "CategoriesOnShops" ADD COLUMN     "categoryName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CategoriesOnShops_categorySlug_categoryName_key" ON "CategoriesOnShops"("categorySlug", "categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "categories_id_name_slug_key" ON "categories"("id", "name", "slug");

-- AddForeignKey
ALTER TABLE "CategoriesOnShops" ADD CONSTRAINT "CategoriesOnShops_categoryId_categoryName_categorySlug_fkey" FOREIGN KEY ("categoryId", "categoryName", "categorySlug") REFERENCES "categories"("id", "name", "slug") ON DELETE NO ACTION ON UPDATE CASCADE;
