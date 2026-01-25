-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('STANDARD', 'HIGH_VALUE', 'PREMIUM');

-- CreateTable
CREATE TABLE "LevelConfig" (
    "level" INTEGER NOT NULL,
    "xpRequired" INTEGER NOT NULL,
    "earningMultiplier" DECIMAL(65,30) NOT NULL,
    "unlockedTaskTypes" "TaskType"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LevelConfig_pkey" PRIMARY KEY ("level")
);
