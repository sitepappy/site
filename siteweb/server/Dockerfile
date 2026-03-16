FROM node:18-alpine
WORKDIR /app

# Если контекст сборки — корень репозитория (Railway), копируем из подкаталога server
COPY server/package.json server/package-lock.json* ./
RUN npm ci || npm i

COPY server/. .
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["npm","start"]
