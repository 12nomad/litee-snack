/*
  Warnings:

  - Added the required column `reset` to the `verifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "verifications" ADD COLUMN     "reset" TEXT NOT NULL;
