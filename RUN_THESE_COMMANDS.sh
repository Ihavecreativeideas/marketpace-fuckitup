#!/bin/bash

# Git commands to upload missing image files via replit-agent branch

echo "🚀 Uploading missing image files to GitHub..."
echo "==================================="

# Step 1: Switch to replit-agent branch
echo "📍 Switching to replit-agent branch..."
git checkout replit-agent

# Step 2: Add the missing image files
echo "📁 Adding image files..."
git add marketpace-logo-1.jpeg
git add marketpace-hero-logo.jpeg
git add assets/founder-brooke-brown.jpg

# Step 3: Commit the files
echo "💾 Committing image files..."
git commit -m "Add missing image files for logo and founder

- marketpace-logo-1.jpeg (10.4MB) - Main logo
- marketpace-hero-logo.jpeg (10.4MB) - Hero logo  
- assets/founder-brooke-brown.jpg (616KB) - Founder image

Fixes: Broken logo and founder image display on live site"

# Step 4: Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin replit-agent

echo "✅ Files uploaded to replit-agent branch!"
echo "📝 Next steps:"
echo "1. Go to https://github.com/Ihavecreativeideas/MarketPace-WebApp"
echo "2. Click 'New Pull Request'"
echo "3. Select replit-agent → main"
echo "4. Review and merge"
echo "5. Wait 2-3 minutes for Vercel deployment"