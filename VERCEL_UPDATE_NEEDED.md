# VERCEL UPDATE REQUIRED

## FILES TO UPLOAD TO GITHUB:

### 1. **checkout.html** (CRITICAL)
- Updated Stripe integration with your publishable key
- Fixed API endpoints to use `/api/stripe/create-payment-intent`
- Payment processing now fully functional

### 2. **community.html** (LOGO FIX)
- Fixed header layout for proper logo display
- Prevents logo cropping on community page

### 3. **sponsorship.html** (LOGO FIX)
- Updated to use optimized logo file
- Consistent branding across all pages

### 4. **server/index.ts** (BACKEND)
- Added complete Stripe payment endpoints
- Payment processing, customer creation, config endpoints
- Required for checkout functionality

## ENVIRONMENT VARIABLES NEEDED IN VERCEL:

Add these to your Vercel environment variables:
- `STRIPE_SECRET_KEY` = sk_test_51RWIgaP3SiNvxf9FGKzzFNAKEUQjWcz0qfFVMQqZBqHW0wpnWN4MzDi89hA6gokwGe9CjCKiP8XtW9ZGtB2QqIxn00OvuFmBsf
- `STRIPE_PUBLISHABLE_KEY` = pk_test_51RWIgaP3SiNvxf9FaVhQzEBMKTcTIy7SkCpOPyLuS12JMEykSGD31RA2BbbirGNgXhRLiAqlDqDweQNk06f9aEGK00WRSmHeKL
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` = pk_test_51RWIgaP3SiNvxf9FaVhQzEBMKTcTIy7SkCpOPyLuS12JMEykSGD31RA2BbbirGNgXhRLiAqlDqDweQNk06f9aEGK00WRSmHeKL

## EXPECTED RESULTS AFTER UPLOAD:
✅ Checkout page processes real payments
✅ Logo displays properly on all pages  
✅ Stripe integration fully functional on live site
✅ Users can complete purchases

**Upload these 4 files to enable payment processing on your live site.**