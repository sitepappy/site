FROM node:18-alpine AS deps
WORKDIR /app

# Указываем точный путь к package.json фронтенда
COPY web/package.json web/package-lock.json* ./
RUN npm install

FROM node:18-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules

# Копируем все файлы фронтенда
COPY web/. .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
