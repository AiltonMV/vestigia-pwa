# syntax=docker/dockerfile:1
# Se construye con la raíz del proyecto como contexto:
#   docker build -f docker/Dockerfile -t vestigia-pwa .

# ---------------------------------------------------------------------------
# Etapa 1 · build: instala dependencias y compila la PWA (TypeScript + Vite)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app

# Husky (hooks de Git) no aplica dentro del contenedor.
ENV HUSKY=0

# Primero solo los manifiestos: si no cambian, Docker reutiliza la capa de `npm ci`.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite incrusta las variables VITE_* al compilar. Vacía = mismo origen: Nginx
# reenvía /api al backend, así no hay problemas de CORS.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_API_MOCK=false
RUN npm run build

# ---------------------------------------------------------------------------
# Etapa 2 · runtime: solo Nginx con los archivos estáticos (sin Node ni código fuente)
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS runtime

# La imagen oficial procesa /etc/nginx/templates con envsubst al arrancar.
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

# Backend de Spring Boot al que se reenvía /api (se puede cambiar al correr el contenedor).
ENV API_UPSTREAM=http://host.docker.internal:8080

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
