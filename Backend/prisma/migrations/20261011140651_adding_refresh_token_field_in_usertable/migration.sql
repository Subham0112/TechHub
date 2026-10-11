-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshtoken" TEXT,
ADD COLUMN     "token_version" INTEGER NOT NULL DEFAULT 0;
