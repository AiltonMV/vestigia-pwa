\# Laboratorio de pruebas de Vestigia PWA



Documentación del laboratorio de integración entre la PWA de Vestigia, el backend en Spring Boot y PostgreSQL.



El laboratorio comprende consulta y renderización de salas, creación de registros, persistencia, idempotencia, validación de datos y comportamiento offline.



\## Reporte y evidencias



\[Consultar el reporte del laboratorio con las capturas y los resultados](Laboratorio\_de\_pruebas\_PWA\_Evidencias.pdf)



| Ubicación | Contenido |

|---|---|

| Laboratorio\_de\_pruebas\_PWA\_Evidencias.pdf | Procedimiento, capturas, casos de prueba y conclusiones |

| sql/ | Scripts de creación, carga y limpieza |

| logs/backend-pruebas.log | Registro del servidor durante las pruebas |



\## Repositorios



\- PWA: https://github.com/AiltonMV/vestigia-pwa

\- Backend: https://github.com/Oliveriswackk/Vestigia/tree/main/backend/vestigia



La versión de la PWA utilizada para el laboratorio corresponde a la rama `develop`.



\## Entorno utilizado



| Componente | Configuración |

|---|---|

| Frontend | React, Vite y TypeScript |

| Backend | Spring Boot |

| Base de datos | PostgreSQL 16 en Docker Desktop |

| Java utilizado | OpenJDK 25.0.2 |

| Node.js utilizado | 24.20.0 |

| Puerto de PostgreSQL | 5432 |

| Puerto del backend | 8088 |

| Puerto de la PWA en preview | 4173 |

| API simulada | Desactivada |



El backend se ejecutó en el puerto 8088 porque el puerto 8080 estaba ocupado.



\## Preparación de los repositorios



Si se descargan por primera vez, ejecutar desde una carpeta de trabajo:



```powershell

git clone https://github.com/Oliveriswackk/Vestigia.git



git clone --branch develop https://github.com/AiltonMV/vestigia-pwa.git

```



Los comandos siguientes suponen que `Vestigia` y `vestigia-pwa` están dentro de la misma carpeta.



\## Preparación de PostgreSQL



Iniciar Docker Desktop.



Para crear el contenedor por primera vez:



```powershell

docker run --name vestigia-db -e POSTGRES\_USER=postgres -e POSTGRES\_PASSWORD=postgres -e POSTGRES\_DB=vestigia -p 5432:5432 -v vestigia-lab-data:/var/lib/postgresql/data -d postgres:16

```



En ejecuciones posteriores, iniciar el contenedor existente:



```powershell

docker start vestigia-db

```



Comprobar que PostgreSQL acepta conexiones:



```powershell

docker exec vestigia-db pg\_isready -U postgres -d vestigia

```



La variable `POSTGRES\_DB=vestigia` crea la base de datos durante la primera inicialización del volumen. El volumen conserva los datos entre reinicios.



\### Crear el esquema y cargar los datos



Desde la carpeta que contiene ambos repositorios:



```powershell

Set-Location .\\Vestigia\\backend\\vestigia



docker cp .\\docs\\02-provisioning\\01\_schema.sql vestigia-db:/tmp/01\_schema.sql



docker cp .\\docs\\02-provisioning\\02\_seed.sql vestigia-db:/tmp/02\_seed.sql



docker exec vestigia-db psql -v ON\_ERROR\_STOP=1 -U postgres -d vestigia -f /tmp/01\_schema.sql



docker exec vestigia-db psql -v ON\_ERROR\_STOP=1 -U postgres -d vestigia -f /tmp/02\_seed.sql

```



Verificar los datos iniciales:



```powershell

docker exec vestigia-db psql -U postgres -d vestigia -c "SELECT COUNT(\*) AS total FROM salas;"



docker exec vestigia-db psql -P pager=off -U postgres -d vestigia -c "SELECT id, nombre, escenario, activa FROM salas ORDER BY creada\_en;"

```



En una base nueva se esperan seis salas. La semilla conserva los registros adicionales que ya existan.



\### Scripts incluidos



| Script | Función |

|---|---|

| 00\_create\_database.sql | Crear la base cuando se prepara manualmente |

| 01\_schema.sql | Crear la tabla salas y sus restricciones |

| 02\_seed.sql | Cargar las seis salas iniciales |

| 99\_clean.sql | Vaciar la tabla para reiniciar el laboratorio |



