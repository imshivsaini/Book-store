/*
  Warnings:

  - You are about to drop the column `coverImgKey` on the `Book` table. All the data in the column will be lost.
  - You are about to drop the column `pdfKey` on the `Book` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Book" DROP COLUMN "coverImgKey",
DROP COLUMN "pdfKey";
