# Dockerfile para artesanias-frontend (Next.js)

# --- Fase de Dependencias ---
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# --- Fase de Build ---
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Setea la URL de la API durante la construcción
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# --- Fase de Producción ---
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copiar solo los artefactos de build necesarios desde la fase anterior
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# El puerto 3000 es el por defecto de Next.js
EXPOSE 3000

# Iniciar el servidor de Node.js de Next.js
CMD ["node", "server.js"] 