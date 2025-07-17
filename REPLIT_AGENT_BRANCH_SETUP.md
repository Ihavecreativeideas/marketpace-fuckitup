# Replit-Agent Branch Setup Instructions

## Step 1: Switch to replit-agent Branch
```bash
git checkout replit-agent
```

## Step 2: Add All Fixed Files
```bash
# Add the missing image files
git add marketpace-logo-1.jpeg
git add marketpace-hero-logo.jpeg
git add assets/founder-brooke-brown.jpg

# Add the fixed HTML files
git add admin-login.html
git add community.html
git add pitch-page.html
```

## Step 3: Commit Changes
```bash
git commit -m "Fix: Add missing image files and resolve login/navigation issues

- Add marketpace-logo-1.jpeg and marketpace-hero-logo.jpeg to root directory
- Add founder-brooke-brown.jpg to assets/ folder  
- Fix admin login redirect to /admin-dashboard (line 224)
- Fix community navigation conflicts by removing duplicate functions
- Update pitch-page.html with correct founder image path

Resolves: Broken logo display, missing founder image, admin login failure"
```

## Step 4: Push to GitHub
```bash
git push origin replit-agent
```

## Step 5: Create Pull Request on GitHub
1. Go to https://github.com/Ihavecreativeideas/MarketPace-WebApp
2. Click "New Pull Request"
3. Select: `replit-agent` → `main`
4. Title: "Fix missing images and admin login issues"
5. Description: "Resolves broken logo, founder image, and admin login redirect"
6. Click "Create Pull Request"

## Step 6: Review and Merge
- Review the changes in the pull request
- If everything looks good, click "Merge pull request"
- Vercel will automatically deploy within 2-3 minutes

## Files Being Added/Updated:
✅ **marketpace-logo-1.jpeg** - Main logo (10.4MB)
✅ **marketpace-hero-logo.jpeg** - Hero logo (10.4MB)  
✅ **assets/founder-brooke-brown.jpg** - Founder image (616KB)
✅ **admin-login.html** - Fixed redirect to /admin-dashboard
✅ **community.html** - Fixed navigation conflicts
✅ **pitch-page.html** - Updated with correct image paths

## Expected Results After Merge:
✅ Logo displays correctly on homepage
✅ Founder image shows in "Why I Built MarketPace" section
✅ Admin login works with credentials: admin/admin
✅ Community navigation buttons work properly
✅ No more broken image icons

## Need Help?
If you encounter any issues, run:
```bash
git status
git log --oneline -5
```
And share the output.