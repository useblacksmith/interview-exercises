FROM node:22-bookworm-slim

WORKDIR /app

COPY app ./
RUN npm ci --omit=dev
RUN node scripts/docker-build-workload.js

EXPOSE 3000

CMD ["node", "src/server.js"]
