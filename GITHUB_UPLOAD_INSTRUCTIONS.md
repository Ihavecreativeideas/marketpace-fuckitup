# GitHub Upload Instructions - Founder Image Fix

## Files That Need to be Updated on GitHub for Vercel Deployment

### ✅ CRITICAL FILE TO UPLOAD:
- **pitch-page.html** - Fixed founder image path from `founder-brooke-brown.jpg` to `assets/founder-brooke-brown.jpg`

### ✅ IMAGE FILE STATUS:
- **assets/founder-brooke-brown.jpg** - Already exists in GitHub repository (confirmed in previous uploads)

## What Was Fixed:
- Line 476 in pitch-page.html: Updated image source path to include proper `assets/` directory
- This ensures Vercel can serve the founder performance picture correctly

## Upload Steps:

### Option 1: Direct GitHub Upload
1. Go to your GitHub repository: https://github.com/Ihavecreativeideas/MarketPace-WebApp
2. Navigate to the root directory
3. Click on `pitch-page.html`
4. Click "Edit this file" (pencil icon)
5. Replace the entire content with the updated version
6. Commit changes with message: "Fix founder image path for Vercel deployment"

### Option 2: Git Commands (if you have terminal access)
```bash
git add pitch-page.html
git commit -m "Fix founder image path - correct assets/founder-brooke-brown.jpg for Vercel deployment"
git push origin main
```

## Expected Result:
- Your beautiful performance picture will display properly in the founder section
- Vercel will automatically deploy the update within 1-2 minutes
- The founder section will show your image with cyan border effects

## File Status Check:
- ✅ pitch-page.html - MODIFIED (needs upload)
- ✅ assets/founder-brooke-brown.jpg - EXISTS (already in GitHub)
- ✅ All other files - NO CHANGES NEEDED

## Verification:
After upload, visit https://www.marketpace.shop and scroll to the "Why I Built MarketPace" section to confirm your founder image displays correctly.

---
**Note:** Only pitch-page.html needs to be updated. The image file already exists in your GitHub repository.