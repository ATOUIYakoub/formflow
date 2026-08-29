-- CreateTable
CREATE TABLE "form_analytics" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "starts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_analytics_form_id_idx" ON "form_analytics"("form_id");

-- CreateIndex
CREATE UNIQUE INDEX "form_analytics_form_id_date_key" ON "form_analytics"("form_id", "date");
