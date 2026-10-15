-- Ejecutar conectado a la base de datos "vestigia".
-- Datos semilla con UUID fijos. Se puede ejecutar varias veces sin error.
INSERT INTO salas (id, nombre, descripcion, escenario, activa, creada_en) VALUES
  ('c1b7a1de-5f0e-4a58-9a3e-0b5a7f6d1a01', 'Puesto del pescador', 'Donde suena la radio por primera vez.',            'pueblo',       TRUE, '2026-10-14 09:00:00'),
  ('c1b7a1de-5f0e-4a58-9a3e-0b5a7f6d1a02', 'Plaza del pueblo',    'Centro del pueblo, con el kiosco y la fuente seca.', 'pueblo',       TRUE, '2026-10-14 09:01:00'),
  ('c1b7a1de-5f0e-4a58-9a3e-0b5a7f6d1a03', 'Base del faro',       'Primer nivel del faro: la puerta y la escalera.',   'faro',         TRUE, '2026-10-14 09:02:00'),
  ('c1b7a1de-5f0e-4a58-9a3e-0b5a7f6d1a04', 'Escalera del faro',   'Segundo nivel, con ventanas hacia el mar.',         'faro',         TRUE, '2026-10-14 09:03:00'),
  ('c1b7a1de-5f0e-4a58-9a3e-0b5a7f6d1a05', 'Linterna del faro',   'Tercer nivel, donde está la lente.',                'faro',         TRUE, '2026-10-14 09:04:00'),
  ('c1b7a1de-5f0e-4a58-9a3e-0b5a7f6d1a06', 'Cúpula del telescopio','Cúpula del observatorio en la cima.',              'observatorio', TRUE, '2026-10-14 09:05:00')
ON CONFLICT (id) DO NOTHING;
