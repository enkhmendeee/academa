# Use lightweight Node image
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./
COPY prisma ./prisma/

# Install all deps (including dev deps for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code and types
COPY src ./src/
COPY types ./types/
COPY tsconfig.json ./

# Build the application
RUN npm run build

# Remove dev dependencies and source files
RUN npm ci --omit=dev && npm cache clean --force
RUN rm -rf src types tsconfig.json

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port 3000 (Fly.io will map this to 8080)
EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the app
CMD ["node", "dist/index.js"]

