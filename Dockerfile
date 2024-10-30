# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy application code and build
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Copy only necessary build files from the builder stage
# COPY --from=builder /app/package.json ./
COPY --from=builder /app/dist ./dist

# Install only production dependencies
# RUN npm install --omit=dev

# Set environment variables and expose the necessary port
ENV PORT=4321
ENV HOST=0.0.0.0
EXPOSE 4321

CMD node ./dist/server/entry.mjs