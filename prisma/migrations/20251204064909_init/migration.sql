-- CreateTable
CREATE TABLE "Customer" (
    "code" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "idNumber" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "famSize" INTEGER NOT NULL,
    "premium" DOUBLE PRECISION NOT NULL,
    "productCode" INTEGER NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("code")
);
