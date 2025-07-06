# MarketPace - Community-First Marketplace

## Overview

MarketPace is a React Native mobile application that prioritizes community empowerment and local commerce over global reach. It's designed as a "neighborhood-first" platform where locals can sell, buy, rent items, find odd jobs, book entertainment, and support each other through integrated delivery services. Unlike traditional marketplaces, MarketPace focuses on circulating money within communities, creating local jobs, and building stronger neighborhoods.

**Tagline:** "Delivering Opportunities. Building Local Power."

**Core Concept:** Community + Marketplace + Delivery platform designed to uplift neighborhoods

## System Architecture

### Frontend Architecture
- **React Native** with Expo framework for cross-platform mobile development
- **React Navigation** for routing with stack and tab navigation patterns
- **React Query (TanStack Query)** for server state management and caching
- **Context API** for global state management (Auth, Cart)
- **Stripe React Native** for payment processing
- **Expo modules** for camera, location, image picker, and document picker functionality

### Backend Architecture
- **Express.js** server with TypeScript support
- **Drizzle ORM** for database operations
- **Neon Database** (PostgreSQL-compatible) for data persistence
- **Replit Auth** using OpenID Connect for authentication
- **Stripe** integration for payment processing and subscriptions
- **Express sessions** with PostgreSQL session storage
- **WebSocket support** for real-time features

### Authentication System
- OpenID Connect integration with Replit Auth
- Session-based authentication with secure cookies
- Role-based access control (buyer, seller, driver, admin)
- Automatic session management and token refresh

## Key Features & Community Focus

### 🏠 Bottom Navigation Structure (Facebook-Style)
- **Home:** Personalized local feed with nearby listings and community updates
- **Marketplace:** Core buying/selling hub with tabs for Sale, Rent, Services, Events
- **Community:** Local-only feed for status updates, polls, ISOs, hiring posts, events
- **Deliveries:** Driver dashboard and delivery tracking for all users
- **Menu:** Profile, settings, business account switching, logout

### 👥 User Account System
**Dual Profile Options:**
- **Personal:** Individual buyers/sellers for personal items and services
- **Personal + Business:** Enhanced accounts supporting:
  - 🛒 **Shops:** Non-food retail businesses
  - 🛠 **Services:** Labor and professional services
  - 🎭 **Entertainment (The Hub):** DJs, comedians, bands, musicians, theaters

**Sign-up Options:**
- Facebook, Google, Apple ID, Email
- Guest Mode (view only, no posting/purchasing)
- Personalized questionnaire: profile pic, bio, interests, address, profile type

### 🛍 Marketplace Categories
**Four Main Tabs:**
1. **For Sale:** Traditional marketplace items
2. **For Rent:** "Rent Anything" - baby gear, tools, tents, equipment
3. **Services:** Odd jobs, quick tasks, gig opportunities
4. **Events:** Local entertainment and community events

**Key Features:**
- Counter-offer system for negotiations
- Add to cart functionality
- Location-based filtering by radius
- Facebook-style feed layout with grid system

### 📍 Community-First Features
**Local Community Feed:**
- Status updates and local announcements
- Polls for community decisions
- ISO (In Search Of) posts
- "Hiring Now" business postings
- Local event listings
- Livestreaming (Pro feature)

**The Hub (Entertainment):**
- Dedicated space for local artists and entertainers
- Booking system for events
- Event calendar integration
- Live stream capabilities
- Review and rating system

### 🚚 Simplified Delivery System
**Driver Structure:**
- Independent contractor model
- Required documentation: Driver's License, Insurance, Background Check
- Immediate onboarding upon approval
- 4 daily time slots: 9am-12pm, 12pm-3pm, 3pm-6pm, 6pm-9pm

**Route Logic:**
- Maximum 6 deliveries per route (12 stops: pickup + drop-off)
- Drivers can accept max 2 routes per time block
- AI-optimized routing for efficiency
- Color-coded tracking: Dark Blue → Light Blue, Dark Red → Light Red
- No GPS tracking - simplified status-based system

**Payment Structure:**
- $4 per pickup, $2 per drop-off, $0.50 per mile
- 100% of tips go to drivers
- Immediate payment via Stripe after route completion
- 50/50 delivery cost split between buyer and seller

### 💳 Subscription Tiers
**Free Basic Membership:**
- Post, browse, buy basic features
- MarketPace delivery only

**Pro Memberships:**
- **Silver ($15/month):** Website integration, self pick-up, color tracking, live posting
- **Gold ($25/month):** AI analysis, product import, event tools, custom profile design
- **Platinum ($50/month):** Livestreaming, advanced analytics, "For You" page ads

### 🎁 Campaign Launch Features
**Free Trial Period:**
- All features available free during launch
- Early users receive lifetime Pro benefits
- Special "Early Supporter" badge and featured tab
- Campaign tracker showing total towns, shops, services, members

## Data Flow

### Authentication Flow
1. User initiates login through Replit Auth
2. OpenID Connect handles authentication
3. Session established with PostgreSQL storage
4. User context propagated throughout application

### Order Processing Flow
1. User adds items to cart
2. Checkout process with delivery address and payment
3. Payment processed through Stripe
4. Order created and assigned to delivery route
5. Driver accepts route and completes deliveries
6. Payment released to driver upon completion

### Driver Application Flow
1. User submits driver application with required documents
2. Admin reviews application and verifies documents
3. Background check verification required
4. Application approved/rejected
5. Approved drivers can access delivery routes

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL-compatible cloud database
- **Stripe**: Payment processing and subscription management
- **Replit Auth**: OpenID Connect authentication provider

