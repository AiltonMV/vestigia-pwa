/** Un pueblo del catálogo tal como lo devuelve `GET /api/v1/pueblos`. */
export interface PuebloDto {
  /** Nombre en mayúsculas, sin acentos ni ñ: `"BACALAR"`. Es el código de sala. */
  codigo: string;
  /** `false` mientras una partida lo está usando. */
  libre: boolean;
}
