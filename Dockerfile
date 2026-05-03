# ─── Build Stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev) so we can generate Prisma client
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# ─── Production Stage ─────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy generated Prisma client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy prisma schema (needed for migrations)
COPY prisma ./prisma/

# Copy application source
COPY src ./src/
COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
