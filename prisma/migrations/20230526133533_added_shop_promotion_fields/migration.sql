-- AlterTable
ALTER TABLE "shops" ADD COLUMN     "isPromoted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "promotedUntil" TIMESTAMP(3);
