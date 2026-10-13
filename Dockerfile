# ---- Stage 1: build (ติดตั้ง deps + generate Prisma Client) ----
FROM node:20-alpine AS build
RUN apk add --no-cache openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src

# ---- Stage 2: runtime (เล็กและไม่รันด้วย root) ----
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build --chown=node:node /app ./
USER node
EXPOSE 8080
CMD ["sh", "-c", "npx prisma db push --skip-generate && node src/server.js"]
