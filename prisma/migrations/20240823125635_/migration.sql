/*
  Warnings:

  - A unique constraint covering the columns `[document]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[document]` on the table `invoice_recipients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "companies_document_key" ON "companies"("document");

-- CreateIndex
CREATE UNIQUE INDEX "invoice_recipients_document_key" ON "invoice_recipients"("document");
