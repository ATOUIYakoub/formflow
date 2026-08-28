-- CreateEnum
CREATE TYPE "RuleOperator" AS ENUM ('EQUALS', 'NOT_EQUALS', 'CONTAINS', 'GREATER_THAN', 'LESS_THAN', 'IS_EMPTY', 'IS_NOT_EMPTY');

-- CreateEnum
CREATE TYPE "RuleAction" AS ENUM ('SHOW', 'HIDE');

-- CreateTable
CREATE TABLE "form_rules" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "source_field_id" TEXT NOT NULL,
    "operator" "RuleOperator" NOT NULL,
    "value" JSONB,
    "action" "RuleAction" NOT NULL,
    "target_field_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "form_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "form_rules_form_id_idx" ON "form_rules"("form_id");

-- AddForeignKey
ALTER TABLE "form_rules" ADD CONSTRAINT "form_rules_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "forms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_rules" ADD CONSTRAINT "form_rules_source_field_id_fkey" FOREIGN KEY ("source_field_id") REFERENCES "form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_rules" ADD CONSTRAINT "form_rules_target_field_id_fkey" FOREIGN KEY ("target_field_id") REFERENCES "form_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
