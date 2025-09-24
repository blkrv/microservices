FROM node:20-alpine

RUN addgroup -g 1000 appuser && \
    adduser -u 1000 -G appuser -D appuser

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY --chown=appuser:appuser . .

USER appuser

RUN npm run build

EXPOSE 3004

CMD ["node", "dist/index.js"]