### Expo Services
- **Expo Camera**: Photo capture for listings and verification
- **Expo Location**: GPS tracking for delivery services
- **Expo Image Picker**: Image selection from device gallery
- **Expo Document Picker**: Document upload for driver applications

### Third-party Integrations
- **WebSocket**: Real-time communication for delivery tracking
- **React Native Maps**: Route visualization and navigation
- **Image hosting**: External service for listing images

## Deployment Strategy

### Development Environment
- Replit-based development with hot reloading
- Metro bundler configuration for monorepo structure
- Shared code between client and server through workspace structure

### Production Considerations
- Environment variable management for API keys and secrets
- Database connection pooling for scalability
- Session store optimization for high traffic
- Image CDN integration for performance
- Push notification setup for delivery updates

### Security Measures
- Secure session management with HTTP-only cookies
- Rate limiting on authentication endpoints
- Input validation and sanitization
- CORS configuration for API access
- Helmet.js for security headers

## Recent Changes

✓ **COMPREHENSIVE REVENUE SYSTEM IMPLEMENTATION** (July 06, 2025)
✓ Built complete ethical revenue model based on user specifications
✓ Implemented in-app wallet system with 10% bonus on credit loads
✓ Created subscription tiers: Basic (free) and Pro ($3.99/month)
✓ Added transaction fee system: 5% on sales/services + optional insurance/verification
✓ Built promotion system: listing boosts ($2-$10), pin-to-top ($1/day)
✓ Created sponsorship platform for local business support
✓ Implemented driver payment structure: $4 pickup + $2 dropoff + $0.50/mile + 100% tips
✓ Added return handling with 5-minute delivery refusal window
✓ Built revenue analytics dashboard for platform metrics
✓ Created comprehensive database schema with 10+ new revenue tables
✓ Developed client-side components: WalletCard, SubscriptionCard, RevenueDashboard
✓ Integrated Stripe-ready payment processing infrastructure
✓ Added local partner business directory with exclusive deals
✓ Implemented ethical fee structure with full transparency

✓ **ENHANCED REVENUE DEMO WITH COMMUNITY USE CASES** (July 06, 2025)
✓ Added "Pick Up the Pace in Your Community" and "Delivering Opportunities — Not Just Packages" taglines
✓ Integrated real community stories: musician bookings, parent solutions, shop integration, handyman income
✓ Created launch campaign section highlighting city-by-city rollout with lifetime Pro access
✓ Added inspirational quote: "Big tech platforms have taught us to rely on strangers and algorithms. MarketPlace reminds us what happens when we invest in each other."
✓ Enhanced user interface with gradient cards and professional styling
✓ Demonstrated revenue calculations with actual dollar amounts and community impact
✓ Showcased local business sponsorship system with live sponsor data ($150 from 3 businesses)
✓ Emphasized ethical principles and community-first approach throughout demo

✓ **MAJOR TRANSFORMATION: Facebook-Style Data Collection & Advertising Platform** (July 06, 2025)
✓ Implemented comprehensive behavioral tracking system with 15+ database tables
✓ Created Facebook-style advertising dashboard for businesses with campaign management
✓ Built sophisticated user data analytics with AI-generated insights 
✓ Added device fingerprinting and cross-device user tracking capabilities
✓ Developed interest profiling system based on browsing behavior and purchases
✓ Implemented social connection mapping and relationship strength analysis
✓ Created audience segmentation with lookalike audience generation
✓ Added real-time campaign performance metrics and ROI tracking
✓ Built comprehensive privacy controls and GDPR-compliant data export
✓ Integrated Stripe payment processing for advertising spend management
✓ Created automatic data collection client that tracks all user interactions
✓ Enhanced member sign-up questionnaire system (July 06, 2025)
✓ Added comprehensive onboarding flow with 3 steps
✓ Implemented account type selection (personal vs dual)  
✓ Created business profile setup for dual accounts
✓ Added bio, interests, and contact information collection
✓ Updated database schema with new user profile fields
✓ Built onboarding UI components and navigation flow

✓ **CUSTOM DELIVERY INTEGRATION FOR EXISTING BUSINESSES** (July 06, 2025)
✓ Added "Use Existing Carrier" option in professional dashboard delivery settings
✓ Supports FedEx, UPS, and USPS integration for businesses with existing shipping arrangements
✓ MarketPace maintains 5% commission on all sales regardless of delivery method
✓ Businesses keep their current shipping workflows without disruption
✓ Integrated billing options for automatic shipping cost inclusion in checkout
✓ Created calculateCustomDeliveryFee function to handle all delivery scenarios
✓ Added comprehensive examples demonstrating revenue calculations for each delivery method
✓ Built intuitive UI with carrier selection, account number input, and integration confirmation
✓ Enhanced professional profile with multiple delivery options: MarketPace delivery, customer pickup, existing carrier, custom shipping rates

✓ **IMPROVED CAMPAIGN LANDING PAGE LAYOUT** (July 06, 2025)
✓ Moved "Join the Campaign" section above "Why Join MarketPlace?" for better user flow
✓ Added prominent "Apply to Drive" button with earnings breakdown ($4 pickup + $2 dropoff + $0.50/mile + 100% tips)
✓ Enhanced call-to-action section with orange gradient driver recruitment button
✓ Improved page structure to prioritize immediate action over explanatory content

## Changelog

- July 06, 2025: Implemented enhanced onboarding flow with questionnaire-based member setup
- July 05, 2025: Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.