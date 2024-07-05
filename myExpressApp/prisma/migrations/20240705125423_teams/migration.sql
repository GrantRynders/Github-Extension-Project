-- CreateTable
CREATE TABLE "UsersTeams" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "teamId" INTEGER NOT NULL,
    CONSTRAINT "UsersTeams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsersTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "teamName" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TimerPeriod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timerId" INTEGER NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT NOT NULL,
    "totalTimeElapsed" INTEGER,
    CONSTRAINT "TimerPeriod_timerId_fkey" FOREIGN KEY ("timerId") REFERENCES "Timer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TimerPeriod" ("endDate", "id", "startDate", "timerId", "totalTimeElapsed") SELECT "endDate", "id", "startDate", "timerId", "totalTimeElapsed" FROM "TimerPeriod";
DROP TABLE "TimerPeriod";
ALTER TABLE "new_TimerPeriod" RENAME TO "TimerPeriod";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
