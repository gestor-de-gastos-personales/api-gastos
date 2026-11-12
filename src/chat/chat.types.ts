/** Archivo recibido por el proxy (subconjunto de Express.Multer.File). */
export interface ArchivoSubido {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}
