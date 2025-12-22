/*
  Warnings:

  - You are about to drop the `CustomerDependant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalBenefits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalCustomer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalCustomerPolicy` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicalProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SharingType" AS ENUM ('PF', 'PP');

-- DropForeignKey
ALTER TABLE "CustomerDependant" DROP CONSTRAINT "CustomerDependant_customerCode_fkey";

-- DropForeignKey
ALTER TABLE "MedicalBenefits" DROP CONSTRAINT "MedicalBenefits_medicalProductCode_fkey";

-- DropForeignKey
ALTER TABLE "MedicalCustomerPolicy" DROP CONSTRAINT "MedicalCustomerPolicy_customerCode_fkey";

-- DropForeignKey
ALTER TABLE "MedicalProduct" DROP CONSTRAINT "MedicalProduct_medicalCustomerPolicyCode_fkey";

-- DropTable
DROP TABLE "CustomerDependant";

-- DropTable
DROP TABLE "MedicalBenefits";

-- DropTable
DROP TABLE "MedicalCustomer";

-- DropTable
DROP TABLE "MedicalCustomerPolicy";

-- DropTable
DROP TABLE "MedicalProduct";

-- DropEnum
DROP TYPE "Sharing";

-- CreateTable
CREATE TABLE "medical_products" (
    "code" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "medical_products_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "medical_benefits" (
    "code" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "medicalProductCode" INTEGER NOT NULL,

    CONSTRAINT "medical_benefits_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "medical_customers" (
    "code" SERIAL NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "dob" VARCHAR(30) NOT NULL,
    "idNumber" VARCHAR(50) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "mobileNumber" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_customers_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "medical_customer_policies" (
    "code" SERIAL NOT NULL,
    "customerCode" INTEGER NOT NULL,
    "premium" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "medical_customer_policies_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "customer_dependants" (
    "code" SERIAL NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "dob" VARCHAR(30) NOT NULL,
    "relationship" "Relationship" NOT NULL,
    "customerCode" INTEGER NOT NULL,

    CONSTRAINT "customer_dependants_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "_PolicyProducts" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PolicyProducts_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "medical_products_name_key" ON "medical_products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "medical_benefits_name_key" ON "medical_benefits"("name");

-- CreateIndex
CREATE INDEX "medical_benefits_medicalProductCode_idx" ON "medical_benefits"("medicalProductCode");

-- CreateIndex
CREATE INDEX "medical_customers_mobileNumber_idx" ON "medical_customers"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "medical_customers_email_key" ON "medical_customers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "medical_customers_idNumber_key" ON "medical_customers"("idNumber");

-- CreateIndex
CREATE INDEX "medical_customer_policies_customerCode_idx" ON "medical_customer_policies"("customerCode");

-- CreateIndex
CREATE INDEX "customer_dependants_customerCode_idx" ON "customer_dependants"("customerCode");

-- CreateIndex
CREATE UNIQUE INDEX "customer_dependants_customerCode_fullName_key" ON "customer_dependants"("customerCode", "fullName");

-- CreateIndex
CREATE INDEX "_PolicyProducts_B_index" ON "_PolicyProducts"("B");

-- AddForeignKey
ALTER TABLE "medical_benefits" ADD CONSTRAINT "medical_benefits_medicalProductCode_fkey" FOREIGN KEY ("medicalProductCode") REFERENCES "medical_products"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_customer_policies" ADD CONSTRAINT "medical_customer_policies_customerCode_fkey" FOREIGN KEY ("customerCode") REFERENCES "medical_customers"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_dependants" ADD CONSTRAINT "customer_dependants_customerCode_fkey" FOREIGN KEY ("customerCode") REFERENCES "medical_customers"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PolicyProducts" ADD CONSTRAINT "_PolicyProducts_A_fkey" FOREIGN KEY ("A") REFERENCES "medical_customer_policies"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PolicyProducts" ADD CONSTRAINT "_PolicyProducts_B_fkey" FOREIGN KEY ("B") REFERENCES "medical_products"("code") ON DELETE CASCADE ON UPDATE CASCADE;
