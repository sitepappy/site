FROM node:18-alpine
WORKDIR /app

# Копируем package.json именно из папки server
COPY server/package.json server/package-lock.json* ./
RUN npm install --production

# Копируем всё содержимое папки server в текущую рабочую директорию
COPY server/. .

ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

# Запускаем сервер
CMD ["node", "index.js"]
