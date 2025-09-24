FROM node:20-alpine

# Добавляем пользователя и группу с новым ID (1001)
RUN addgroup -g 1001 appuser && \
    adduser -u 1001 -G appuser -D appuser

WORKDIR /app

COPY package*.json ./

RUN npm install

# Устанавливаем права доступа для нового пользователя
COPY --chown=appuser:appuser . .

# Переключаемся на нового пользователя
USER appuser

# На всякий случай, даем полные права на папку /app (для отладки)
RUN chmod -R 777 /app

RUN npm run build

EXPOSE 3004

CMD ["node", "dist/index.js"]