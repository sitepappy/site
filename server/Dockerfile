FROM node:18-alpine
WORKDIR /app

# Копируем файлы с учетом вложенности в репозитории
COPY siteweb/server/package.json siteweb/server/package-lock.json* ./
RUN npm ci || npm i

COPY siteweb/server/. .
ENV NODE_ENV=production
ENV PORT=4000
EXPOSE 4000

CMD ["npm","start"]
