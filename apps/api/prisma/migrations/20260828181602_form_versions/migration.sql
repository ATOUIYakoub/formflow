-- AlterTable
ALTER TABLE "submissions" ADD COLUMN     "form_version_id" TEXT;

-- CreateTable
CREATE TABLE "form_versions" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_versions_form_id_idx" ON "form_versions"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_versions_form_id_version_key" ON "form_versions"("form_id", "version");

-- CreateIndex
CREATE INDEX "submissions_form_version_id_idx" ON "submissions"("form_version_id");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_form_version_id_fkey" FOREIGN KEY ("form_version_id") REFERENCES "form_versions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
