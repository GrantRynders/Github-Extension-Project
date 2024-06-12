/*
  Warnings:

  - Added the required column `url` to the `Issue` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Issue" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "issueName" TEXT NOT NULL,
    "url" TEXT NOT NULL
);
INSERT INTO "new_Issue" ("id", "issueName") SELECT "id", "issueName" FROM "Issue";
DROP TABLE "Issue";
ALTER TABLE "new_Issue" RENAME TO "Issue";
CREATE UNIQUE INDEX "Issue_issueName_key" ON "Issue"("issueName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
