-- CreateTable
CREATE TABLE "BonusConfig" (
    "id" TEXT NOT NULL,
    "TaskType" "TaskType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bonusPercent" DECIMAL(65,30) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonusConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BonusConfig_TaskType_key" ON "BonusConfig"("TaskType");

-- CreateIndex
CREATE UNIQUE INDEX "BonusConfig_name_key" ON "BonusConfig"("name");
