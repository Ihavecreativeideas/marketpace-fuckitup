# DNS Configuration for marketplace.shop

## Current Issue:
Vercel is showing "invalid configuration" because the DNS records don't match what's required for domain verification.

## Required DNS Records for Vercel:

### For Root Domain (marketplace.shop):
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 300 (or Auto)
```

### For WWW Subdomain (www.marketplace.shop):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300 (or Auto)
```

### Alternative Configuration (if the above doesn't work):
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 300 (or Auto)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300 (or Auto)
```

## Steps to Fix DNS:

### Step 1: Access Your Domain Provider
- Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
- Navigate to DNS management section

### Step 2: Clear Existing Records
- Remove any existing A records for @ and www
- Remove any existing CNAME records for @ and www

### Step 3: Add New Records
- Add the A record for @ pointing to 76.76.21.21
- Add the CNAME record for www pointing to cname.vercel-dns.com

### Step 4: Wait for Propagation
- DNS changes can take up to 24 hours to propagate
- Usually takes 5-15 minutes for most providers

### Step 5: Verify in Vercel
- Go back to Vercel dashboard
- Click "Verify" on the domain configuration
- Should show as verified once DNS propagates

## Common Issues:

### If You're Using Cloudflare:
- Make sure "Proxy status" is set to "DNS only" (gray cloud, not orange)
- Orange cloud (proxied) can interfere with Vercel's verification

### If You're Using Other CDN/Proxy:
- Temporarily disable any proxy services during verification
- Re-enable after domain is verified

## Alternative Method - Vercel Nameservers:
If the above doesn't work, you can use Vercel's nameservers:

1. In Vercel dashboard, go to domain settings
2. Choose "Use Vercel nameservers"
3. Copy the provided nameservers
4. Update your domain registrar to use these nameservers:
   - ns1.vercel-dns.com
   - ns2.vercel-dns.com

## Current Vercel Configuration:
Your vercel.json is already configured with:
- Domain: marketplace.shop
- Alternate: www.marketplace.shop
- All routing properly set up

The deployment will work immediately once DNS is configured correctly.