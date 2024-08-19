-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_members_of_companies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "member_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "member_share_capital" REAL NOT NULL,
    "legally_responsible" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "members_of_companies_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "members_of_companies_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_members_of_companies" ("company_id", "created_at", "id", "member_id", "member_share_capital", "updated_at") SELECT "company_id", "created_at", "id", "member_id", "member_share_capital", "updated_at" FROM "members_of_companies";
DROP TABLE "members_of_companies";
ALTER TABLE "new_members_of_companies" RENAME TO "members_of_companies";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
