#!/bin/bash

echo "🚀 Starting SmartWaste KE Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if PostgreSQL is available (using environment variable for database URL)
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not set. Using default PostgreSQL connection."
    export DATABASE_URL="postgresql://postgres:password@localhost:5432/smartwaste_ke"
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/smartwaste_ke

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# M-Pesa Configuration (for production)
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-mpesa-shortcode
MPESA_PASSKEY=your-mpesa-passkey

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
EOF
    echo "✅ .env file created"
fi

# Create .env.local for frontend if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF
    echo "✅ .env.local file created"
fi

# Try to set up database (this might fail if PostgreSQL is not installed locally)
echo "🗄️  Setting up database..."
npm run db:setup 2>/dev/null || echo "⚠️  Database setup failed. You may need to set up PostgreSQL manually."

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Backend: npm run backend"
echo "2. Frontend: npm run dev"
echo ""
echo "Or run both together:"
echo "npm run start:backend"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "Demo accounts:"
echo "- User: john@example.com / demo123"
echo "- Admin: admin@smartwaste.ke / admin123"
