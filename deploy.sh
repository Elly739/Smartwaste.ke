#!/bin/bash

echo "🚀 Deploying SmartWaste KE to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Set up environment variables
echo "⚙️  Setting up environment variables..."
echo "Please set up these environment variables in your Vercel dashboard:"
echo "- DATABASE_URL (your Neon/PostgreSQL connection string)"
echo "- JWT_SECRET (a secure random string)"
echo "- NODE_ENV=production"

# Build and deploy
echo "🏗️  Building and deploying..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app should be available at the URL provided by Vercel"
