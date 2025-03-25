/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Filter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Filter_name_key" ON "Filter"("name");

-- CreateIndex
CREATE INDEX "Photo_filterId_idx" ON "Photo"("filterId");

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "Filter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
