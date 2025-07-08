# Custom Domain Setup: www.MarketPace.shop

## Domain Configuration for Vercel

### Step 1: Add Domain in Vercel Dashboard

After deploying to Vercel:

1. **Go to your Vercel project dashboard**
2. **Click "Settings" → "Domains"**
3. **Add these domains:**
   - `marketpace.shop` (primary domain)
   - `www.marketpace.shop` (www subdomain)

### Step 2: DNS Configuration at Your Domain Registrar

**Go to your domain registrar (where you bought marketpace.shop) and add these DNS records:**

#### For Root Domain (marketpace.shop):
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 300
```

#### For WWW Subdomain (www.marketpace.shop):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

### Step 3: Alternative DNS Setup (if above doesn't work)

Some registrars prefer this configuration:

#### Root Domain:
```
Type: CNAME
Name: @
Value: alias.vercel-dns.com
TTL: 300
```

#### WWW Subdomain:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300
```

### Step 4: Popular Domain Registrars Instructions

#### GoDaddy:
1. Go to DNS Management
2. Add A record: `@` → `76.76.19.19`
3. Add CNAME record: `www` → `cname.vercel-dns.com`

#### Namecheap:
1. Go to Advanced DNS
2. Add A record: `@` → `76.76.19.19`
3. Add CNAME record: `www` → `cname.vercel-dns.com`

#### Cloudflare:
1. Go to DNS settings
2. Add A record: `@` → `76.76.19.19`
3. Add CNAME record: `www` → `cname.vercel-dns.com`

### Step 5: SSL Certificate (Automatic)

Vercel automatically provides SSL certificates for custom domains:
- `https://marketpace.shop` ✅
- `https://www.marketpace.shop` ✅

### Step 6: Domain Verification

**In Vercel:**
1. After adding DNS records, click "Verify" in Vercel dashboard
2. Domain status should change to "Valid"
3. SSL certificate will be issued automatically

### Step 7: Your Live URLs

**After setup completion:**
- **Primary**: `https://www.marketpace.shop`
- **Alternative**: `https://marketpace.shop`
- **Demo App**: `https://www.marketpace.shop/enhanced-community-feed.html`
- **Admin Dashboard**: `https://www.marketpace.shop/admin-login.html`
- **Driver Application**: `https://www.marketpace.shop/driver-application.html`
- **Sponsorship**: `https://www.marketpace.shop/sponsorship`

### Step 8: Redirect Configuration

The `vercel.json` file is configured to:
- Redirect `marketpace.shop` → `www.marketpace.shop`
- Handle all routes properly with custom domain
- Maintain admin dashboard functionality

### Step 9: Testing

**Test these URLs after DNS propagation (24-48 hours):**
1. `https://www.marketpace.shop` - Main pitch page
2. `https://www.marketpace.shop/enhanced-community-feed.html` - Demo app
3. `https://www.marketpace.shop/admin-login.html` - Admin access

### Step 10: Admin Access on Custom Domain

**Admin credentials remain the same:**
- **URL**: `https://www.marketpace.shop/admin-login.html`
- **Username**: `admin`
- **Password**: `marketpace2025`

### DNS Propagation Time

**Expected timeframes:**
- DNS changes: 1-24 hours
- SSL certificate: 5-10 minutes after DNS verification
- Full propagation: Up to 48 hours globally

### Troubleshooting

**If domain doesn't work:**
1. Check DNS records are correct
2. Wait for DNS propagation (up to 48 hours)
3. Use DNS checker tools: `whatsmydns.net`
4. Contact your domain registrar for DNS support

**If SSL certificate fails:**
1. Ensure DNS records are correct
2. Remove and re-add domain in Vercel
3. Wait for automatic SSL provisioning

### Current Status

🔄 **Waiting for:**
1. GitHub connection and file push
2. Vercel deployment
3. Domain addition in Vercel dashboard
4. DNS configuration at registrar

**Next Steps:**
1. Complete GitHub push
2. Deploy to Vercel
3. Add custom domain in Vercel settings
4. Configure DNS records at your registrar