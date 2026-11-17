interface RespuestaError {
  status: number;
  mensaje: (target: string) => string;
}

/** Mapa de códigos de Prisma a respuestas HTTP legibles. */
export const respuestas: Record<string, RespuestaError> = {
  P2002: {
    status: 409,
    mensaje: (target) =>
      `Violación de restricción única en: [${target}]`,
  },
  P2025: {
    status: 404,
    mensaje: () =>
      'El registro solicitado no fue encontrado en la base de datos.',
  },
  P2003: {
    status: 400,
    mensaje: () =>
      'Operación no permitida: referencia a un registro inexistente (Clave foránea inválida).',
  },
};
