FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy root and client package definitions
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies for root and client
RUN npm install
RUN npm install --prefix client

# Copy application source code
COPY . .

# Build Vite client SPA
RUN npm run build

# Expose port
EXPOSE 3000
ENV PORT=3000

# Start background server & API engine
CMD ["npm", "start"]
