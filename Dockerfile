FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src ./src

# Build the TypeScript code
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Start the MCP server
CMD ["node", "dist/src/index.js"]