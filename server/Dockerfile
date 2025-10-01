# Dockerfile for n8n Lead Sync Backend
FROM node:22-alpine

# Install wget for health check
RUN apk add --no-cache wget

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create wait-for script
RUN echo '#!/bin/sh' > /wait-for.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /wait-for.sh && \
    echo 'sleep 10' >> /wait-for.sh && \
    echo 'exec "$@"' >> /wait-for.sh && \
    chmod +x /wait-for.sh

# Expose port
EXPOSE 3000

# Health check (with longer start period for database connection)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start the application with wait
ENTRYPOINT ["/wait-for.sh"]
CMD ["node", "index.js"]
