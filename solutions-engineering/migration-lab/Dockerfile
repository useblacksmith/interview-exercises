FROM --platform=linux/amd64 node:22-bookworm-slim

WORKDIR /app

COPY app/package*.json ./
RUN npm ci --omit=dev

COPY app/src ./src
COPY app/scripts ./scripts

EXPOSE 3000

CMD ["node", "src/server.js"]
