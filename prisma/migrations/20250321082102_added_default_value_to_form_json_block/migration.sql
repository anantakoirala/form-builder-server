/*
  Warnings:

  - Made the column `jsonBlocks` on table `Form` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "jsonBlocks" SET NOT NULL,
ALTER COLUMN "jsonBlocks" SET DEFAULT '[]';

-- CreateTable
CREATE TABLE "FormSettings" (
    "id" SERIAL NOT NULL,
    "primaryColor" TEXT NOT NULL,
    "backgroundColor" TEXT NOT NULL,
    "formId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FormSettings" ADD CONSTRAINT "FormSettings_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
