-- CreateEnum
CREATE TYPE "SprintStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "DailySprint" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "SprintStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailySprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintTask" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintProgress" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalTasks" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailySprint_startDate_endDate_idx" ON "DailySprint"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "DailySprint_status_idx" ON "DailySprint"("status");

-- CreateIndex
CREATE INDEX "DailySprint_createdById_idx" ON "DailySprint"("createdById");

-- CreateIndex
CREATE INDEX "DailySprint_isActive_status_idx" ON "DailySprint"("isActive", "status");

-- CreateIndex
CREATE INDEX "SprintTask_sprintId_order_idx" ON "SprintTask"("sprintId", "order");

-- CreateIndex
CREATE INDEX "SprintTask_taskId_idx" ON "SprintTask"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "SprintTask_sprintId_taskId_key" ON "SprintTask"("sprintId", "taskId");

-- CreateIndex
CREATE INDEX "SprintProgress_userId_sprintId_idx" ON "SprintProgress"("userId", "sprintId");

-- CreateIndex
CREATE INDEX "SprintProgress_sprintId_idx" ON "SprintProgress"("sprintId");

-- CreateIndex
CREATE INDEX "SprintProgress_userId_idx" ON "SprintProgress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SprintProgress_sprintId_userId_key" ON "SprintProgress"("sprintId", "userId");

-- AddForeignKey
ALTER TABLE "DailySprint" ADD CONSTRAINT "DailySprint_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintTask" ADD CONSTRAINT "SprintTask_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "DailySprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintTask" ADD CONSTRAINT "SprintTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintProgress" ADD CONSTRAINT "SprintProgress_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "DailySprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintProgress" ADD CONSTRAINT "SprintProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
