/*
  Warnings:

  - You are about to drop the column `id_categoria_fk` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Gasto` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `Gasto` table. All the data in the column will be lost.
  - Added the required column `categoriaId` to the `Gasto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `monto` to the `Gasto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuarioId` to the `Gasto` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_id_categoria_fk_fkey";

-- AlterTable
ALTER TABLE "Gasto" DROP COLUMN "id_categoria_fk",
DROP COLUMN "updatedAt",
DROP COLUMN "valor",
ADD COLUMN     "categoriaId" INTEGER NOT NULL,
ADD COLUMN     "monto" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "usuarioId" INTEGER NOT NULL,
ALTER COLUMN "fecha" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
