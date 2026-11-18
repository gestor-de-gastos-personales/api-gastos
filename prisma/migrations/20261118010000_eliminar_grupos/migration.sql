-- DropForeignKey
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_grupoId_fkey";

-- DropForeignKey
ALTER TABLE "Grupo" DROP CONSTRAINT "Grupo_usuarioId_fkey";

-- DropForeignKey
ALTER TABLE "GrupoMiembro" DROP CONSTRAINT "GrupoMiembro_grupoId_fkey";

-- DropForeignKey
ALTER TABLE "GrupoMiembro" DROP CONSTRAINT "GrupoMiembro_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Gasto" DROP COLUMN "grupoId";

-- DropTable
DROP TABLE "Grupo";

-- DropTable
DROP TABLE "GrupoMiembro";
