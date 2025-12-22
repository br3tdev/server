/*
  Warnings:

  - Added the required column `policyType` to the `medical_customer_policies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "medical_customer_policies" ADD COLUMN     "policyType" "SharingType" NOT NULL;
