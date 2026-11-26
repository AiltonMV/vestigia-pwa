# Vestigia — Laboratorio de pruebas de la PWA

**Fecha de ejecución:** 26 de noviembre de 2026  
**Práctica:** Desarrollo y heteroevaluación de una PWA avanzada — Pruebas y entrega  
**Rama de trabajo de la PWA:** `feature/laboratorio-evidencias`  
**HEAD de la PWA registrado al finalizar las pruebas:** `8c2e2f09498ef2c4b87465eeeb49c61ef40d31ab`

## 1. Objetivo y alcance

Validar la integración de la PWA de Vestigia con su API REST y PostgreSQL, mediante consultas, altas de administradores, comprobaciones de integridad, almacenamiento local, funcionamiento sin conexión y sincronización al recuperar la red. Complementar las pruebas funcionales con auditorías de rendimiento y seguridad.

Se utilizó una instalación local de prueba. No se modificó el código funcional durante las pruebas; se integraron en la rama de trabajo los cambios existentes de `develop`, incluido el commit `868a760` de la cola offline. Los casos anteriores a la integración se ejecutaron sobre la versión previa; el HEAD registrado corresponde al cierre de las pruebas, no a todas las ejecuciones. Las mediciones de Railway se presentan por separado como antecedentes históricos del equipo. Conforme a las secciones 3 y 9 de la guía, no se realizaron escaneos de seguridad ni pruebas de carga contra producción. Los hallazgos se reportan para revisión; no se despliegan correcciones ni se fusiona la rama desde este laboratorio.

## 2. Entorno y herramientas

