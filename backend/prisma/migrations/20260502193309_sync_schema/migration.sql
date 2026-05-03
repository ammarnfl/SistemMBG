-- AlterTable
ALTER TABLE "distribusi" ADD COLUMN     "menuId" TEXT;

-- AlterTable
ALTER TABLE "menu_master" ADD COLUMN     "dapurId" TEXT;

-- CreateTable
CREATE TABLE "tim_dapur_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dapurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tim_dapur_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tim_dapur_profiles_userId_key" ON "tim_dapur_profiles"("userId");

-- AddForeignKey
ALTER TABLE "tim_dapur_profiles" ADD CONSTRAINT "tim_dapur_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tim_dapur_profiles" ADD CONSTRAINT "tim_dapur_profiles_dapurId_fkey" FOREIGN KEY ("dapurId") REFERENCES "dapur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_master" ADD CONSTRAINT "menu_master_dapurId_fkey" FOREIGN KEY ("dapurId") REFERENCES "dapur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distribusi" ADD CONSTRAINT "distribusi_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "menu_master"("id") ON DELETE SET NULL ON UPDATE CASCADE;
