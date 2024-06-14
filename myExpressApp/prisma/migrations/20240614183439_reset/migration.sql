/*
  Warnings:

  - Made the column `totalTimeElapsed` on table `TimerPeriod` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TimerPeriod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timerId" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "totalTimeElapsed" INTEGER NOT NULL,
    CONSTRAINT "TimerPeriod_timerId_fkey" FOREIGN KEY ("timerId") REFERENCES "Timer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TimerPeriod" ("endDate", "id", "startDate", "timerId", "totalTimeElapsed") SELECT "endDate", "id", "startDate", "timerId", "totalTimeElapsed" FROM "TimerPeriod";
DROP TABLE "TimerPeriod";
ALTER TABLE "new_TimerPeriod" RENAME TO "TimerPeriod";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
