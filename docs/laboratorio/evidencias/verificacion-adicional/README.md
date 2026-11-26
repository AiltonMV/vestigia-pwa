# Evidencias adicionales

Complementan los casos C04, C09 y C10 del README del laboratorio, que tenían la evidencia incompleta o con un archivo que no correspondía a su nombre.

## Procedencia

Generadas en el equipo de Raúl Cano el 26 de noviembre de 2026 (hora del centro de México).

| Elemento | Versión |
|---|---|
| PWA | commit `d656e2c` de `feature/laboratorio-evidencias`, `npm run build` y `preview` en `http://localhost:4173`, con `VITE_API_MOCK=false` |
| Backend | commit `22fd17f` de `origin/develop` de `vestigia-backend`, en `http://localhost:8080` |
| Base de datos | PostgreSQL 17 en Docker, puerto 5433 (el 5432 estaba ocupado), base `vestigia` limpia con Flyway V1 a V4 |
| Java / Node | OpenJDK 21.0.13 / Node.js 25.8.1 |
| Cuenta usada | `admin@vestigia.site` (administrador inicial local de laboratorio) |

## Qué contiene

| Archivo | Caso | Qué muestra |
|---|---|---|
| `C04-alta-online.png` | C04 | Alta de `lab1@lab.test` con conexión; el usuario aparece en la lista |
| `C04-log-sql.txt` | C04 | Log del backend para otra alta (`lab4@lab.test`) con SQL de Hibernate: `select` de sesión y de correo duplicado, `insert into usuarios` con sus parámetros y `[API] POST /api/v1/admin/usuarios -> 201 \| 182 ms`. Se omitieron los hashes BCrypt y de token |
| `C09-aviso-pendiente.png` | C09 | Alta de `lab2@lab.test` con el backend apagado: «1 pendiente por sincronizar» y la entrada «Pendiente» |
| `C09-indexeddb-pendiente.json` | C09 | Contenido de `vestigia` › `usuariosPendientes` leído desde la página: `passwordCifrada` con `iv` de 12 bytes y `datos` de 29 bytes, sin texto legible |
| `C10-contador-en-cero.png` | C10 | Tras la reconexión: sin aviso de pendientes y tres usuarios registrados |
| `C10-indexeddb-vacia.json` | C10 | La cola quedó con 0 registros |
| `consulta-despues.txt` | C11 | Resultado de `sql/02_consulta_despues.sql` tras la sincronización: `lab1` y `lab2` una sola vez, hash de 60 caracteres con prefijo `$2a$` |

## Método y límites

- **Sin conexión:** no se usó el modo Offline de DevTools. Se detuvo el backend, así que la petición falló por falta de respuesta (`NetworkError`) y la alta se encoló. Por eso el indicador seguía en «En línea» (el navegador sí tenía red).
- **Reconexión:** se volvió a iniciar el backend y se disparó el evento `online` de la ventana. La sincronización envió la alta y la cola quedó vacía. El POST sincronizado quedó con respuesta 201 en el log del backend.
- **IndexedDB:** se leyó con JavaScript desde la página y se guardó como JSON, no como captura del panel Application de DevTools. Los `ArrayBuffer` se resumen por su tamaño.
- **Capturas:** son de la página, no de DevTools. Los casos que requieren el panel Network o Application siguen con las capturas del README principal.
- **Perfil de navegador limpio:** no tenía la base `vestigia` anterior, así que no ejercita BUG-001.
- **Log de SQL:** `LOGGING_LEVEL_ORG_HIBERNATE_SQL` no activa el SQL (el logger se llama `org.hibernate.SQL`, con mayúsculas, y la variable de entorno lo baja a minúsculas). Se activó con `SPRING_APPLICATION_JSON='{"logging.level.org.hibernate.SQL":"DEBUG","logging.level.org.hibernate.orm.jdbc.bind":"TRACE"}'`. Eso explica por qué el log original solo traía líneas `[API]`.
- Los logs con `TRACE` incluyen hashes BCrypt y de sesión: no se suben sin omitirlos.
