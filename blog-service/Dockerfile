FROM node:20-alpine

# Добавляем пользователя и группу с новым ID (1001)
RUN addgroup -g 1001 appuser && \
    adduser -u 1001 -G appuser -D appuser

WORKDIR /app

COPY package*.json ./

RUN npm install

# Меняем владельца папки /app
RUN chown -R appuser:appuser /app

# Устанавливаем права доступа для нового пользователя
COPY --chown=appuser:appuser . .

# Переключаемся на нового пользователя
USER appuser

RUN npm run build

EXPOSE 3004

CMD ["node", "dist/index.js"]