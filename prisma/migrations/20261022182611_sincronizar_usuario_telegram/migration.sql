-- Alinear la tabla Usuario con el schema Prisma actual:
-- telegramId opcional y único, email/password/nombre opcionales, updatedAt.
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "telegramId" TEXT;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "Usuario" ALTER COLUMN "email" DROP NOT NULL;
ALTER TABLE "Usuario" ALTER COLUMN "password" DROP NOT NULL;
ALTER TABLE "Usuario" ALTER COLUMN "nombre" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Usuario_telegramId_key" ON "Usuario"("telegramId");
