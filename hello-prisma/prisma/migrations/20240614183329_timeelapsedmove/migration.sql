/*
  Warnings:

  - You are about to drop the column `totalTimeElapsed` on the `Timer` table. All the data in the column will be lost.
  - Added the required column `totalTimeElapsed` to the `TimerPeriod` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Timer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "issueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Timer_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Timer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Timer" ("id", "issueId", "userId") SELECT "id", "issueId", "userId" FROM "Timer";
DROP TABLE "Timer";
ALTER TABLE "new_Timer" RENAME TO "Timer";
CREATE TABLE "new_TimerPeriod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timerId" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "totalTimeElapsed" INTEGER NULL,
    CONSTRAINT "TimerPeriod_timerId_fkey" FOREIGN KEY ("timerId") REFERENCES "Timer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TimerPeriod" ("endDate", "id", "startDate", "timerId") SELECT "endDate", "id", "startDate", "timerId" FROM "TimerPeriod";
DROP TABLE "TimerPeriod";
ALTER TABLE "new_TimerPeriod" RENAME TO "TimerPeriod";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
