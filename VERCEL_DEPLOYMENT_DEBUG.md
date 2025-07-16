# Vercel Deployment Debug Guide

## Issue: Site Not Updating Despite GitHub Changes

The site www.marketpace.shop is not reflecting changes made to GitHub repository.

## Possible Causes:

### 1. Vercel Cache Issue
- Vercel may be serving cached version
- Solution: Force redeploy in Vercel dashboard

### 2. Wrong Branch Deployment
- Vercel might be deploying from wrong branch
- Check if deploying from main/master branch

### 3. File Path Issue
- Vercel might be looking for index.html instead of pitch-page.html
- Check vercel.json configuration

### 4. GitHub-Vercel Connection Issue
- Auto-deployment might be disabled
- Check Vercel project settings

## Immediate Solutions:

### Option 1: Force Redeploy
1. Go to Vercel dashboard
2. Find MarketPace project
3. Click "Redeploy" 
4. Select latest deployment
5. Force redeploy

### Option 2: Check Configuration
1. Verify vercel.json is correct
2. Check if index.html redirects properly
3. Ensure GitHub webhook is active

### Option 3: Manual Deployment
1. Download updated pitch-page.html
2. Upload directly to Vercel dashboard
3. Deploy manually

## Current Status:
- GitHub has updated files
- Vercel is not picking up changes
- Site showing old content without cyan theme