-- Vestigia - Laboratorio de pruebas
-- Verificacion de persistencia e integridad

-- Cantidad de pueblos registrados
SELECT COUNT(*) AS total_pueblos
FROM codigos_pueblo;

-- Usuarios registrados
SELECT id, nombre, correo, rol, activo, creado_en
FROM usuarios
ORDER BY creado_en;

-- Verificacion del hash de las contrasenas
SELECT correo,
       rol,
       activo,
       LENGTH(password_hash) AS longitud_hash,
       LEFT(password_hash, 4) AS prefijo_hash
FROM usuarios
WHERE correo LIKE '%@lab.test';

-- Verificacion de correos duplicados
SELECT correo, COUNT(*) AS cantidad
FROM usuarios
GROUP BY correo
HAVING COUNT(*) > 1;