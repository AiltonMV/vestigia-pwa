# Vestigia — Métricas históricas de producción

**Laboratorio de pruebas de la PWA | 26 de noviembre de 2026**

## 1. Fuente y alcance

Este documento resume las mediciones previas del equipo contra Railway, realizadas el **9 de noviembre de 2026**, correspondientes al informe que analiza el commit `6a51818` del backend (`feature/admin-salas`). El commit identifica el código analizado en el informe original, no necesariamente el SHA desplegado en Railway. Las cifras son históricas: no se ejecutaron nuevas solicitudes contra producción para elaborar este resumen.

- Entorno: Railway, borde de red `lax1` (Los Ángeles), sin verificación de la región del contenedor.
- Punto de medición: equipo en Chihuahua, México; una sola conexión a Internet.
- Herramientas: `curl` para REST y Node 25.8.1 para WebSocket.
- REST: 30 peticiones secuenciales por endpoint, sin pausas, con una conexión nueva por petición. El tiempo total incluye DNS, TCP, TLS y respuesta.
- Estadística REST: primera petición separada; mínimo, promedio, mediana, máximo y P95 calculados sobre las 29 restantes, según la metodología original.
- El servicio estaba activo antes de las mediciones. No se evaluó un arranque en frío real.

Fuente: `informe-metricas-backend.md`, secciones 7.1–7.7.

## 2. Resultados REST en producción

Todos los tiempos se expresan en milisegundos. Las rutas abreviadas de salas corresponden a la API `/api/v1`.

### Consultas GET

| Endpoint | HTTP | Primera | Mín. | Prom. | Mediana | Máx. | P95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `GET /actuator/health` | 200 | 196.7 | 161.9 | 183.0 | 175.3 | 238.2 | 206.6 |
| `GET /api/v1/pueblos` | 200 | 184.2 | 166.8 | 218.6 | 180.9 | 1214.3 | 212.9 |
| `GET /api/v1/pueblos?disponibles=true` | 200 | 181.7 | 158.3 | 181.1 | 180.9 | 208.9 | 203.6 |
| `GET /v3/api-docs` | 200 | 223.7 | 196.3 | 219.2 | 216.8 | 242.1 | 240.1 |
| `GET /salas/{codigo}/estado` (juego) | 200 | 193.0 | 164.5 | 187.5 | 182.3 | 337.3 | 202.4 |
| `GET /salas/{codigo}/estado` (app) | 200 | 172.6 | 165.6 | 184.1 | 182.0 | 216.9 | 203.7 |

Fuente: informe original, sección 7.3.

### Operaciones de escritura

| Endpoint | HTTP | Primera | Mín. | Prom. | Mediana | Máx. | P95 |
|---|---:|---:|---:|---:|---:|---:|---:|
| `POST /salas` | 201 | 183.0 | 180.7 | 199.6 | 197.8 | 231.2 | 222.5 |
| `POST /salas/{codigo}/unirse` | 200 | 195.4 | 166.3 | 188.4 | 187.4 | 213.0 | 209.2 |
| `PUT /salas/{codigo}/escena` | 200 | 189.3 | 165.9 | 187.0 | 186.0 | 222.5 | 212.0 |
| `POST /…/descubrimientos` (nuevo) | 201 | 219.6 | 178.8 | 190.0 | 188.8 | 213.0 | 199.2 |
| `POST /…/descubrimientos` (repetido) | 200 | 180.8 | 170.7 | 183.8 | 184.0 | 205.3 | 200.3 |
| `PUT /…/puzzles/radio` | 200 | 219.8 | 170.5 | 184.8 | 185.1 | 199.8 | 195.9 |
| `DELETE /salas/{codigo}` | 204 | 176.7 | 171.6 | 188.7 | 180.4 | 306.8 | 216.3 |

En radio, la primera operación modifica el estado; las otras 29 son repeticiones idempotentes que renuevan la expiración. El informe registra los códigos esperados y la liberación del pueblo utilizado al terminar. No se midieron rutas administrativas ni de autenticación de producción.

Fuente: informe original, secciones 3.1 y 7.4.

## 3. Comunicación en tiempo real y flujo completo

| Medida | Mediana (ms) | P95 (ms) |
|---|---:|---:|
| Handshake WebSocket | 192.0 | 219.0 |
| Conexión + autenticación + `auth.ok` | 260.3 | 295.1 |
| REST a evento `descubrimiento.nuevo` | 80.8 | 94.9 |
| REST a evento `escena.cambiada` | 79.6 | 94.8 |

Las mediciones de eventos emplearon conexiones persistentes y ambos clientes estaban en el mismo equipo. Incluyen la operación REST, la persistencia y la difusión del mensaje, no exclusivamente el tiempo de WebSocket ni una prueba entre dos dispositivos físicos.

El informe original registra 30 de 30 flujos funcionales correctos (radio resuelta y descubrimiento esperado). Reporta para el flujo completo una mediana de 947.3 ms y P95 de 999.5 ms; estos tiempos agregados quedan pendientes de aclaración: la suma de los promedios de sus seis pasos es 1180.4 ms, frente al promedio total publicado de 950.9 ms, y el máximo de un paso (1548.8 ms) supera el máximo del flujo (1086.0 ms). Sin muestras crudas no se puede reconciliar esta diferencia; no se utiliza ese tiempo agregado como conclusión de rendimiento.

