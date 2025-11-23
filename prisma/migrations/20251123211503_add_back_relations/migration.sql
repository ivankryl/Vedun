-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'INSURER', 'BROKER', 'ANALYST', 'USER');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('INSURER', 'BROKER', 'PLATFORM');

-- CreateEnum
CREATE TYPE "OrgStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'LOCKED');

-- CreateEnum
CREATE TYPE "InsuredStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TEST');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "LinkStatus" AS ENUM ('ISSUED', 'ACTIVE', 'EXPIRED', 'DEACTIVATED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ResponseStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'VALIDATED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('DOMAIN', 'HOST', 'IP', 'REPO', 'BUCKET');

-- CreateEnum
CREATE TYPE "AssetSource" AS ENUM ('SEED', 'DISCOVERY', 'MANUAL');

-- CreateEnum
CREATE TYPE "AssetStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'UNCONFIRMED');

-- CreateEnum
CREATE TYPE "FindingCategory" AS ENUM ('VULN', 'MISCONFIG', 'EXPOSURE', 'LEAK');

-- CreateEnum
CREATE TYPE "FindingSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FindingStatus" AS ENUM ('OPEN', 'CONFIRMED', 'MITIGATED', 'CLOSED', 'FALSE_POSITIVE');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('POLICY', 'LOG', 'REPORT', 'ATTESTATION');

-- CreateEnum
CREATE TYPE "AssertionSource" AS ENUM ('SURVEY', 'AUDIT', 'MANUAL');

