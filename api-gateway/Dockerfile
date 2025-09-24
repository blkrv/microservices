FROM node:lts-alpine

RUN adduser -D nonroot
WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

USER nonroot
RUN echo "Hello from Docker build"

EXPOSE 3000

CMD ["node", "dist/index.js"]