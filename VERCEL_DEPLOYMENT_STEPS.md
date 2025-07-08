# Vercel + GitHub Deployment Steps for MarketPace

## Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to github.com
   - Click "New Repository"
   - Name it: `marketpace-web-app`
   - Make it Public or Private (your choice)
   - Don't initialize with README (we have one)

2. **Connect your Replit to GitHub:**
   - In Replit, go to the Git tab (left sidebar)
   - Click "Connect to GitHub"
   - Select your new repository
   - Click "Connect"

3. **Push your code:**
   - In Replit Git tab, click "Commit & Push"
   - Add commit message: "Initial MarketPace deployment"
   - Click "Commit & Push to main"

## Step 2: Connect to Vercel

1. **Go to Vercel:**
   - Visit vercel.com
   - Sign up/login with your GitHub account

2. **Import your project:**
   - Click "New Project"
   - Select your GitHub repository: `marketpace-web-app`
   - Click "Import"

3. **Configure deployment:**
   - Framework Preset: "Other"
   - Root Directory: `./` (leave blank)
   - Build Command: Leave empty or use: `npm install`
   - Output Directory: `./`
   - Install Command: `npm install`

## Step 3: Set Environment Variables

In Vercel dashboard, go to Settings → Environment Variables and add:

```
STRIPE_SECRET_KEY = your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY = your_stripe_public_key
TWILIO_ACCOUNT_SID = your_twilio_sid
TWILIO_AUTH_TOKEN = your_twilio_token
TWILIO_PHONE_NUMBER = your_twilio_phone
DATABASE_URL = your_database_url
PGHOST = your_pg_host
PGPORT = your_pg_port
PGUSER = your_pg_user
PGPASSWORD = your_pg_password
PGDATABASE = your_pg_database
```

## Step 4: Deploy

1. **Deploy the project:**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like: `https://marketpace-web-app.vercel.app`

2. **Test your deployment:**
   - Visit your new URL
   - Test all pages:
     - Main pitch page: `/`
     - Demo app: `/enhanced-community-feed.html`
     - Driver app: `/driver-application.html`
     - Admin login: `/admin-login.html`
     - Sponsorship: `/sponsorship`

## Step 5: Add Custom Domain (www.MarketPace.shop)

1. **In Vercel dashboard:**
   - Go to Settings → Domains
   - Add domain: `marketpace.shop`
   - Add domain: `www.marketpace.shop`
   - Follow DNS verification instructions

2. **Update DNS at your domain registrar:**
   - Add A record: `@` → `76.76.19.19`
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - TTL: 300 seconds (5 minutes)

3. **DNS propagation:**
   - Wait 1-24 hours for DNS changes
   - SSL certificate issued automatically
   - Test at: `https://www.marketpace.shop`

## Step 6: Enable Auto-Deployment

**Automatic deployment is now set up:**
- Any push to your GitHub repository will trigger a new deployment
- Changes in Replit → Git → Commit & Push → Auto-deploys to Vercel

## Step 7: Access Your Live App

**Your live URLs:**
- Main site: `https://www.marketpace.shop`
- Demo app: `https://www.marketpace.shop/enhanced-community-feed.html`
- Admin dashboard: `https://www.marketpace.shop/admin-login.html`
- Driver application: `https://www.marketpace.shop/driver-application.html`
- Sponsorship: `https://www.marketpace.shop/sponsorship`

**Admin credentials:**
- Username: `admin`
- Password: `marketpace2025`

## Step 8: Ongoing Management

**To make changes:**
1. Edit files in Replit
2. Use Git tab to commit and push
3. Vercel automatically deploys the changes
4. Live site updates within 30 seconds

**Admin dashboard features:**
- Edit content without code changes
- Monitor all platform activity
- Manage users and drivers
- Export data and analytics

## Troubleshooting

**If deployment fails:**
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Ensure all required files are in repository
4. Check that `vercel.json` configuration is correct

**If pages don't load:**
1. Verify routes in `vercel.json`
2. Check that all HTML files are in root directory
3. Test locally first with `node pitch-page.js`

**Database connection issues:**
1. Verify `DATABASE_URL` is correct
2. Check that all PostgreSQL environment variables are set
3. Test database connection in admin dashboard

## Your Current File Structure

```
/
├── vercel.json              # Vercel configuration
├── .gitignore              # Git ignore file
├── README.md               # Project documentation
├── pitch-page.js           # Main server
├── enhanced-community-feed.html
├── driver-application.html
├── admin-dashboard.html
├── admin-login.html
├── package.json
└── [all other project files]
```

## Next Steps After Deployment

1. **Test all functionality on live site**
2. **Share live URLs with team/users**
3. **Monitor through admin dashboard**
4. **Set up domain if desired**
5. **Continue development in Replit → auto-deploy**

Your MarketPace web app is now live and ready for users!