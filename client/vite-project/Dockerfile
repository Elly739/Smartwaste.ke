# Multi-stage build for SmartWaste client

# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runtime stage
FROM node:20-alpine

# Install dumb-init and a simple HTTP server
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create a simple Node server to serve the static files
RUN npm init -y && npm install --save-dev express

# Copy the server script
COPY <<EOF ./server.js
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE_URL = process.env.VITE_API_BASE_URL || '/api';

// Serve static files from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy API requests to backend
if (API_BASE_URL.startsWith('http')) {
  app.use('/api', async (req, res) => {
    try {
      const backendUrl = \`\${API_BASE_URL}\${req.path}\`;
      const response = await fetch(backendUrl, {
        method: req.method,
        headers: {
          ...req.headers,
          host: new URL(API_BASE_URL).host,
        },
        body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
}

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(\`Frontend server running on http://localhost:\${PORT}\`);
  console.log(\`API Base URL: \${API_BASE_URL}\`);
});
EOF

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "server.js"]
