#!/bin/bash

# Navigate to the project directory
cd smartwaste-ke

# Install backend dependencies (if not already installed)
npm install express cors helmet bcryptjs jsonwebtoken pg dotenv joi multer uuid node-cron nodemon

# Set up environment variables
echo "Setting up environment variables..."

# Create .env file for backend
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/smartwaste_ke

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
EOF

# Start the backend server
echo "Starting backend server on port 3001..."
node src/server.js
