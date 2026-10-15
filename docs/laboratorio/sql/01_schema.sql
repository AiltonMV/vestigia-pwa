-- Ejecutar conectado a la base de datos "vestigia".
-- Esquema provisional de la entidad salas. Idempotente.
CREATE TABLE IF NOT EXISTS salas (
  id          UUID PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL,
  descripcion TEXT,
  escenario   VARCHAR(20)  NOT NULL CHECK (escenario IN ('pueblo','faro','observatorio')),
  activa      BOOLEAN      NOT NULL DEFAULT TRUE,
  creada_en   TIMESTAMP    NOT NULL DEFAULT NOW()
);
