#!/bin/bash

echo "🚀 Launching MarketPace Web App for MarketPace.shop"
echo "======================================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Display Node.js version
echo "✅ Node.js version: $(node --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set production environment
export NODE_ENV=production
export PORT=5000

# Start the web server
echo "🌐 Starting MarketPace Web App..."
echo "🔗 Will be available at: http://localhost:5000"
echo "🎯 Ready for deployment to: https://MarketPace.shop"
echo ""
echo "📋 Available Routes:"
echo "   / - Full MarketPace Application"
echo "   /pitch - Founder's Story & Pitch Page"
echo "   /health - Health Check"
echo ""
echo "⚡ Starting server now..."

node web-server.js