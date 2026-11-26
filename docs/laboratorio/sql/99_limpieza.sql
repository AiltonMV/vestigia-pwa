-- Vestigia - Laboratorio de pruebas
-- Eliminacion exclusiva de usuarios de prueba

BEGIN;

DELETE FROM usuarios
WHERE correo LIKE '%@lab.test';

COMMIT;

-- Verificacion de limpieza
SELECT COUNT(*) AS usuarios_prueba_restantes
FROM usuarios
WHERE correo LIKE '%@lab.test';