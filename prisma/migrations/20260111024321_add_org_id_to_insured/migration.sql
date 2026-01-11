/*
  Warnings:

  - You are about to drop the column `code` on the `Insured` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `Insured` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orgId,inn]` on the table `Insured` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `orgId` to the `Insured` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Insured` required. This step will fail if there are existing NULL values in that column.
  - Made the column `inn` on table `Insured` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Insured_code_key";

-- DropIndex
DROP INDEX "Insured_inn_key";

-- AlterTable
ALTER TABLE "Insured" DROP COLUMN "code",
DROP COLUMN "contactName",
ADD COLUMN     "orgId" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "inn" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Insured_inn_idx" ON "Insured"("inn");

-- CreateIndex
CREATE UNIQUE INDEX "Insured_orgId_inn_key" ON "Insured"("orgId", "inn");

-- AddForeignKey
ALTER TABLE "Insured" ADD CONSTRAINT "Insured_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
