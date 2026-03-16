FROM node:18-alpine
WORKDIR /app

# Копируем файлы, указывая путь от корня репозитория
COPY server/package.json server/package-lock.json* ./
RUN npm install

# Копируем содержимое папки server
COPY server/. .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Запускаем напрямую через node, чтобы избежать проблем с путями в npm
CMD ["node", "index.js"]
