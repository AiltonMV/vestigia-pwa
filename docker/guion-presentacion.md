# Guion de la presentación: Git/GitHub y contenedor Docker de la PWA

**Duración:** 15 minutos más preguntas · **Equipo:** 5 personas · **Proyecto:** Vestigia (PWA)

| #   | Parte                                  | Tiempo |
| --- | -------------------------------------- | ------ |
| 1   | Introducción y flujo de trabajo en Git | 2:30   |
| 2   | Control de versiones en vivo (GitHub)  | 3:00   |
| 3   | El Dockerfile                          | 3:00   |
| 4   | Nginx y Docker Compose                 | 3:00   |
| 5   | Demostración y cierre                  | 3:30   |

## Antes de empezar (preparación)

- Docker Desktop abierto. Imagen ya construida una vez (`docker compose build`) por si la red del salón es lenta.
- Backend de Spring Boot corriendo en el puerto 8080, con la base en su estado inicial (`99_clean.sql` y luego `02_seed.sql`).
- Pestañas abiertas: el repo en GitHub (Code, Branches, Pull requests, Releases) y `http://localhost:4173`.
- Terminal dentro de la carpeta `docker/` del proyecto, con letra grande.
- Plan B: si algo falla en vivo, tener las capturas de evidencias a la mano.

---

## Persona 1 · Introducción y flujo de trabajo en Git (2:30)

**En pantalla:** la página principal de Vestigia y luego el README, sección "Flujo de trabajo en Git".

**Guion:**

> "Vestigia es una aventura breve de misterio que se juega en PC y usa el teléfono como libreta. Esta PWA es la parte web: la página de presentación con el faro en 3D y el módulo de salas, que se conecta a un backend de Spring Boot con PostgreSQL.
>
> En esta práctica hicimos dos cosas: llevar el control de versiones del proyecto con Git y GitHub, y empaquetar la PWA en un contenedor de Docker.
>
> Para trabajar en equipo sin pisarnos usamos tres niveles de ramas: `main` es la versión estable y está protegida; `develop` es donde se integra el trabajo de todos, y cada cambio nuevo se hace en su propia rama, por ejemplo `feature/docker`. Cuando la rama está lista, entra a `develop` por pull request, y cuando `develop` está estable, pasa a `main`."

**Puntos clave:** ramas `main` → `develop` → `feature/…`; nadie trabaja directo sobre `main`.

---

## Persona 2 · Control de versiones en vivo (3:00)

**En pantalla:** terminal y GitHub.

**Comandos:**

```bash
git log --oneline --graph --decorate -15
git branch -a
```

**Guion:**

> "Aquí se ve la historia real del proyecto. Cada commit empieza con un prefijo que dice qué tipo de cambio es: `New:` para algo nuevo, `Refactor:` para cambiar la estructura, `Fix:` para corregir un error y `Merge:` para unir ramas. Así, con solo leer el historial, se sabe qué pasó.
>
> Cada funcionalidad se dividió en varios commits pequeños, uno por capa: datos, servicio, controlador e interfaz. Si algo se rompe, es fácil encontrar en qué commit pasó y revertir solo ese.
>
> _(En GitHub, pestaña Pull requests → cerrados)_ Todo entró por pull request: aquí están los de la página principal, el de salas, el del backend y el de este contenedor. En cada uno se revisa el código antes de unirlo.
>
> _(Pestaña Releases o `git tag`)_ Para saber en qué versión vamos usamos versionado semántico, `MAYOR.MENOR.PARCHE`: subimos el número menor con cada funcionalidad nueva y el de parche con cada corrección."

**Puntos clave:** convención de commits, commits pequeños por capa, pull requests como revisión, versiones con tags.

---

## Persona 3 · El Dockerfile (3:00)

**En pantalla:** `docker/Dockerfile` en el editor y luego `docker/Dockerfile.dockerignore`.

**Guion:**

> "Un contenedor empaqueta la aplicación con todo lo que necesita para correr, así funciona igual en cualquier computadora: la nuestra, la del profesor o un servidor.
>
> Nuestro Dockerfile tiene **dos etapas**. La primera, _build_, usa una imagen con Node 22: instala las dependencias con `npm ci` y compila la PWA con `npm run build`, que genera la carpeta `dist` con el HTML, el JavaScript, el Service Worker y el manifest.
>
> Un detalle importante: copiamos primero solo `package.json` y `package-lock.json` y después el resto del código. Docker guarda cada paso como una capa en caché; si solo cambiamos código y no dependencias, se salta la instalación y el build tarda segundos en vez de minutos.
>
> La segunda etapa, _runtime_, parte de Nginx y copia **solo** la carpeta `dist`. La imagen final no lleva Node ni el código fuente: pesa 76 MB, mientras que la etapa de build sola pesa 1.18 GB, y es más segura porque tiene menos cosas.
>
> El `.dockerignore` evita mandar a Docker lo que no hace falta, como `node_modules`, `.git` o el archivo `.env` con configuración local."

