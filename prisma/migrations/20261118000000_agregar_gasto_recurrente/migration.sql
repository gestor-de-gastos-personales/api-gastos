-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "GastoRecurrente" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "monto" DECIMAL(65,30) NOT NULL,
    "comercio" TEXT,
    "categoriaId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "frecuencia" TEXT NOT NULL,
    "diaSemana" INTEGER,
    "diaMes" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimaEjecucion" TIMESTAMP(3),
    "proximaEjecucion" TIMESTAMP(3) NOT NULL,
    "notificado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GastoRecurrente_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GastoRecurrente" ADD CONSTRAINT "GastoRecurrente_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GastoRecurrente" ADD CONSTRAINT "GastoRecurrente_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