Fuente: informe original, secciones 7.5 y 7.6.

## 4. Interpretación

- El endpoint relevante para la consulta del catálogo desde la PWA, `GET /api/v1/pueblos`, registró mediana de 180.9 ms y P95 de 212.9 ms. Una observación de 1214.3 ms elevó el promedio a 218.6 ms; su causa no fue identificada.
- Las rutas REST medidas respondieron con los códigos HTTP esperados. Esto acredita el comportamiento de las muestras históricas, no una garantía de disponibilidad o rendimiento futuro.
- En la descomposición de `/actuator/health` se reportaron tiempos acumulados de DNS de 3.5 ms, TCP de 48.5 ms, TLS de 105.5 ms y primer byte de 171.2 ms. El total publicado es 171.6 ms; difiere del promedio de 183.0 ms de la tabla GET. Se conservan ambas cifras como datos de sus respectivas secciones, sin asumir que son directamente equivalentes ni deducir un tiempo interno del backend.
- Las mediciones locales del laboratorio del 26 de noviembre son distintas de las mediciones históricas de Railway. En C02, DevTools registró 417.06 ms para una petición GET del catálogo, con 401.27 ms de espera y 3524 bytes de contenido; el log local registró 337 ms a las 01:48:06. Cinco registros locales del endpoint fueron 143, 941, 95, 1133 y 337 ms, todos HTTP 200. Son observaciones funcionales, no una prueba de carga ni una comparación controlada con producción.

## 5. Evidencia previa de calidad y oportunidades de mejora

El documento `evidencia-base-mejoras.md` corresponde al **16 de noviembre de 2026**, commit `7f39eb1`. Reporta una revisión del código y pruebas locales de Maven: 170 unitarias y 139 de integración, 309 en total, sin fallos, errores ni omisiones, en 42.049 s. El informe del 9 de noviembre había registrado 307 pruebas sin fallos en 37.167 s. No son mediciones de latencia en Railway ni ejecuciones realizadas durante este laboratorio de la PWA.

| Hallazgo de revisión | Propuesta (no implementada en este laboratorio) |
|---|---|
| No se encontraron índices específicos para `token_juego_hash`, `token_app_hash`, `estado`, `creada_en` ni `expira_en` en `salas`. | Evaluar planes de ejecución y datos representativos antes de introducir índices. |
| HikariCP no tiene configuración explícita en el código analizado. | Medir conexiones activas, pendientes y límites efectivos en un entorno autorizado antes de ajustar el pool. |
| JVM sin parámetros explícitos de memoria en el Dockerfile. | Medir uso de memoria y revisar los límites del contenedor antes de modificar la configuración. |
| El backend utiliza una instancia para mantener las sesiones WebSocket en memoria. | Evaluar capacidad y concurrencia en local antes de proponer cambios de arquitectura. |

No se dispone de `EXPLAIN` de las consultas, valores efectivos del pool en producción ni cobertura de código. Las propuestas son hipótesis, no mejoras de rendimiento verificadas.

## 6. Limitaciones y reglas de uso

- No hubo pruebas de carga concurrente, estrés ni capacidad máxima. Las peticiones REST fueron secuenciales.
- No se midieron CPU, memoria JVM, hilos, pool de conexiones ni tiempos HTTP internos en producción: `/actuator/metrics` devolvió HTTP 404 y solo se exponía `health`.
- No se midieron endpoints administrativos de producción, arranque en frío real, latencia desde otras redes ni planes de ejecución SQL.
- Los valores atípicos y las discrepancias numéricas señaladas no se pueden validar sin las muestras crudas del informe original.
- Las métricas locales de Actuator se recopilan por separado y no deben atribuirse a Railway. La guía de insumos recomienda repetir mediciones en local para complementar las cifras históricas; no se afirma haber reproducido sus 30 muestras por endpoint.

## 7. Fuentes

Repositorio `TheCodeOfGod/vestigia-backend`, rama `feature/laboratorio-pruebas`, carpeta `docs/laboratorio/` (copias proporcionadas por el equipo):

- [informe-metricas-backend.md](https://github.com/TheCodeOfGod/vestigia-backend/blob/feature/laboratorio-pruebas/docs/laboratorio/informe-metricas-backend.md), 09/11/2026, commit analizado `6a51818`, secciones 5, 7 y 8.
- [evidencia-base-mejoras.md](https://github.com/TheCodeOfGod/vestigia-backend/blob/feature/laboratorio-pruebas/docs/laboratorio/evidencia-base-mejoras.md), 16/11/2026, commit `7f39eb1`, secciones 1, 2, 4, 5 y 7.
- [README.md](https://github.com/TheCodeOfGod/vestigia-backend/blob/feature/laboratorio-pruebas/docs/laboratorio/README.md), reglas de ejecución y uso de métricas.
- Evidencias locales del caso C02: `evidencias/devtools/C02-timing.png`, `evidencias/devtools/C02-headers.png` y registros de Spring Boot del 26/11/2026.