**Puntos clave:** multietapa, caché de capas, imagen ligera, `.dockerignore`.

---

## Persona 4 · Nginx y Docker Compose (3:00)

**En pantalla:** `docker/nginx/default.conf.template` y `docker/docker-compose.yml`.

**Guion:**

> "Dentro del contenedor, Nginx sirve la PWA. Su configuración resuelve cuatro cosas:
>
> 1. **Rutas de la aplicación:** si alguien entra directo a `/salas`, Nginx devuelve `index.html` y React decide qué mostrar.
> 2. **El Service Worker:** `sw.js` y el manifest se mandan sin caché, para que cuando publiquemos una versión nueva el navegador la detecte; los archivos con hash se guardan un año porque nunca cambian.
> 3. **La API:** todo lo que empieza con `/api` se reenvía al backend de Spring Boot. Para el navegador es el mismo origen, así evitamos problemas de CORS.
> 4. **Compresión gzip**, para que cargue más rápido.
>
> La dirección del backend no está fija en la imagen: llega como variable de entorno, `API_UPSTREAM`. La misma imagen sirve para desarrollo o para un servidor con solo cambiar esa variable.
>
> Docker Compose junta todo en un archivo: cómo construir la imagen, el puerto 4173 (el que el backend permite) y las variables. Con un solo comando cualquiera del equipo levanta exactamente lo mismo."

**Puntos clave:** SPA, caché del Service Worker, proxy a `/api`, variables de entorno, un solo comando.

---

## Persona 5 · Demostración y cierre (3:30)

**En pantalla:** terminal, Docker Desktop y navegador.

**Comandos** (dentro de `docker/`):

```bash
docker compose up -d --build
docker compose ps
docker images vestigia-pwa
docker compose logs --tail 10 pwa
```

**Guion:**

> "Ahora lo vemos funcionando. _(Ejecuta `docker compose up -d --build`)_ Construye la imagen y levanta el contenedor. _(`docker compose ps`)_ Está corriendo y dice _healthy_: Docker revisa cada 30 segundos que Nginx responda.
>
> _(Navegador en `localhost:4173`)_ Esta es la PWA servida desde el contenedor. _(Escribe el código Konami)_ Entramos a las salas. _(Crea una sala)_ Al guardarla, la petición pasa por Nginx hasta el backend. _(`docker compose logs`)_ En los registros se ven el `GET` y el `POST` a `/api/salas`.
>
> _(DevTools → Application)_ El Service Worker y el manifest también funcionan dentro del contenedor, así que la app se puede instalar y usar sin conexión.
>
> Para cerrar: con Git y GitHub tenemos un historial claro, revisión por pull request y versiones; con Docker, cualquier persona levanta la misma PWA con un solo comando, sin instalar Node ni configurar nada."

**Si algo falla:** mostrar las capturas de evidencias y explicar qué se ve en cada una.

---

## Preguntas que pueden hacer

| Pregunta                                               | Respuesta corta                                                                                                            |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| ¿Por qué dos etapas?                                   | Para que la imagen final solo tenga lo necesario para servir (76 MB) y no las herramientas de compilación.                 |
| ¿Por qué Nginx y no `npm run preview`?                 | `preview` es para probar en desarrollo; Nginx es un servidor de producción, rápido y con control de caché y proxy.         |
| ¿Qué es `host.docker.internal`?                        | El nombre con el que el contenedor ve a la computadora anfitriona, donde corre el backend.                                 |
| ¿Cómo se actualiza la app?                             | Se reconstruye con `docker compose up -d --build`; el Service Worker detecta la versión nueva porque `sw.js` va sin caché. |
| ¿Por qué no se mete el backend en el mismo contenedor? | Un contenedor por servicio: así se actualizan, escalan y reinician por separado.                                           |
| ¿Qué pasa con el `.env`?                               | No se copia a la imagen (`.dockerignore`); la configuración llega por build args y variables de entorno.                   |
| ¿Por qué `npm ci` y no `npm install`?                  | `npm ci` instala exactamente lo del `package-lock.json`, así todos tienen las mismas versiones.                            |
