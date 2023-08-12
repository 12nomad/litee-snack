-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_shopId_fkey";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "shopId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "shops"("id") ON DELETE SET NULL ON UPDATE CASCADE;
