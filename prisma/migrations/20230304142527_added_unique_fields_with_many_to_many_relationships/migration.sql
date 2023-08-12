/*
  Warnings:

  - A unique constraint covering the columns `[categorySlug]` on the table `CategoriesOnShops` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categorySlug` to the `CategoriesOnShops` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CategoriesOnShops" DROP CONSTRAINT "CategoriesOnShops_categoryId_fkey";

-- AlterTable
ALTER TABLE "CategoriesOnShops" ADD COLUMN     "categorySlug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CategoriesOnShops_categorySlug_key" ON "CategoriesOnShops"("categorySlug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_id_key" ON "categories"("slug", "id");

-- AddForeignKey
ALTER TABLE "CategoriesOnShops" ADD CONSTRAINT "CategoriesOnShops_categoryId_categorySlug_fkey" FOREIGN KEY ("categoryId", "categorySlug") REFERENCES "categories"("id", "slug") ON DELETE NO ACTION ON UPDATE CASCADE;
