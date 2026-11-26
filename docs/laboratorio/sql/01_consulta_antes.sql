-- Vestigia - Laboratorio de pruebas
-- Consulta del estado inicial de la base de datos

SELECT COUNT(*) AS total_pueblos
FROM codigos_pueblo;

SELECT id, nombre, correo, rol, activo, creado_en
FROM usuarios
ORDER BY creado_en;