/*
  Warnings:

  - You are about to drop the column `options` on the `order_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "options",
ADD COLUMN     "orderChoices" JSONB;
