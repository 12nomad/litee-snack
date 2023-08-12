/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `shops` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "shops_ownerId_key" ON "shops"("ownerId");
