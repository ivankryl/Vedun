/*
  Warnings:

  - The values [ISSUED,ACTIVE] on the enum `LinkStatus` will be removed. If these variants are still used in the database, this will fail.
  - The `size` column on the `Insured` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `contacts` on the `Organization` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[orgId,ogrn]` on the table `Insured` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[linkId]` on the table `SurveyResponse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AccessRole" AS ENUM ('OWNER', 'VIEWER', 'EDITOR');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- AlterEnum
BEGIN;
CREATE TYPE "LinkStatus_new" AS ENUM ('CREATED', 'OPENED', 'IN_PROGRESS', 'SAVED', 'COMPLETED', 'DEACTIVATED', 'EXPIRED');
ALTER TABLE "public"."SurveyLink" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SurveyLink" ALTER COLUMN "status" TYPE "LinkStatus_new" USING ("status"::text::"LinkStatus_new");
ALTER TYPE "LinkStatus" RENAME TO "LinkStatus_old";
ALTER TYPE "LinkStatus_new" RENAME TO "LinkStatus";
DROP TYPE "public"."LinkStatus_old";
ALTER TABLE "SurveyLink" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;

-- AlterTable
ALTER TABLE "Insured" ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactTitle" TEXT,
ADD COLUMN     "ogrn" TEXT,
DROP COLUMN "size",
ADD COLUMN     "size" "CompanySize";

-- AlterTable
ALTER TABLE "Organization" DROP COLUMN "contacts",
ADD COLUMN     "contactMeta" JSONB;

-- AlterTable
ALTER TABLE "SurveyLink" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "lastActionAt" TIMESTAMP(3),
ADD COLUMN     "openedAt" TIMESTAMP(3),
ADD COLUMN     "reminderSent" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'CREATED';

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "InsuredAccess" (
    "id" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AccessRole" NOT NULL DEFAULT 'OWNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsuredAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InsuredAccess_userId_idx" ON "InsuredAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuredAccess_insuredId_userId_key" ON "InsuredAccess"("insuredId", "userId");

-- CreateIndex
CREATE INDEX "Insured_ogrn_idx" ON "Insured"("ogrn");

-- CreateIndex
CREATE UNIQUE INDEX "Insured_orgId_ogrn_key" ON "Insured"("orgId", "ogrn");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_linkId_key" ON "SurveyResponse"("linkId");

-- AddForeignKey
ALTER TABLE "InsuredAccess" ADD CONSTRAINT "InsuredAccess_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuredAccess" ADD CONSTRAINT "InsuredAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
