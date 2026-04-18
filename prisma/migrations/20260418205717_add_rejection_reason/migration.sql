-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LandingPad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "rejectionReason" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING_FOR_REVIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_LandingPad" ("availability", "createdAt", "description", "id", "imageUrl", "latitude", "longitude", "name", "status", "type", "updatedAt") SELECT "availability", "createdAt", "description", "id", "imageUrl", "latitude", "longitude", "name", "status", "type", "updatedAt" FROM "LandingPad";
DROP TABLE "LandingPad";
ALTER TABLE "new_LandingPad" RENAME TO "LandingPad";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
