/*
  Warnings:

  - The values [INSURED,ORG] on the enum `RecipientType` will be removed. If these variants are still used in the database, this will fail.
  - The values [VALIDATED] on the enum `ResponseStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `insuredId` on the `Assertion` table. All the data in the column will be lost.
  - You are about to drop the column `insuredId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `insuredId` on the `AuditArtifact` table. All the data in the column will be lost.
  - You are about to drop the column `insuredId` on the `Contradiction` table. All the data in the column will be lost.
  - You are about to drop the column `insuredId` on the `EventLog` table. All the data in the column will be lost.
  - You are about to drop the column `orgId` on the `EventLog` table. All the data in the column will be lost.
  - You are about to drop the column `insuredId` on the `Finding` table. All the data in the column will be lost.
  - You are about to drop the column `insuredId` on the `Score` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `SurveyLink` table. All the data in the column will be lost.
  - You are about to drop the column `insuredId` on the `SurveyLink` table. All the data in the column will be lost.
  - You are about to drop the column `insuredId` on the `SurveyResponse` table. All the data in the column will be lost.
  - You are about to drop the `Insured` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InsuredAccess` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Survey` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `SurveyLink` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[linkId,attemptNo]` on the table `SurveyResponse` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `insureeId` to the `Assertion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insureeId` to the `Asset` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insureeId` to the `AuditArtifact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insureeId` to the `Contradiction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insureeId` to the `Finding` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insureeId` to the `Score` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insureeId` to the `SurveyLink` table without a default value. This is not possible if the table is not empty.
  - The required column `uuid` was added to the `SurveyLink` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `attemptNo` to the `SurveyResponse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `insureeId` to the `SurveyResponse` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InsureeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TEST');

-- CreateEnum
CREATE TYPE "SurveyTemplateStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- AlterEnum
BEGIN;
CREATE TYPE "RecipientType_new" AS ENUM ('INSUREE', 'USER', 'INSURANCE_COMPANY');
ALTER TABLE "Notification" ALTER COLUMN "recipientType" TYPE "RecipientType_new" USING ("recipientType"::text::"RecipientType_new");
ALTER TYPE "RecipientType" RENAME TO "RecipientType_old";
ALTER TYPE "RecipientType_new" RENAME TO "RecipientType";
DROP TYPE "public"."RecipientType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ResponseStatus_new" AS ENUM ('IN_PROGRESS', 'SAVED', 'SUBMITTED', 'INVALID');
ALTER TABLE "public"."SurveyResponse" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SurveyResponse" ALTER COLUMN "status" TYPE "ResponseStatus_new" USING ("status"::text::"ResponseStatus_new");
ALTER TYPE "ResponseStatus" RENAME TO "ResponseStatus_old";
ALTER TYPE "ResponseStatus_new" RENAME TO "ResponseStatus";
DROP TYPE "public"."ResponseStatus_old";
ALTER TABLE "SurveyResponse" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Assertion" DROP CONSTRAINT "Assertion_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Asset" DROP CONSTRAINT "Asset_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AuditArtifact" DROP CONSTRAINT "AuditArtifact_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Contradiction" DROP CONSTRAINT "Contradiction_assertionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Contradiction" DROP CONSTRAINT "Contradiction_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventLog" DROP CONSTRAINT "EventLog_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."EventLog" DROP CONSTRAINT "EventLog_orgId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Finding" DROP CONSTRAINT "Finding_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Insured" DROP CONSTRAINT "Insured_orgId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InsuredAccess" DROP CONSTRAINT "InsuredAccess_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."InsuredAccess" DROP CONSTRAINT "InsuredAccess_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Score" DROP CONSTRAINT "Score_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ScoreComponent" DROP CONSTRAINT "ScoreComponent_scoreId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyLink" DROP CONSTRAINT "SurveyLink_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyLink" DROP CONSTRAINT "SurveyLink_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyLink" DROP CONSTRAINT "SurveyLink_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyResponse" DROP CONSTRAINT "SurveyResponse_insuredId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyResponse" DROP CONSTRAINT "SurveyResponse_linkId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SurveyResponse" DROP CONSTRAINT "SurveyResponse_surveyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_orgId_fkey";

-- DropIndex
DROP INDEX "public"."Assertion_insuredId_key_idx";

-- DropIndex
DROP INDEX "public"."Asset_insuredId_type_idx";

-- DropIndex
DROP INDEX "public"."AuditArtifact_insuredId_type_idx";

-- DropIndex
DROP INDEX "public"."Contradiction_insuredId_severity_idx";

-- DropIndex
DROP INDEX "public"."EventLog_insuredId_idx";

-- DropIndex
DROP INDEX "public"."Finding_insuredId_severity_idx";

-- DropIndex
DROP INDEX "public"."Score_insuredId_calculatedAt_idx";

-- DropIndex
DROP INDEX "public"."SurveyLink_insuredId_status_idx";

-- DropIndex
DROP INDEX "public"."SurveyResponse_insuredId_submittedAt_idx";

-- DropIndex
DROP INDEX "public"."SurveyResponse_linkId_key";

-- AlterTable
ALTER TABLE "Assertion" DROP COLUMN "insuredId",
ADD COLUMN     "insureeId" TEXT NOT NULL,
ADD COLUMN     "responseId" TEXT;

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "insuredId",
ADD COLUMN     "insureeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AuditArtifact" DROP COLUMN "insuredId",
ADD COLUMN     "insureeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Contradiction" DROP COLUMN "insuredId",
ADD COLUMN     "insureeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "EventLog" DROP COLUMN "insuredId",
DROP COLUMN "orgId",
ADD COLUMN     "insuranceCompanyId" TEXT,
ADD COLUMN     "insureeId" TEXT;

-- AlterTable
ALTER TABLE "Finding" DROP COLUMN "insuredId",
ADD COLUMN     "insureeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Score" DROP COLUMN "insuredId",
ADD COLUMN     "insureeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SurveyLink" DROP COLUMN "createdBy",
DROP COLUMN "insuredId",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "insureeId" TEXT NOT NULL,
ADD COLUMN     "uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SurveyResponse" DROP COLUMN "insuredId",
ADD COLUMN     "attemptNo" INTEGER NOT NULL,
ADD COLUMN     "insureeId" TEXT NOT NULL,
ADD COLUMN     "lastSavedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "insuranceCompanyId" TEXT,
ADD COLUMN     "lastLogin" TIMESTAMP(3);

-- DropTable
DROP TABLE "public"."Insured";

-- DropTable
DROP TABLE "public"."InsuredAccess";

-- DropTable
DROP TABLE "public"."Organization";

-- DropTable
DROP TABLE "public"."Survey";

-- DropEnum
DROP TYPE "public"."AccessRole";

-- DropEnum
DROP TYPE "public"."InsuredStatus";

-- DropEnum
DROP TYPE "public"."OrgStatus";

-- DropEnum
DROP TYPE "public"."OrgType";

-- DropEnum
DROP TYPE "public"."SurveyStatus";

-- CreateTable
CREATE TABLE "InsuranceCompany" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "taxId" TEXT,
    "registrationId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insuree" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT NOT NULL,
    "registrationId" TEXT,
    "countryCode" TEXT NOT NULL,
    "industry" TEXT,
    "headcount" INTEGER,
    "contacts" JSONB,
    "status" "InsureeStatus" NOT NULL DEFAULT 'ACTIVE',
    "companySize" "CompanySize" NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPosition" TEXT,
    "phone" TEXT,
    "domainInfo" JSONB,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insuree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceAccess" (
    "id" TEXT NOT NULL,
    "insureeId" TEXT NOT NULL,
    "insuranceCompanyId" TEXT NOT NULL,
    "grantedById" TEXT,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyTemplate" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "status" "SurveyTemplateStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "applicableFor" "CompanySize"[],
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_email_key" ON "InsuranceCompany"("email");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_taxId_key" ON "InsuranceCompany"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCompany_registrationId_key" ON "InsuranceCompany"("registrationId");

-- CreateIndex
CREATE INDEX "InsuranceCompany_createdById_idx" ON "InsuranceCompany"("createdById");

-- CreateIndex
CREATE INDEX "InsuranceCompany_taxId_idx" ON "InsuranceCompany"("taxId");

-- CreateIndex
CREATE INDEX "InsuranceCompany_registrationId_idx" ON "InsuranceCompany"("registrationId");

-- CreateIndex
CREATE UNIQUE INDEX "Insuree_taxId_key" ON "Insuree"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "Insuree_registrationId_key" ON "Insuree"("registrationId");

-- CreateIndex
CREATE INDEX "Insuree_createdById_idx" ON "Insuree"("createdById");

-- CreateIndex
CREATE INDEX "Insuree_taxId_idx" ON "Insuree"("taxId");

-- CreateIndex
CREATE INDEX "Insuree_registrationId_idx" ON "Insuree"("registrationId");

-- CreateIndex
CREATE INDEX "Insuree_countryCode_idx" ON "Insuree"("countryCode");

-- CreateIndex
CREATE INDEX "Insuree_industry_idx" ON "Insuree"("industry");

-- CreateIndex
CREATE INDEX "Insuree_status_idx" ON "Insuree"("status");

-- CreateIndex
CREATE INDEX "InsuranceAccess_insuranceCompanyId_idx" ON "InsuranceAccess"("insuranceCompanyId");

-- CreateIndex
CREATE INDEX "InsuranceAccess_grantedById_idx" ON "InsuranceAccess"("grantedById");

-- CreateIndex
CREATE INDEX "InsuranceAccess_revokedAt_idx" ON "InsuranceAccess"("revokedAt");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceAccess_insureeId_insuranceCompanyId_key" ON "InsuranceAccess"("insureeId", "insuranceCompanyId");

-- CreateIndex
CREATE INDEX "SurveyTemplate_version_idx" ON "SurveyTemplate"("version");

-- CreateIndex
CREATE INDEX "SurveyTemplate_status_idx" ON "SurveyTemplate"("status");

-- CreateIndex
CREATE INDEX "SurveyTemplate_createdById_idx" ON "SurveyTemplate"("createdById");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_entity_idx" ON "AuditLog"("entity");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Question_category_idx" ON "Question"("category");

-- CreateIndex
CREATE INDEX "Assertion_insureeId_key_idx" ON "Assertion"("insureeId", "key");

-- CreateIndex
CREATE INDEX "Assertion_linkId_idx" ON "Assertion"("linkId");

-- CreateIndex
CREATE INDEX "Assertion_responseId_idx" ON "Assertion"("responseId");

-- CreateIndex
CREATE INDEX "Assertion_artifactId_idx" ON "Assertion"("artifactId");

-- CreateIndex
CREATE INDEX "Asset_insureeId_type_idx" ON "Asset"("insureeId", "type");

-- CreateIndex
CREATE INDEX "AuditArtifact_insureeId_type_idx" ON "AuditArtifact"("insureeId", "type");

-- CreateIndex
CREATE INDEX "Contradiction_insureeId_severity_idx" ON "Contradiction"("insureeId", "severity");

-- CreateIndex
CREATE INDEX "EventLog_insureeId_idx" ON "EventLog"("insureeId");

-- CreateIndex
CREATE INDEX "EventLog_insuranceCompanyId_idx" ON "EventLog"("insuranceCompanyId");

-- CreateIndex
CREATE INDEX "Finding_insureeId_severity_idx" ON "Finding"("insureeId", "severity");

-- CreateIndex
CREATE INDEX "Score_insureeId_calculatedAt_idx" ON "Score"("insureeId", "calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyLink_uuid_key" ON "SurveyLink"("uuid");

-- CreateIndex
CREATE INDEX "SurveyLink_insureeId_status_idx" ON "SurveyLink"("insureeId", "status");

-- CreateIndex
CREATE INDEX "SurveyLink_surveyId_idx" ON "SurveyLink"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_insureeId_submittedAt_idx" ON "SurveyResponse"("insureeId", "submittedAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_surveyId_idx" ON "SurveyResponse"("surveyId");

-- CreateIndex
CREATE INDEX "SurveyResponse_linkId_status_idx" ON "SurveyResponse"("linkId", "status");

-- CreateIndex
CREATE INDEX "SurveyResponse_linkId_lastSavedAt_idx" ON "SurveyResponse"("linkId", "lastSavedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyResponse_linkId_attemptNo_key" ON "SurveyResponse"("linkId", "attemptNo");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_insuranceCompanyId_idx" ON "User"("insuranceCompanyId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCompany" ADD CONSTRAINT "InsuranceCompany_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insuree" ADD CONSTRAINT "Insuree_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceAccess" ADD CONSTRAINT "InsuranceAccess_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceAccess" ADD CONSTRAINT "InsuranceAccess_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceAccess" ADD CONSTRAINT "InsuranceAccess_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyTemplate" ADD CONSTRAINT "SurveyTemplate_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyLink" ADD CONSTRAINT "SurveyLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyLink" ADD CONSTRAINT "SurveyLink_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyLink" ADD CONSTRAINT "SurveyLink_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "SurveyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "SurveyLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "SurveyTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditArtifact" ADD CONSTRAINT "AuditArtifact_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assertion" ADD CONSTRAINT "Assertion_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assertion" ADD CONSTRAINT "Assertion_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "SurveyResponse"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contradiction" ADD CONSTRAINT "Contradiction_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contradiction" ADD CONSTRAINT "Contradiction_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "Assertion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreComponent" ADD CONSTRAINT "ScoreComponent_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_insureeId_fkey" FOREIGN KEY ("insureeId") REFERENCES "Insuree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_insuranceCompanyId_fkey" FOREIGN KEY ("insuranceCompanyId") REFERENCES "InsuranceCompany"("id") ON DELETE CASCADE ON UPDATE CASCADE;
