-- CreateTable
CREATE TABLE "CompanyApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "encryptedSecret" TEXT NOT NULL,
    "secretPrefix" TEXT NOT NULL,
    "secretLast4" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CompanyApiKey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LandingPad" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "rejectionReason" TEXT NOT NULL DEFAULT '',
    "ownerId" TEXT,
    "imageUrl" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'WAITING_FOR_REVIEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LandingPad_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LandingPad" ("availability", "createdAt", "description", "id", "imageUrl", "latitude", "longitude", "name", "ownerId", "rejectionReason", "status", "type", "updatedAt") SELECT "availability", "createdAt", "description", "id", "imageUrl", "latitude", "longitude", "name", "ownerId", "rejectionReason", "status", "type", "updatedAt" FROM "LandingPad";
DROP TABLE "LandingPad";
ALTER TABLE "new_LandingPad" RENAME TO "LandingPad";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CompanyApiKey_secretHash_key" ON "CompanyApiKey"("secretHash");

-- CreateIndex
CREATE INDEX "CompanyApiKey_userId_createdAt_idx" ON "CompanyApiKey"("userId", "createdAt");
