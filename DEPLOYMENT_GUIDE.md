# MarketPace Web App Deployment Guide

## Complete Deployment Steps for Full Admin Control

### 1. Replit Deployment (Recommended - Easiest)

**Step 1: Deploy on Replit**
1. Click the "Deploy" button in your Replit interface
2. Choose "Static Site" deployment
3. Set build command: `node pitch-page.js`
4. Set output directory: `./` (root directory)
5. Click "Deploy"

**Step 2: Custom Domain Setup**
1. In Replit Deployments, go to "Custom Domains"
2. Add your domain (e.g., `marketpace.shop`)
3. Update DNS records at your domain registrar:
   - Add CNAME record: `www` → `your-repl-name.replit.app`
   - Add A record: `@` → Replit's IP address (provided in dashboard)

**Step 3: Environment Variables**
1. In Replit Secrets tab, ensure these are set:
   - `STRIPE_SECRET_KEY`
   - `VITE_STRIPE_PUBLIC_KEY`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER`
   - `DATABASE_URL`

### 2. Alternative Deployment Options

#### Option A: Netlify
1. Create account at netlify.com
2. Connect your GitHub repository
3. Build settings:
   - Build command: `node pitch-page.js`
   - Publish directory: `./`
4. Add environment variables in Netlify dashboard
5. Custom domain: Add in Netlify DNS settings

#### Option B: Vercel
1. Create account at vercel.com
2. Import your project from GitHub
3. Framework preset: "Other"
4. Build command: `node pitch-page.js`
5. Add environment variables in Vercel dashboard

#### Option C: Railway
1. Create account at railway.app
2. Deploy from GitHub
3. Add environment variables
4. Custom domain in Railway dashboard

### 3. Admin Dashboard Control Setup

**Current Admin Access:**
- URL: `yourdomain.com/admin-login.html`
- Username: `admin`
- Password: `marketpace2025`

**Admin Dashboard Features You Control:**
1. **Content Management:**
   - Edit all pages (Home, Community, Sponsorship, Driver App)
   - Draft/Publish workflow
   - Real-time preview

2. **Campaign Tracking:**
   - Monitor signups, drivers, sponsors
   - Analytics and conversion rates
   - Export user data

3. **Integration Management:**
   - Stripe payment monitoring
   - Twilio SMS status
   - Database health checks
   - API usage tracking

4. **User Management:**
   - View all registered users
   - Driver application approvals
   - Sponsorship management
   - Demo user analytics

### 4. Database Setup (PostgreSQL)

**Your database is already configured with these tables:**
- `users` - User profiles and authentication
- `demo_users` - Demo signup tracking
- `password_reset_tokens` - Password recovery
- `sessions` - User sessions
- `sponsors` - Sponsorship data
- `driver_applications` - Driver submissions

**Database Access:**
- Current: Neon Database (PostgreSQL)
- Connection string in `DATABASE_URL` environment variable
- Admin can view/export data through dashboard

### 5. SSL Certificate & Security

**Automatic SSL:**
- Replit, Netlify, Vercel all provide automatic HTTPS
- No additional configuration needed

**Security Features Already Implemented:**
- Helmet.js security headers
- CORS protection
- Session-based authentication
- Rate limiting on sensitive endpoints
- Input validation and sanitization

### 6. Custom Domain DNS Configuration

**For marketpace.shop (or your domain):**

```
Type    Name    Value
A       @       [Deployment Platform IP]
CNAME   www     your-app.platform.app
```

**Platform-specific:**
- Replit: Use provided IP and CNAME
- Netlify: Use Netlify DNS or custom records
- Vercel: Automatic configuration
- Railway: Use Railway's provided values

### 7. File Structure for Deployment

**Your app includes these key files:**
```
/
├── pitch-page.js (main server)
├── enhanced-community-feed.html (demo app)
├── driver-application.html
├── admin-dashboard.html
├── admin-login.html
├── sponsorship pages
├── database schemas
└── static assets
```

### 8. Post-Deployment Checklist

**Test These Features:**
1. ✅ Main pitch page loads
2. ✅ Demo community feed works
3. ✅ Driver application form submits
4. ✅ Sponsorship checkout processes
5. ✅ Admin login and dashboard access
6. ✅ Database connections work
7. ✅ SMS notifications send
8. ✅ Email functionality works

### 9. Admin Dashboard URLs (After Deployment)

**Production URLs:**
- Main site: `https://yourdomain.com`
- Demo app: `https://yourdomain.com/enhanced-community-feed.html`
- Admin login: `https://yourdomain.com/admin-login.html`
- Admin dashboard: `https://yourdomain.com/admin-dashboard.html`
- Driver app: `https://yourdomain.com/driver-application.html`
- Sponsorship: `https://yourdomain.com/sponsorship`

### 10. Ongoing Management

**Through Admin Dashboard You Can:**
- Edit content without code changes
- Monitor all platform metrics
- Manage users and drivers
- Process sponsorships
- Export data for analysis
- Monitor API health
- Send notifications to users

**Direct File Access:**
- Still available through your hosting platform
- Admin dashboard provides GUI for most changes
- Code updates can be pushed through Git integration

### 11. Backup & Recovery

**Database Backups:**
- Neon Database: Automatic daily backups
- Export function in admin dashboard
- PostgreSQL dump capabilities

**Code Backups:**
- GitHub repository maintains full history
- Deployment platforms keep previous versions
- Admin dashboard changes are logged

### 12. Support & Maintenance

**Monitoring:**
- Admin dashboard shows real-time status
- Error logging through platform dashboards
- Database performance metrics
- API usage tracking

**Updates:**
- Push code changes through Git
- Admin content changes through dashboard
- Environment variables through platform settings
- Database schema updates through migrations

---

## Quick Start Deployment Command

For immediate deployment on Replit:
1. Click "Deploy" button
2. Select "Static Site"
3. Deploy with current settings
4. Add custom domain in deployment settings

Your admin dashboard will be immediately accessible at:
`https://your-deployed-url.com/admin-login.html`

Username: `admin` | Password: `marketpace2025`