-- CreateEnum
CREATE TYPE "AssertionStatus" AS ENUM ('DECLARED', 'VALIDATED', 'CONTRADICTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ContradictionSeverity" AS ENUM ('MINOR', 'MAJOR', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ScoreBand" AS ENUM ('A', 'B', 'C', 'D', 'E');

-- CreateEnum
CREATE TYPE "ScoreComponentType" AS ENUM ('SURVEY', 'OSINT', 'AUDIT', 'CONTRADICTIONS', 'SIZE_ADJUSTMENT');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('LINK_CREATE', 'SURVEY_SUBMIT', 'SCAN_RUN', 'SCORE_RECALC', 'EXPORT');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('INSURED', 'USER', 'ORG');

-- CreateEnum
CREATE TYPE "NotifyChannel" AS ENUM ('EMAIL', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "NotifyStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "name" TEXT NOT NULL,
    "inn" TEXT,
    "contacts" JSONB,
    "status" "OrgStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "orgId" TEXT,
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insured" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "industry" TEXT,
    "size" TEXT,
    "contacts" JSONB,
    "status" "InsuredStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Insured_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "schema" JSONB NOT NULL,
    "status" "SurveyStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyLink" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "LinkStatus" NOT NULL DEFAULT 'ISSUED',
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" TEXT NOT NULL,
    "surveyId" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "respondentMeta" JSONB,
    "answers" JSONB NOT NULL,
    "completenessPercent" DECIMAL(65,30),
    "submittedAt" TIMESTAMP(3),
    "status" "ResponseStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "identifier" TEXT NOT NULL,
    "source" "AssetSource" NOT NULL DEFAULT 'SEED',
    "discoveredAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "status" "AssetStatus" NOT NULL DEFAULT 'ACTIVE',
    "meta" JSONB,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "assetId" TEXT,
    "category" "FindingCategory" NOT NULL,
    "severity" "FindingSeverity" NOT NULL,
    "cveId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "evidence" JSONB,
    "firstFoundAt" TIMESTAMP(3),
    "lastConfirmedAt" TIMESTAMP(3),
    "status" "FindingStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditArtifact" (
    "id" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "label" TEXT NOT NULL,
    "storageUrl" TEXT,
    "hashSha256" TEXT,
    "issuedAt" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assertion" (
    "id" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "source" "AssertionSource" NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB,
    "declaredAt" TIMESTAMP(3),
    "linkId" TEXT,
    "artifactId" TEXT,
    "status" "AssertionStatus" NOT NULL DEFAULT 'DECLARED',

    CONSTRAINT "Assertion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contradiction" (
    "id" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "assertionId" TEXT NOT NULL,
    "findingId" TEXT,
    "severity" "ContradictionSeverity" NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "Contradiction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "insuredId" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "totalScore" DECIMAL(65,30) NOT NULL,
    "band" "ScoreBand" NOT NULL,
    "rationale" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validUntil" TIMESTAMP(3),

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreComponent" (
    "id" TEXT NOT NULL,
    "scoreId" TEXT NOT NULL,
    "component" "ScoreComponentType" NOT NULL,
    "weight" DECIMAL(65,30) NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "details" JSONB,

    CONSTRAINT "ScoreComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventLog" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "orgId" TEXT,
    "insuredId" TEXT,
    "type" "EventType" NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientType" "RecipientType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "channel" "NotifyChannel" NOT NULL,
    "templateCode" TEXT NOT NULL,
    "status" "NotifyStatus" NOT NULL DEFAULT 'QUEUED',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "meta" JSONB,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_inn_key" ON "Organization"("inn");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_orgId_idx" ON "User"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "Insured_inn_key" ON "Insured"("inn");

-- CreateIndex
CREATE INDEX "Insured_industry_idx" ON "Insured"("industry");

-- CreateIndex
CREATE INDEX "Insured_status_idx" ON "Insured"("status");

-- CreateIndex
CREATE INDEX "Survey_version_idx" ON "Survey"("version");

-- CreateIndex
CREATE UNIQUE INDEX "SurveyLink_token_key" ON "SurveyLink"("token");

-- CreateIndex
CREATE INDEX "SurveyLink_insuredId_status_idx" ON "SurveyLink"("insuredId", "status");

-- CreateIndex
CREATE INDEX "SurveyLink_expiresAt_idx" ON "SurveyLink"("expiresAt");

-- CreateIndex
CREATE INDEX "SurveyResponse_insuredId_submittedAt_idx" ON "SurveyResponse"("insuredId", "submittedAt");

-- CreateIndex
CREATE INDEX "Asset_insuredId_type_idx" ON "Asset"("insuredId", "type");

-- CreateIndex
CREATE INDEX "Asset_identifier_idx" ON "Asset"("identifier");

-- CreateIndex
CREATE INDEX "Asset_status_idx" ON "Asset"("status");

-- CreateIndex
CREATE INDEX "Finding_insuredId_severity_idx" ON "Finding"("insuredId", "severity");

-- CreateIndex
CREATE INDEX "Finding_assetId_idx" ON "Finding"("assetId");

-- CreateIndex
CREATE INDEX "Finding_status_idx" ON "Finding"("status");

-- CreateIndex
CREATE INDEX "Finding_cveId_idx" ON "Finding"("cveId");

-- CreateIndex
CREATE INDEX "AuditArtifact_insuredId_type_idx" ON "AuditArtifact"("insuredId", "type");

-- CreateIndex
CREATE INDEX "AuditArtifact_verified_idx" ON "AuditArtifact"("verified");

-- CreateIndex
CREATE INDEX "Assertion_insuredId_key_idx" ON "Assertion"("insuredId", "key");

-- CreateIndex
CREATE INDEX "Assertion_status_idx" ON "Assertion"("status");

-- CreateIndex
CREATE INDEX "Contradiction_insuredId_severity_idx" ON "Contradiction"("insuredId", "severity");

-- CreateIndex
CREATE INDEX "Contradiction_assertionId_idx" ON "Contradiction"("assertionId");

-- CreateIndex
CREATE INDEX "Contradiction_findingId_idx" ON "Contradiction"("findingId");

-- CreateIndex
CREATE INDEX "Score_insuredId_calculatedAt_idx" ON "Score"("insuredId", "calculatedAt");

-- CreateIndex
CREATE INDEX "Score_band_idx" ON "Score"("band");

-- CreateIndex
CREATE INDEX "ScoreComponent_scoreId_component_idx" ON "ScoreComponent"("scoreId", "component");

-- CreateIndex
CREATE INDEX "EventLog_type_createdAt_idx" ON "EventLog"("type", "createdAt");

-- CreateIndex
CREATE INDEX "EventLog_insuredId_idx" ON "EventLog"("insuredId");

-- CreateIndex
CREATE INDEX "Notification_status_idx" ON "Notification"("status");

-- CreateIndex
CREATE INDEX "Notification_recipientType_recipientId_idx" ON "Notification"("recipientType", "recipientId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyLink" ADD CONSTRAINT "SurveyLink_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyLink" ADD CONSTRAINT "SurveyLink_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyLink" ADD CONSTRAINT "SurveyLink_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "SurveyLink"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditArtifact" ADD CONSTRAINT "AuditArtifact_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assertion" ADD CONSTRAINT "Assertion_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assertion" ADD CONSTRAINT "Assertion_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "SurveyLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assertion" ADD CONSTRAINT "Assertion_artifactId_fkey" FOREIGN KEY ("artifactId") REFERENCES "AuditArtifact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contradiction" ADD CONSTRAINT "Contradiction_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contradiction" ADD CONSTRAINT "Contradiction_assertionId_fkey" FOREIGN KEY ("assertionId") REFERENCES "Assertion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contradiction" ADD CONSTRAINT "Contradiction_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreComponent" ADD CONSTRAINT "ScoreComponent_scoreId_fkey" FOREIGN KEY ("scoreId") REFERENCES "Score"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventLog" ADD CONSTRAINT "EventLog_insuredId_fkey" FOREIGN KEY ("insuredId") REFERENCES "Insured"("id") ON DELETE SET NULL ON UPDATE CASCADE;
