#!/bin/bash

echo "🚀 Pushing MarketPace Enhanced AI Security System to GitHub..."

# Add all files
git add .

# Commit with message
git commit -m "Enhanced AI Security System with OpenAI GPT-4o Integration

- Added comprehensive security vulnerability scanning system
- Implemented automated security fix generation with backup protection  
- Enhanced AI assistant with real OpenAI GPT-4o responses
- Added admin routes with advanced security scanning capabilities
- Built comprehensive vulnerability detection for 10+ security types"

# Add remote (will show error if already exists, that's ok)
git remote add origin https://github.com/Ihavecreativeideas/MarketPace-WebApp.git 2>/dev/null || true

# Push to GitHub
git push -u origin main

echo "✅ Successfully pushed to GitHub!"