# Step 1: Base image using official Node.js Alpine for minimum image size & security
FROM node:20-alpine

# Metadata labels
LABEL maintainer="Pawan Suman <BT24CSD054>"
LABEL description="Student Task Management Web Application - Practical 2"

# Set working directory inside container
WORKDIR /app

# Set production environment variable
ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application code into container
COPY . .

# Ensure data directory exists and has write permissions
RUN mkdir -p /app/data && chmod -R 777 /app/data

# Expose container port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
