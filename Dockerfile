# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install Nest CLI locally or globally (choose one)
RUN npm install @nestjs/cli --save-dev
# Or globally: RUN npm install -g @nestjs/cli

# Copy source files and build the app
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /usr/src/app

# Install only production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port (Fly.io expects this to match your app's listening port)
EXPOSE 3000

# Run the app in production mode
CMD ["node", "dist/src/main"]
