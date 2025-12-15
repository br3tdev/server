/*
  Warnings:

  - You are about to drop the `MedicalCustomerPolicyProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MedicalCustomerPolicyProduct" DROP CONSTRAINT "MedicalCustomerPolicyProduct_policyCode_fkey";

-- DropForeignKey
ALTER TABLE "MedicalCustomerPolicyProduct" DROP CONSTRAINT "MedicalCustomerPolicyProduct_productCode_fkey";

-- AlterTable
ALTER TABLE "MedicalProduct" ADD COLUMN     "medicalCustomerPolicyCode" INTEGER;

-- DropTable
DROP TABLE "MedicalCustomerPolicyProduct";

-- AddForeignKey
ALTER TABLE "MedicalProduct" ADD CONSTRAINT "MedicalProduct_medicalCustomerPolicyCode_fkey" FOREIGN KEY ("medicalCustomerPolicyCode") REFERENCES "MedicalCustomerPolicy"("code") ON DELETE SET NULL ON UPDATE CASCADE;
