-- Vestigia - Laboratorio de pruebas
-- Preparacion del estado inicial

BEGIN;

-- Eliminar exclusivamente usuarios de prueba
DELETE FROM usuarios
WHERE correo LIKE '%@lab.test';

COMMIT;

-- Verificar cantidad de pueblos
SELECT COUNT(*) AS total_pueblos
FROM codigos_pueblo;

-- Verificar usuarios existentes
SELECT id, nombre, correo, rol, activo, creado_en
FROM usuarios
ORDER BY creado_en;

-- Verificar cantidad de salas
SELECT COUNT(*) AS total_salas
FROM salas;