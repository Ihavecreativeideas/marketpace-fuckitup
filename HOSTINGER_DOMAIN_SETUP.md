# Hostinger Domain Setup for MarketPace Vercel Deployment

## Step 1: Add Domain in Vercel

1. Go to your Vercel dashboard
2. Select your "MarketPace-WebApp" project
3. Click "Settings" → "Domains"
4. Add both:
   - `marketpace.shop`
   - `www.marketpace.shop`
5. Vercel will show you DNS records to configure

## Step 2: Configure DNS in Hostinger

1. Login to your Hostinger account
2. Go to "Domains" → "DNS Zone"
3. Select "marketpace.shop"
4. Add these records:

### Required DNS Records:

**A Record:**
- Type: A
- Name: @ (or leave blank)
- Value: 76.76.19.61
- TTL: 14400

**CNAME Record:**
- Type: CNAME  
- Name: www
- Value: cname.vercel-dns.com
- TTL: 14400

**Optional - For better performance:**
- Type: CNAME
- Name: *
- Value: cname.vercel-dns.com
- TTL: 14400

## Step 3: Remove Conflicting Records

Delete any existing A or CNAME records that point to:
- Old hosting providers
- Parking pages
- Other services

## Step 4: Wait for Propagation

- DNS changes take 24-48 hours to fully propagate
- You can check status at: https://dnschecker.org
- Vercel will show "Valid Configuration" when ready

## Step 5: Enable SSL

Vercel automatically handles SSL certificates once DNS is properly configured.

## Troubleshooting:

**If you see 403 errors:**
- Wait longer for DNS propagation
- Check Hostinger DNS zone for conflicting records
- Verify A record points to 76.76.19.61

**If you see "Domain not found":**
- Confirm CNAME record: www → cname.vercel-dns.com
- Check TTL settings (14400 recommended)

Your MarketPace platform will be live at www.marketpace.shop once DNS propagates!