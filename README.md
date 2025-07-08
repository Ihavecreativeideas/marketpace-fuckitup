# MarketPace - Community-First Marketplace

A comprehensive community marketplace platform with integrated delivery services, built with a focus on local empowerment and neighborhood commerce.

## Features

- **Community Feed**: Facebook-style community interaction with posts, polls, and local engagement
- **Marketplace**: Buy, sell, rent items with integrated delivery system
- **Driver Network**: Professional delivery service with route optimization
- **Sponsorship Program**: Local business support and partnership opportunities
- **Admin Dashboard**: Complete platform management and analytics
- **Demo Mode**: Full-featured preview system for new markets

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript with futuristic dark theme
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Neon Database)
- **Payments**: Stripe integration
- **SMS**: Twilio integration
- **Deployment**: Vercel, Netlify, Railway compatible

## Quick Start

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Run development server: `node pitch-page.js`
5. Access at `http://localhost:5000`

### Deployment

#### Vercel Deployment
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

#### Environment Variables Required
- `STRIPE_SECRET_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `DATABASE_URL`

## Project Structure

```
/
├── pitch-page.js                 # Main server file
├── enhanced-community-feed.html  # Demo community app
├── driver-application.html       # Driver signup form
├── admin-dashboard.html          # Admin management panel
├── admin-login.html             # Admin authentication
├── sponsorship/                 # Sponsorship pages
├── server/                      # Backend logic
├── client/                      # React Native mobile app
├── shared/                      # Shared schemas and types
└── vercel.json                  # Vercel deployment config
```

## Key Pages

- **Main Site**: `/` - Pitch page and campaign information
- **Demo App**: `/enhanced-community-feed.html` - Full marketplace demo
- **Driver App**: `/driver-application.html` - Driver recruitment
- **Admin Panel**: `/admin-login.html` - Platform management
- **Sponsorship**: `/sponsorship` - Business partnership opportunities

## Admin Access

- **URL**: `yourdomain.com/admin-login.html`
- **Username**: `admin`
- **Password**: `marketpace2025`

## Features

### Community Features
- Interactive posting system
- Polls and community engagement
- Local event calendar
- Location-based filtering

### Marketplace
- Buy/sell/rent listings
- Integrated delivery system
- Counter-offer negotiations
- Shopping cart functionality

### Delivery System
- Professional driver network
- Route optimization
- Real-time tracking
- Earnings transparency

### Admin Dashboard
- User management
- Analytics and reporting
- Content management
- Integration monitoring

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

Private project - All rights reserved

## Support

For technical support or questions, contact through the admin dashboard or repository issues.