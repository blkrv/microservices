FROM node:20-alpine

RUN adduser -D nonroot
WORKDIR /app
COPY package*.json ./

RUN npm install
RUN npm install -g typescript

COPY . .

USER nonroot
RUN npm run build

EXPOSE 3004

CMD ["node", "dist/index.js"]