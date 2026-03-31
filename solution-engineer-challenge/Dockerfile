FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --production

COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]
