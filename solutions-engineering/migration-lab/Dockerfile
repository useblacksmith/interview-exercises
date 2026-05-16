FROM node:22-bookworm-slim

WORKDIR /app

COPY app ./
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm ci --omit=dev
RUN node scripts/docker-build-workload.js

EXPOSE 3000

CMD ["node", "src/server.js"]
