/*
  Warnings:

  - Made the column `content` on table `TwoPersonChat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TwoPersonChat" ALTER COLUMN "content" SET NOT NULL;
