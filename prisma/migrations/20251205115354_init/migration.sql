-- CreateEnum
CREATE TYPE "Sharing" AS ENUM ('PF', 'PP');

-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('SP', 'CH');

-- CreateTable
CREATE TABLE "MedicalProduct" (
    "code" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MedicalProduct_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ProductLimit" (
    "code" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "limit" INTEGER NOT NULL,
    "rate" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "medicalProductCode" INTEGER,

    CONSTRAINT "ProductLimit_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ProductRate" (
    "code" SERIAL NOT NULL,
    "productCode" INTEGER NOT NULL,
    "familySize" INTEGER NOT NULL,
    "sharing" "Sharing" NOT NULL,

    CONSTRAINT "ProductRate_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "CustomerDependant" (
    "code" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "relationship" "Relationship" NOT NULL,
    "customerCode" INTEGER,

    CONSTRAINT "CustomerDependant_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicalProduct_name_key" ON "MedicalProduct"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductLimit_medicalProductCode_name_key" ON "ProductLimit"("medicalProductCode", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductRate_productCode_familySize_sharing_key" ON "ProductRate"("productCode", "familySize", "sharing");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerDependant_customerCode_fullName_dob_key" ON "CustomerDependant"("customerCode", "fullName", "dob");

-- AddForeignKey
ALTER TABLE "ProductLimit" ADD CONSTRAINT "ProductLimit_medicalProductCode_fkey" FOREIGN KEY ("medicalProductCode") REFERENCES "MedicalProduct"("code") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductRate" ADD CONSTRAINT "ProductRate_productCode_fkey" FOREIGN KEY ("productCode") REFERENCES "MedicalProduct"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_productCode_fkey" FOREIGN KEY ("productCode") REFERENCES "MedicalProduct"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerDependant" ADD CONSTRAINT "CustomerDependant_customerCode_fkey" FOREIGN KEY ("customerCode") REFERENCES "Customer"("code") ON DELETE SET NULL ON UPDATE CASCADE;
