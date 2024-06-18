/*
  Warnings:

  - Added the required column `totalTimeElapsed` to the `Timer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Timer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "issueId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "totalTimeElapsed" INTEGER NOT NULL,
    CONSTRAINT "Timer_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Timer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Timer" ("id", "issueId", "userId") SELECT "id", "issueId", "userId" FROM "Timer";
DROP TABLE "Timer";
ALTER TABLE "new_Timer" RENAME TO "Timer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
