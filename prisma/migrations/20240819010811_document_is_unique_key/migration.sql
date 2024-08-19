/*
  Warnings:

  - A unique constraint covering the columns `[document]` on the table `members` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "members_document_key" ON "members"("document");
