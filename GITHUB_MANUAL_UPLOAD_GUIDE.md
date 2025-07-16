# MANUAL GITHUB UPLOAD GUIDE

## FILES TO UPLOAD:
Upload these 2 files to your GitHub repository root:

### 1. vercel.json
```json
{
  "version": 2,
  "public": true,
  "builds": [
    {
      "src": "**/*.html",
      "use": "@vercel/static"
    },
    {
      "src": "**/*.js",
      "use": "@vercel/static"
    },
    {
      "src": "**/*.css",
      "use": "@vercel/static"
    },
    {
      "src": "**/*.jpg",
      "use": "@vercel/static"
    },
    {
      "src": "**/*.png",
      "use": "@vercel/static"
    },
    {
      "src": "**/*.svg",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/",
      "dest": "/pitch-page.html"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 2. .vercelignore
```
attached_assets/
*.db
*.log
node_modules/
.env
.git/
server/
client/
shared/
src/
*.ts
*.tsx
drizzle.config.json
*.md
!README.md
```

## UPLOAD STEPS:
1. Go to your GitHub repository: https://github.com/Ihavecreativeideas/MarketPace-WebApp
2. Click "Add file" → "Create new file"
3. Create `vercel.json` with the content above
4. Commit the file
5. Create `.vercelignore` with the content above
6. Commit the file
7. Wait 2-3 minutes for Vercel to redeploy
8. Test www.marketpace.shop

## EXPECTED RESULT:
After uploading these files and changing OIDC to global:
- Security checkpoint should disappear
- Site should load normally
- All authentication should work
- Founder image should display

This forces Vercel to treat your site as a static HTML site with proper routing.