FROM node:lts-alpine

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

RUN echo "Hello from Docker build"

EXPOSE 3003

CMD ["node", "dist/index.js"]