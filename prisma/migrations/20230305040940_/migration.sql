/*
  Warnings:

  - You are about to drop the `CategoriesOnShops` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoriesOnShops" DROP CONSTRAINT "CategoriesOnShops_categoryId_categoryName_categorySlug_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesOnShops" DROP CONSTRAINT "CategoriesOnShops_shopId_fkey";

-- DropIndex
DROP INDEX "categories_id_name_slug_key";

-- DropTable
DROP TABLE "CategoriesOnShops";

-- CreateTable
CREATE TABLE "_CategoryToShop" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToShop_AB_unique" ON "_CategoryToShop"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToShop_B_index" ON "_CategoryToShop"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToShop" ADD CONSTRAINT "_CategoryToShop_A_fkey" FOREIGN KEY ("A") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToShop" ADD CONSTRAINT "_CategoryToShop_B_fkey" FOREIGN KEY ("B") REFERENCES "shops"("id") ON DELETE CASCADE ON UPDATE CASCADE;
