# Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY ./src/package.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY ./src .

# Build production assets
RUN npm run build

# Serve the application
FROM nginx:alpine

# Copy static build files to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
