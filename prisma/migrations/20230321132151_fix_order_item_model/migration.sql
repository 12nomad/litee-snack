/*
  Warnings:

  - You are about to drop the column `orderId` on the `order_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_orderId_fkey";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "orderId";

-- CreateTable
CREATE TABLE "_OrderToOrderItem" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrderToOrderItem_AB_unique" ON "_OrderToOrderItem"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderToOrderItem_B_index" ON "_OrderToOrderItem"("B");

-- AddForeignKey
ALTER TABLE "_OrderToOrderItem" ADD CONSTRAINT "_OrderToOrderItem_A_fkey" FOREIGN KEY ("A") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToOrderItem" ADD CONSTRAINT "_OrderToOrderItem_B_fkey" FOREIGN KEY ("B") REFERENCES "order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