El script `00\_create\_database.sql` no es necesario cuando la base ya fue creada mediante `POSTGRES\_DB`.



El script `99\_clean.sql` elimina todas las salas. Se utiliza únicamente para reiniciar la base del laboratorio, después de conservar las evidencias.



\## Ejecución del backend



Desde `Vestigia/backend/vestigia`:



```powershell

$env:DB\_URL = "jdbc:postgresql://localhost:5432/vestigia"

$env:DB\_USER = "postgres"

$env:DB\_PASSWORD = "postgres"

$env:SERVER\_PORT = "8088"



.\\mvnw.cmd spring-boot:run

```



Mantener abierta esta terminal.



Desde otra terminal, verificar el servicio:



```powershell

Invoke-RestMethod http://localhost:8088/actuator/health



Invoke-RestMethod http://localhost:8088/api/salas |

&#x20;   Format-Table id,nombre,escenario,activa

```



Se espera el estado `UP` y el listado de salas.



Las variables anteriores corresponden a esa sesión de PowerShell. Si se abre una terminal nueva para arrancar el backend, deben configurarse nuevamente.



\## Ejecución de la PWA



Abrir otra terminal en la carpeta `vestigia-pwa`.



Preparar el archivo `.env` si todavía no existe:



```powershell

if (-not (Test-Path .env)) {

&#x20;   Copy-Item .env.example .env

}



notepad .env

```



Configurar estas variables:



```dotenv

VITE\_API\_URL=http://localhost:8088

VITE\_API\_MOCK=false

```



Instalar dependencias y compilar:



```powershell

npm ci

npm run build

```



Después de completar correctamente el build:



```powershell

npm run preview -- --port 4173 --strictPort

```



Abrir:



http://localhost:4173/salas



Las pruebas de Service Worker y funcionamiento offline se realizan con el build servido mediante preview.



Si cambia `.env`, volver a compilar y reiniciar preview.



\## Operaciones de la API



Los identificadores de las salas son UUID.



| Método | Endpoint | Comportamiento |

|---|---|---|

| GET | /api/salas | Consultar el listado |

| GET | /api/salas/{id} | Consultar una sala |

| POST | /api/salas | Crear una sala |

| PUT | /api/salas/{id} | Actualizar una sala |

| DELETE | /api/salas/{id} | Eliminar una sala |



Una creación nueva devuelve HTTP 201. El reenvío de un POST válido con un identificador existente devuelve HTTP 200 y conserva el registro existente.



\## Pruebas documentadas



El PDF contiene los resultados y las capturas de los siguientes casos:



| Caso | Comprobación |

|---|---|

| Consulta GET | Respuesta 200 y datos JSON |

| Renderización | Correspondencia entre los datos de la API y la interfaz |

| Creación POST | Respuesta 201 y persistencia en PostgreSQL |

| Idempotencia | Reenvío con el mismo UUID y un único registro |

| Validación | Respuestas 400 y 404 |

| Observabilidad | Consultas SQL, estados HTTP, tiempos y memoria |

| Service Worker y caché | Registro activo y recursos almacenados |

| Operación offline | Alta pendiente conservada en IndexedDB |

| Reconexión | Envío de la operación pendiente y comprobación en PostgreSQL |



\## Comportamiento offline



El Service Worker conserva los recursos de la aplicación y utiliza `stale-while-revalidate` para las consultas GET de salas.



Las nuevas salas que no pueden enviarse por un fallo de red se guardan en:



`IndexedDB → vestigia → salasPendientes`



La aplicación conserva el UUID de cada operación para permitir el reenvío sin duplicar registros.



La sincronización se ejecuta al recuperar la conexión con la página abierta o al volver a abrir el listado con conexión.



La cola implementada corresponde a altas. La edición y eliminación de salas confirmadas requieren conexión.



\## Logs y métricas



El backend genera su registro en:



`Vestigia/backend/vestigia/logs/vestigia-backend.log`



Se conserva una copia del registro de las pruebas en:



\[Consultar logs del backend](logs/backend-pruebas.log)



Las líneas `\[API]` muestran método, ruta, estado HTTP, duración y memoria heap de la JVM. Hibernate registra las consultas SQL y sus parámetros.



El estado HTTP no equivale a un código SQLSTATE de PostgreSQL.



La memoria del backend puede consultarse en:



http://localhost:8088/actuator/metrics/jvm.memory.used



Las métricas HTTP están disponibles en:



http://localhost:8088/actuator/metrics/http.server.requests

