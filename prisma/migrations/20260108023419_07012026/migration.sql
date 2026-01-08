/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Insured` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Insured` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Insured" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "contactName" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "inn" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Insured_code_key" ON "Insured"("code");
