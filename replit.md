# MarketPace - Marketplace Delivery Service

## Overview

MarketPace is a React Native mobile application that combines marketplace functionality with on-demand delivery services, similar to "Facebook Marketplace meets Uber Eats." The application serves multiple user types including buyers, sellers, drivers, and administrators, providing a comprehensive platform for local commerce with integrated delivery services.

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

## Key Components

### User Management
- Multi-role user system supporting buyers, sellers, drivers, and administrators
- Profile management with business account options
- Driver application system with document verification requirements
- Admin dashboard for user management and analytics

### Marketplace Features
- Category-based listing system (shops, services, entertainment)
- Item condition tracking and rental capabilities
- Shopping cart functionality with quantity management
- Advanced search and filtering capabilities
- Image upload and management for listings

### Delivery System
- Driver route optimization and management
- Real-time delivery tracking
- Independent contractor model for drivers
- Route assignment and completion tracking
- Delivery fee calculation and driver compensation

### Payment Processing
- Stripe integration for secure payment processing
- Multiple payment methods (cards, PayPal, Apple Pay, Google Pay)
- Subscription management for premium features
- Driver payout system after delivery completion

### Community Features
- Community posts and announcements
- Comment system for user engagement
- Event listing and management
- User-generated content moderation

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

## Changelog

- July 05, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.