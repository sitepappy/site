FROM node:18-alpine
WORKDIR /app

# Копируем файлы (предполагаем, что контекст — папка /server)
COPY package.json package-lock.json* ./
RUN npm ci || npm i

COPY . .
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["npm","start"]