| Componente | Tecnología / configuración observada |
|---|---|
| Sistema operativo | Windows, PowerShell |
| Frontend | React, Vite, Service Worker (Workbox), Cache Storage e IndexedDB; `http://localhost:4173` |
| Renderizado | CSR (React); no se verificó SSR |
| Backend | Spring Boot 4.1.1, Java 25.0.2, API REST; `http://localhost:8090` |
| Base de datos | PostgreSQL 17.12 en Docker, contenedor `vestigia-pg`, base `vestigia`, puerto 5432 |
| Migraciones | Flyway, versiones V1–V4 aplicadas |
| Navegadores | Brave, Chromium 158 según User-Agent registrado (Chrome/158.0.0.0); Edge para ZAP. No se comprobó el número completo de versión de Brave o Edge ni se utilizó Chrome independiente en las capturas examinadas |
| Node.js / npm | Node.js `v24.20.0`; npm `11.19.0` |
| Docker | `29.8.2`, build `7fc2dff` |
| JDK | Eclipse Temurin OpenJDK `25.0.2+10-LTS`, JVM de 64 bits; la guía recomienda Java 21, pero el laboratorio se ejecutó con Java 25.0.2 |
| Git — PWA | `8c2e2f09498ef2c4b87465eeeb49c61ef40d31ab` (HEAD al finalizar) |
| Git — backend | Rama `main`, commit `6dc7c92946bfa029d54e51cbc6fcde3b73a3e9be` (merge del PR #24, 12 de noviembre de 2026), tomado de la copia local con la que se ejecutaron las pruebas |
| Herramientas de pruebas | DevTools, Lighthouse, Spring Boot Actuator, psql, OWASP ZAP 2.17.0 |

Se utilizó el puerto 8090 para el backend porque los puertos 8080 y 8081 estaban ocupados por el proceso System (PID 4). La PWA conservó el puerto 4173 y se configuró para usar la API real, sin mock.

Repositorios: [PWA](https://github.com/AiltonMV/vestigia-pwa) y [backend](https://github.com/TheCodeOfGod/vestigia-backend).

## 3. Reproducción del laboratorio

### 3.1. Preparación

Clonar ambos repositorios en carpetas hermanas y trabajar en una rama de evidencias derivada de `develop` de la PWA. Registrar los SHA efectivos de ambos repositorios (`git rev-parse HEAD`) para identificar la versión probada. Comprobar las versiones locales con `node -v`, `npm -v`, `java -version`, `docker --version` y la página de información del navegador.

Con Docker Desktop abierto, iniciar el contenedor local existente y comprobar PostgreSQL:

```powershell
docker start vestigia-pg
docker exec vestigia-pg pg_isready -U postgres -d vestigia
```

Si el contenedor no existe y el puerto 5432 está libre, crear una base de laboratorio aislada con la imagen `postgres:17-alpine`, el nombre `vestigia-pg`, la base `vestigia` y las credenciales locales de la guía (sección 6.1). No recrear un contenedor existente ni apuntar a producción.

### 3.2. Backend (terminal 1)

Desde `vestigia-backend`, configurar las variables `ADMIN_BOOTSTRAP_EMAIL` y `ADMIN_BOOTSTRAP_PASSWORD` con las credenciales locales de la guía, sin incluir sus valores en archivos versionados. Ajustar las variables de conexión PostgreSQL si difieren de los valores de desarrollo del proyecto. Ejecutar:

```powershell
$env:SERVER_PORT = "8090"
$env:SPRING_APPLICATION_JSON = '{"logging.level.org.hibernate.SQL":"DEBUG","logging.level.org.hibernate.orm.jdbc.bind":"TRACE"}'
$env:MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE = "health,metrics"
$env:LOGGING_FILE_NAME = "logs/vestigia-backend.log"
.\mvnw.cmd spring-boot:run
```

En otra terminal:

```powershell
curl.exe http://localhost:8090/actuator/health
```

Resultado esperado: `status: UP`. `LOGGING_LEVEL_ORG_HIBERNATE_SQL` no activa el SQL, porque el logger se llama `org.hibernate.SQL` y la variable de entorno lo convierte a minúsculas; por eso se usa `SPRING_APPLICATION_JSON`. Los logs completos de Hibernate pueden contener información sensible: no se deben adjuntar sin revisión.

### 3.3. PWA (terminal 2)

Desde `vestigia-pwa`, crear `.env` a partir de `.env.example` si no existe. Ajustar estas variables, conservando las demás:

```dotenv
VITE_API_URL=http://localhost:8090
VITE_API_MOCK=false
```

```powershell
npm ci
npm run build
npm run preview -- --port 4173 --strictPort
```

Abrir `/salas` para comprobar el catálogo y `/dashboard/usuarios` para las altas, con una sesión de administrador local. Mantener ambos servidores ejecutándose. Tras actualizar la PWA, comprobar que el Service Worker activo corresponde a la compilación reciente.

### 3.4. Scripts SQL (terminal 3)

| Archivo | Propósito |
|---|---|
| `sql/00_estado_inicial.sql` | Eliminar usuarios de prueba y verificar el estado inicial. La variante preparada no elimina salas, porque la tabla estaba vacía y no se definió un identificador seguro de salas de prueba. |
| `sql/01_consulta_antes.sql` | Consultar los 101 pueblos y usuarios existentes. |
| `sql/02_consulta_despues.sql` | Consultar persistencia, longitud y prefijo del hash, y duplicados. |
| `sql/99_limpieza.sql` | Eliminar exclusivamente usuarios `@lab.test`; sus sesiones se eliminan por la FK con `ON DELETE CASCADE`. |

Ejemplo de ejecución desde la PWA (sustituir el nombre para cada script):

```powershell
docker cp docs/laboratorio/sql/01_consulta_antes.sql vestigia-pg:/tmp/01_consulta_antes.sql
docker exec vestigia-pg psql -v ON_ERROR_STOP=1 -U postgres -d vestigia -f /tmp/01_consulta_antes.sql
```

Ejecutar scripts de eliminación únicamente sobre la BD local de laboratorio, previa revisión. No borrar tablas ni registros ajenos a la prueba. Si existen salas de prueba, identificar sus IDs explícitamente antes de considerar su limpieza; no se crearon salas en los casos de alta de usuarios.

## 4. Resultados de los casos de prueba

Los estados distinguen los resultados satisfactorios (✅), los fallos observados (❌) y los resultados cuya evidencia no permite acreditar todas las condiciones de aceptación.

| ID | Caso / procedimiento | Resultado observado | Estado | Evidencia |
|---|---|---|---|---|
| C01 | Estado inicial: consultas SQL antes del alta | 101 pueblos, un administrador activo, cero salas | Estado validado; ejecución de `00_estado_inicial.sql` no acreditada | `evidencias/db/C01-antes.png`, `evidencias/db/C01-salas.png` |
| C02 | GET y renderizado: abrir `/salas` en línea e inspeccionar Network | 101 pueblos, HTTP 200, JSON de 3524 B, 417.06 ms en navegador | ✅ Pasó | `evidencias/frontend/C02-listado.png`, `evidencias/devtools/C02-network.png`, `C02-headers.png`, `C02-timing.png`, `C02-console.png`, log |
| C03 | Application: Service Worker y Cache Storage | `sw.js` activo, `workbox-precache-v2`, `api-pueblos` con los 101 registros | ✅ Pasó | `evidencias/devtools/C03-sw.png`, `C03-cache.png` |
| C04 | POST online: alta de `lab1@lab.test` | HTTP 201, registro persistido, 2060 ms en log | ✅ Pasó; la línea SQL `INSERT` está en `evidencias/verificacion-adicional/C04-log-sql.txt` | `evidencias/frontend/C04-alta.png`, `evidencias/devtools/C04-network.png`, `C04-timing.png`, `evidencias/backend/C04-log.png`, C05, log |
| C05 | Ejecutar `02_consulta_despues.sql` | Dos usuarios, hash de 60 caracteres con prefijo `$2a$`, sin duplicados | ✅ Pasó | `evidencias/db/C05-despues.png` |
| C06 | Repetir alta de `lab1@lab.test` | HTTP 409 en 471 ms; una sola fila para ese correo en consulta final | ✅ Pasó funcionalmente | `evidencias/devtools/C06-network.png`, `evidencias/db/C06-sin-duplicado.png`, log y C11 |
| C07 | Intentar alta con contraseña de tres caracteres | El formulario bloquea el envío y muestra «De 8 a 72 caracteres»; la petición no llega al servidor, por eso no hay HTTP 400 y el usuario de validación no figura en C11 | ✅ Pasó (validación del cliente) | `evidencias/frontend/C07.png`, `evidencias/devtools/C07-network.png`, `evidencias/backend/C07-validacion.png` |
| C08 | Activar Offline y recargar `/salas` | 101 pueblos visibles y aviso de desconexión; petición de red fallida y respuesta de caché coherente con C03 | ✅ Pasó funcionalmente; respuesta del SW no acreditada en la captura revisada | `evidencias/frontend/C08-offline.png`, `evidencias/devtools/C08-network.png` |
| C09 | Alta de `lab2@lab.test` sin red | Perfil previo: `NotFoundError`; perfil privado limpio: un registro pendiente con `passwordCifrada` | ❌ Falló con almacenamiento previo; ✅ pasó en perfil limpio; ✅ pasó con almacenamiento previo tras la corrección (BUG-001, PR #30) | `evidencias/devtools/C09-estructura-indexeddb.png`, `C09-indexeddb.png`, `C09-migracion-corregida.png`; aviso de alta pendiente y contenido de la cola en `evidencias/verificacion-adicional/` (sección 11) |
| C10 | Quitar Offline con la PWA abierta | POST HTTP 201 a las 03:08:38, 1499 ms; C11 confirma persistencia | ✅ Envío confirmado; contador en cero y cola vacía acreditados en la verificación adicional (sección 11) | `evidencias/devtools/C10-network.png`, `evidencias/verificacion-adicional/C10-contador-en-cero.png` y `C10-indexeddb-vacia.json`, log y C11. Nota: `evidencias/frontend/C10-indexeddb-vacia.png` muestra la lista de usuarios, no IndexedDB |
| C11 | Ejecutar `02_consulta_despues.sql` tras reconexión | Tres usuarios, `lab1` y `lab2` una vez cada uno, ambos hashes de 60 caracteres y prefijo `$2a$`; unicidad por correo confirmada en las filas mostradas | ✅ Pasó | `evidencias/db/C11-final.png` |
| C12 | Ejecutar limpieza y consulta inicial | `DELETE 2`, `COMMIT`, cero usuarios de prueba; 101 pueblos y solo el administrador inicial | ✅ Pasó | `evidencias/db/C12-limpio.png` |

### 4.1. Integridad de datos

| Indicador | Inicial | Tras C04 | Tras C10 | Tras C12 |
|---|---:|---:|---:|---:|
| Pueblos | 101 | 101 | 101 | 101 |
| Usuarios | 1 | 2 | 3 | 1 |
| Usuarios de prueba | 0 | 1 | 2 | 0 |

La tabla `usuarios` tiene la restricción única `usuarios_correo_unico`. Las contraseñas de los dos registros de prueba presentaron hashes de 60 caracteres con prefijo `$2a$`, compatibles con BCrypt. No se incluyen hashes completos. La FK de `sesiones_admin` referencia `usuarios` con eliminación en cascada.

## 5. Incidencia BUG-001 — Migración de IndexedDB

- **Caso:** C09. Severidad propuesta: alta para la funcionalidad offline de usuarios con almacenamiento previo.
- **Resultado esperado:** persistir el alta en la cola local cifrada.
- **Resultado observado:** aviso «No se pudo guardar el usuario. Intenta de nuevo» y `NotFoundError: Failed to execute 'transaction' on 'IDBDatabase': One of the specified object stores was not found.`
- **Diagnóstico:** el perfil previo contenía la BD `vestigia`, versión 1, con el único almacén `salasPendientes`. La implementación nueva requiere `usuariosPendientes` y `clavesCifrado` y también usa la versión 1. Al no aumentar la versión, no se ejecuta la creación de los almacenes faltantes.
- **Reproducción:** actualizar desde un perfil que conserve esa estructura anterior, entrar al dashboard con sesión válida, simular Offline e intentar un alta válida.
- **Prueba alternativa:** en una ventana privada se creó una BD nueva con los dos almacenes requeridos; se guardó un usuario pendiente y la propiedad `passwordCifrada` contenía un `ArrayBuffer` de 29 bytes y un IV de 12 bytes, sin contraseña visible en texto claro. El código revisado usa AES-GCM de 256 bits con una clave no extraíble. Esto no prueba resistencia frente a XSS.
- **Propuesta:** implementar una migración no destructiva de IndexedDB, incrementando la versión y creando solo los almacenes faltantes. Validar tanto instalaciones nuevas como actualizaciones. No se implementó durante el laboratorio; se corrigió después en el PR #30 (`DB_VERSION` pasa a 2 y se crean solo los almacenes que faltan).
- **Estado:** corregido en `develop` (PR #30, commit `0d86c33`) y comprobado en el navegador normal que reprodujo el fallo: la base `vestigia` pasa a versión 2 con 3 almacenes (`clavesCifrado`, `salasPendientes`, `usuariosPendientes`) y el alta de `lab3@lab.test` sin conexión queda pendiente. Evidencia: `evidencias/devtools/C09-migracion-corregida.png`.

### 5.1. Evidencia y compatibilidad entre versiones

| Escenario | Versión IndexedDB | Almacenes observados | Resultado |
|---|---:|---|---|
| C09-A: perfil normal con datos previos | 1 | `salasPendientes` | ❌ Falló; no se guardó el alta |
| C09-B: ventana privada con almacenamiento nuevo | 1 | `clavesCifrado`, `usuariosPendientes` | ✅ Pasó; un registro pendiente cifrado |
| C09-C: perfil normal con datos previos, tras la corrección | 2 | `clavesCifrado`, `salasPendientes`, `usuariosPendientes` | ✅ Pasó; un registro pendiente (`lab3@lab.test`) |

En el perfil normal, la inspección de `db.objectStoreNames` devolvió `['salasPendientes']`. En el perfil privado, la base inicializada por la versión actual tenía dos almacenes y se observó el registro `lab2@lab.test` en estado `pendiente`. El problema no es una limitación del modo normal del navegador: es una incompatibilidad de esquema persistido entre las dos versiones de la aplicación, que comparten nombre y versión numérica de IndexedDB. Una nueva instalación no reproduce el fallo porque ejecuta `onupgradeneeded` al crear la base. No se borró la base anterior ni se cambió el código para resolverlo.

La propuesta de incrementar `DB_VERSION` a 2 y crear condicionalmente los almacenes que falten debe conservar `salasPendientes` y los datos existentes hasta que el equipo determine una política de migración. Debe probarse sobre una instalación previa y una limpia, incluyendo la sincronización posterior; la solución no está implementada ni validada. El éxito en incógnito no invalida el fallo original ni implica persistencia después de cerrar la ventana privada.

## 6. Rendimiento local

### 6.1. Lighthouse — `/salas`

Auditoría inicial en escritorio sobre `http://localhost:4173/salas`.

| Categoría | Puntuación |
|---|---:|
| Rendimiento | 72/100 |
| Accesibilidad | 100/100 |
| Buenas prácticas | 100/100 |
| SEO | 91/100 |

| Métrica | Valor |
|---|---:|
| First Contentful Paint (FCP) | 0.9 s |
| Largest Contentful Paint (LCP) | 1.4 s |
| Total Blocking Time (TBT) | 40 ms |
| Cumulative Layout Shift (CLS) | 0.392 |
| Speed Index | 2.1 s |

Hallazgos: el elemento `aside` se asoció a un desplazamiento de 0.392; la ruta crítica alcanzó 2088 ms; el recálculo forzado fue de 37 ms. Lighthouse estimó 40 ms de ahorro por solicitudes que bloquean renderizado y 80 ms por visualización de fuentes. La carga de Literata, MonaSans y Playball aparece en la ruta crítica. Se recomienda reservar espacio para componentes y revisar carga de fuentes y CSS, sin cambiar la identidad visual.

La auditoría advirtió que datos existentes en IndexedDB podían afectar la medición. No se dispone de una segunda auditoría en perfil limpio ni de una prueba controlada de mejoras. Las puntuaciones de accesibilidad y buenas prácticas no equivalen a certificaciones ni a una auditoría de seguridad.

Evidencias: `evidencias/devtools/Lighthouse-01-inicial.png`, `Lighthouse-02-diagnostico.png`, `Lighthouse-03-metricas.png`.

### 6.2. Logs de Spring Boot

Fuente: `logs/backend-pruebas.log`, extracto del 26/11/2026 con dos procesos del backend (PID 12812 y 18776). Los tiempos son los reportados por `RequestLoggingFilter`, no latencias de extremo a extremo.

| Operación | Hora (UTC−6) | HTTP | Tiempo |
|---|---|---:|---:|
| GET `/api/v1/pueblos` (C02) | 01:48:06 | 200 | 337 ms |
| POST `/api/v1/admin/usuarios` (C04) | 02:04:58 | 201 | 2060 ms |
| GET `/api/v1/admin/usuarios` | 02:05:10 | 401 | 73 ms |
| POST `/api/v1/admin/usuarios` (C06) | 02:21:25 | 409 | 471 ms |
| POST `/api/v1/admin/usuarios` (C10) | 03:08:38 | 201 | 1499 ms |

El GET de C02 se observó en DevTools con 417.06 ms totales y 401.27 ms de espera de respuesta. La diferencia frente al log se debe interpretar considerando los distintos puntos de medición, no como una medida aislada de latencia de red. El 401 se conserva como observación; su causa no fue determinada. El extracto no contiene la línea SQL INSERT, aunque la persistencia se comprobó mediante psql.

### 6.3. Spring Boot Actuator

| Medida | Valor observado |
|---|---:|
| `jvm.memory.used` | 268405368 bytes (268.41 MB) |
| `jvm.memory.max` | 3059744765 bytes (3.06 GB) |
| `http.server.requests` — COUNT | 20 |
| TOTAL_TIME | 9.3348457 s |
| Promedio calculado (TOTAL_TIME / COUNT) | 466.74 ms |
| MAX reportado | 788.45 ms |
| GET `/api/v1/pueblos` — COUNT | 2 |
| TOTAL_TIME del GET | 0.7203858 s |
| Promedio calculado del GET | 360.19 ms |
| MAX reportado del GET | 0.0 s (no interpretable como latencia cero; máximo de ventana temporal) |

Estas métricas corresponden al proceso en ejecución en el momento de consulta, después de un reinicio; no representan toda la sesión ni una prueba de carga. La memoria reportada agrega heap y non-heap, no equivale a RAM total del proceso ni a un límite efectivo del contenedor.

Comandos de reproducción:

```powershell
curl.exe http://localhost:8090/actuator/metrics/jvm.memory.used
curl.exe http://localhost:8090/actuator/metrics/jvm.memory.max
curl.exe http://localhost:8090/actuator/metrics/http.server.requests
curl.exe "http://localhost:8090/actuator/metrics/http.server.requests?tag=uri:/api/v1/pueblos&tag=method:GET"
```

Fuente: respuestas JSON de Actuator obtenidas en PowerShell el 26/11/2026, transcritas en la tabla.

### 6.4. Antecedentes de producción

Consultar [metricas-produccion.md](metricas-produccion.md). El informe histórico del backend del 09/11/2026 (commit analizado `6a51818`) reporta 30 peticiones secuenciales por endpoint. Para GET pueblos: mediana 180.9 ms, P95 212.9 ms y máximo 1214.3 ms. La evidencia base del 16/11/2026 (commit `7f39eb1`) reporta 309 pruebas automatizadas sin fallos. No son pruebas ejecutadas nuevamente en esta sesión.

Las fuentes históricas no cubren concurrencia, memoria ni pool de conexiones de producción, ni planes de ejecución EXPLAIN. Las cifras locales y de Railway no son directamente comparables sin condiciones de medición equivalentes.

## 7. Seguridad — OWASP ZAP

Análisis pasivo mediante Manual Explore, Safe Mode, ZAP 2.17.0. El HTML generado el 26/11/2026 a las 03:50:04 tiene como sitio principal `http://localhost:4173`. El resumen reporta 0 categorías altas, 2 medias, 2 bajas y 2 informativas. Las estadísticas incluyen tráfico de otros orígenes, pero los seis hallazgos detallados corresponden al frontend local.

| Alerta (ID ZAP) | Riesgo | Recomendación |
|---|---|---|
| CSP Header Not Set (10038) | Medio | Definir y validar Content-Security-Policy según los recursos necesarios de la PWA. |
| Missing Anti-clickjacking Header (10020) | Medio | Evaluar `frame-ancestors` o `X-Frame-Options` según los requisitos de incrustación. |
| Timestamp Disclosure – Unix (10096) | Bajo | Revisar si el número detectado en JavaScript constituye realmente información sensible. |
| X-Content-Type-Options Header Missing (10021) | Bajo | Configurar `nosniff` y Content-Type adecuados en el servidor. |
| Suspicious Comments (10027) | Informativo | Revisar la coincidencia con `ADMIN` en el JS compilado; no se comprobó exposición de secretos. |
| Modern Web Application (10109) | Informativo | Identificación tecnológica; no requiere corrección. |

Evidencias: `evidencias/seguridad/ZAP-Vestigia.html` y `ZAP-alertas.png`. No se realizó escaneo activo, prueba de intrusión completa ni auditoría exhaustiva de la API. La falta de alertas altas no demuestra ausencia de vulnerabilidades. Los encabezados evaluados son los de Vite preview; no se comprobó su configuración en producción. Las propuestas no fueron implementadas ni verificadas nuevamente.

## 8. Limitaciones y conclusiones

La integración PWA–API–PostgreSQL permitió consultar 101 pueblos, crear administradores, comprobar persistencia y unicidad y regresar al estado inicial. La consulta offline funcionó y el alta diferida pudo persistirse después de recuperar la conexión en un perfil limpio. Se detectó una incompatibilidad reproducible de IndexedDB en perfiles con almacenamiento anterior; se corrigió después con el PR #30 y se comprobó de nuevo en el mismo perfil (C09-C). Los resultados de C09-A y C09-B se conservan porque documentan el fallo original.

Las oportunidades principales son la migración de IndexedDB, la estabilidad visual y la revisión de encabezados HTTP. No se comprobó la eficacia de las mejoras propuestas. Tampoco se evaluaron carga concurrente, cobertura de código, SSR, notificaciones push, APIs físicas ni HTTPS de la PWA publicada durante esta sesión; estas últimas funcionalidades corresponden a otros criterios de la práctica y requieren evidencias independientes si se incluyen en la entrega global.

## 9. Organización de la entrega

```text
docs/laboratorio/
  README.md
  metricas-produccion.md
  sql/
    00_estado_inicial.sql
    01_consulta_antes.sql
    02_consulta_despues.sql
    99_limpieza.sql
  logs/
    backend-pruebas.log
  evidencias/
    db/
    backend/
    frontend/
    devtools/
    seguridad/
    verificacion-adicional/
```

## 10. Fuentes

- Salidas SQL y capturas DevTools del laboratorio del 26/11/2026.
- `logs/backend-pruebas.log`, registros Spring Boot de la misma fecha.
- Auditoría Lighthouse inicial y reporte HTML OWASP ZAP 2.17.0.
- [metricas-produccion.md](metricas-produccion.md), referencias a los informes del backend de los días 09/11/2026 y 16/11/2026.

## 11. Evidencias adicionales y correcciones

Tras la revisión de la rama se agregaron `evidencias/verificacion-adicional/` (ver su [README](evidencias/verificacion-adicional/README.md) para la procedencia, versiones y límites del método) y se hicieron estos cambios:

- Se eliminaron los archivos del primer laboratorio, que ya no corresponden al esquema actual: `Laboratorio_de_pruebas_PWA_Evidencias.pdf`, `sql/00_create_database.sql`, `sql/01_schema.sql`, `sql/02_seed.sql` y `sql/99_clean.sql` (este último ejecutaba `TRUNCATE salas`).
- C04: log con las líneas SQL de la inserción.
- C07: resultado aclarado como validación del cliente.
- C09 y C10: aviso de pendiente, contenido de la cola cifrada, contador en cero y cola vacía tras la sincronización.
- Instrucción de log SQL corregida (sección 3.2).
- SHA del backend de las pruebas originales registrado en la sección 2: `main` en `6dc7c92`. Las evidencias adicionales usaron un commit distinto y más reciente, `22fd17f` de `origin/develop`, así que ambas series de pruebas no corresponden exactamente a la misma versión del backend.
- BUG-001 (migración de IndexedDB) corregido en `develop` con el PR #30 y verificado en el navegador normal (`evidencias/devtools/C09-migracion-corregida.png`).
