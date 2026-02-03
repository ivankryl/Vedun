/*
  Warnings:

  - A unique constraint covering the columns `[version]` on the table `SurveyTemplate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "SurveyTemplate_version_key" ON "SurveyTemplate"("version");
