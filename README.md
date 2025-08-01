# SmartWaste KE - Digital Waste Collection Platform

A complete full-stack application for digital waste collection in Kenya, built with Next.js, Node.js, and PostgreSQL.

## 🚀 Quick Start

### Option 1: Automatic Setup
\`\`\`bash
node quick-start.js
npm install
node start-app.js
\`\`\`

### Option 2: Manual Setup
\`\`\`bash
# Install dependencies
npm install

# Set up database (requires PostgreSQL)
npm run db:setup

# Start backend (Terminal 1)
npm run backend

# Start frontend (Terminal 2)
npm run dev
\`\`\`

### Option 3: Using Scripts
\`\`\`bash
# Make script executable
chmod +x start.sh

# Run setup script
./start.sh
\`\`\`

## 📱 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 🧪 Demo Accounts

- **Regular User**: `john@example.com` / `demo123`
- **Admin User**: `admin@smartwaste.ke` / `admin123`
- **Demo User 2**: `mary@example.com` / `demo123`

## 🎯 Features

- ✅ User Authentication & Onboarding
- ✅ Pickup Request System
- ✅ QR Code Scanning Simulation
- ✅ Points & Rewards System
- ✅ Achievement System
- ✅ Admin Dashboard
- ✅ Real-time Analytics
- ✅ Mobile-Responsive Design

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, JWT Authentication
- **Database**: PostgreSQL
- **Charts**: Recharts
- **Icons**: Lucide React

## 📊 Database Requirements

The application requires PostgreSQL. If you don't have it installed:

### macOS:
\`\`\`bash
brew install postgresql
brew services start postgresql
\`\`\`

### Ubuntu/Debian:
\`\`\`bash
sudo apt update
sudo apt install postgresql postgresql-contrib
\`\`\`

### Windows:
Download from https://www.postgresql.org/download/windows/

## 🔧 Environment Variables

The application will create `.env` and `.env.local` files automatically, but you can customize:

\`\`\`env
DATABASE_URL=postgresql://username:password@localhost:5432/smartwaste_ke
JWT_SECRET=your-secret-key
PORT=3001
FRONTEND_URL=http://localhost:3000
\`\`\`

## 🚀 Deployment

### Frontend (Vercel)
\`\`\`bash
npm run build
# Deploy to Vercel
\`\`\`

### Backend (Railway/Heroku)
\`\`\`bash
# Set environment variables
# Deploy backend separately
\`\`\`

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/pickups` - Create pickup request
- `GET /api/pickups` - Get user pickups
- `POST /api/pickups/:id/complete` - Complete pickup
- `GET /api/rewards` - Get available rewards
- `POST /api/rewards/:id/redeem` - Redeem reward

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
