#!/bin/bash
# FINAL FIX FOR LOGO 404 ERRORS
# Run these exact commands to fix your logo display

echo "Clearing git lock..."
rm -f .git/index.lock

echo "Adding optimized files..."
git add marketpace-logo-optimized.jpeg
git add pitch-page.html
git add community.html

echo "Committing changes..."
git commit -m "Fix logo 404: Add optimized 35KB logo and updated HTML files"

echo "Pushing to GitHub..."
git push origin main

echo "Done! Logo should display correctly on www.marketpace.shop within 2 minutes"