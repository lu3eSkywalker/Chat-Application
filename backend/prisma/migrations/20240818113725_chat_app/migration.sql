/*
  Warnings:

  - Made the column `isRead` on table `TwoPersonChat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TwoPersonChat" ALTER COLUMN "isRead" SET NOT NULL;
