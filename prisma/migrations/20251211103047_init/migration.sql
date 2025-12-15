-- CreateEnum
CREATE TYPE "Sharing" AS ENUM ('PF', 'PP');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('SPOUSE', 'CHILD');

-- CreateTable
CREATE TABLE "MedicalProduct" (
    "code" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MedicalProduct_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "MedicalBenefits" (
    "code" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "medicalProductCode" INTEGER NOT NULL,

    CONSTRAINT "MedicalBenefits_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "MedicalCustomer" (
    "code" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "idNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalCustomer_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "MedicalCustomerPolicy" (
    "code" SERIAL NOT NULL,
    "customerCode" INTEGER NOT NULL,
    "premium" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "MedicalCustomerPolicy_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "MedicalCustomerPolicyProduct" (
    "code" SERIAL NOT NULL,
    "policyCode" INTEGER NOT NULL,
    "productCode" INTEGER NOT NULL,

    CONSTRAINT "MedicalCustomerPolicyProduct_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "CustomerDependant" (
    "code" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "relationship" "Relationship" NOT NULL,
    "customerCode" INTEGER NOT NULL,

    CONSTRAINT "CustomerDependant_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalProduct_name_key" ON "MedicalProduct"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalBenefits_name_key" ON "MedicalBenefits"("name");

-- CreateIndex
CREATE INDEX "MedicalCustomer_mobileNumber_idx" ON "MedicalCustomer"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalCustomer_email_key" ON "MedicalCustomer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalCustomer_idNumber_key" ON "MedicalCustomer"("idNumber");

-- CreateIndex
CREATE INDEX "MedicalCustomerPolicyProduct_productCode_idx" ON "MedicalCustomerPolicyProduct"("productCode");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalCustomerPolicyProduct_policyCode_productCode_key" ON "MedicalCustomerPolicyProduct"("policyCode", "productCode");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDependant_customerCode_fullName_key" ON "CustomerDependant"("customerCode", "fullName");

-- AddForeignKey
ALTER TABLE "MedicalBenefits" ADD CONSTRAINT "MedicalBenefits_medicalProductCode_fkey" FOREIGN KEY ("medicalProductCode") REFERENCES "MedicalProduct"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalCustomerPolicy" ADD CONSTRAINT "MedicalCustomerPolicy_customerCode_fkey" FOREIGN KEY ("customerCode") REFERENCES "MedicalCustomer"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalCustomerPolicyProduct" ADD CONSTRAINT "MedicalCustomerPolicyProduct_policyCode_fkey" FOREIGN KEY ("policyCode") REFERENCES "MedicalCustomerPolicy"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalCustomerPolicyProduct" ADD CONSTRAINT "MedicalCustomerPolicyProduct_productCode_fkey" FOREIGN KEY ("productCode") REFERENCES "MedicalProduct"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDependant" ADD CONSTRAINT "CustomerDependant_customerCode_fkey" FOREIGN KEY ("customerCode") REFERENCES "MedicalCustomer"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
