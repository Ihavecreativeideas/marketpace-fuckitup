# MarketPace App Structure Mapping
## Community-First Marketplace Platform

### 🎯 Core Mission
"Pick Up the Pace in Your Community" - A platform designed to strengthen local economies, support neighbors, and create opportunities within communities rather than relying on external corporations.

### 📱 App Navigation Structure

#### Bottom Navigation (Facebook-Style Sticky Bar)
```
🏠 Home | 🛍 Marketplace | 📍 Community | 🚚 Deliveries | ☰ Menu
```

**Current Status:** ✅ Implemented (needs visual updates)
**Files:** `client/src/navigation/MainNavigator.js`, `client/src/components/FloatingNavigation.tsx`

---

### 🏠 HOME TAB
**Purpose:** Personalized local feed combining marketplace listings and community updates

**Current Implementation:**
- File: `client/src/screens/Home.tsx`
- Status: Basic structure exists, needs community integration

**Required Updates:**
- Local radius-based feed
- Mixed content: listings + community posts
- "Welcome to MarketPace" hero section
- Campaign tracker showing local statistics
- Quick access to categories

---

### 🛍 MARKETPLACE TAB
**Purpose:** Core commerce hub with four main categories

#### Sub-Navigation Tabs:
1. **For Sale** - Traditional marketplace items
2. **For Rent** - "Rent Anything" category (tools, baby gear, equipment)
3. **Services** - Odd jobs and professional services
4. **Events** - Local entertainment and happenings

**Current Implementation:**
- Files: `src/screens/marketplace/`, database schema in `shared/schema.ts`
- Categories system exists but needs expansion

**Required Features:**
- Counter-offer system
- Add to cart functionality
- Facebook-style grid layout
- Location-based filtering
- Enhanced search with radius settings

---

### 📍 COMMUNITY TAB
**Purpose:** Local-only social feed for neighborhood engagement

**Required Features:**
- Status updates and announcements
- Polls for community decisions
- ISO (In Search Of) posts
- "Hiring Now" business postings
- Local event listings
- Livestreaming (Pro feature)

**Current Implementation:**
- File: `server/storage.ts` has community posts structure
- Needs frontend implementation

---

### 🚚 DELIVERIES TAB
**Purpose:** Driver dashboard and delivery tracking for all user types

#### Driver Features:
- Route acceptance (max 2 routes per time block)
- Color-coded delivery tracking
- Earnings tracker ($4 pickup, $2 dropoff, $0.50/mile)
- Performance metrics (flags system)

#### Buyer/Seller Features:
- Order tracking with simplified status updates
- 5-minute confirmation window
- Return handling system

**Current Implementation:**
- Driver application system exists in database
- Needs simplified tracking interface

---

### ☰ MENU TAB
**Purpose:** Profile management and account switching

**Features:**
- Profile management (Personal/Business switching)
- Account settings
- Business account setup wizard
- Pro subscription management
- Early supporter badges
- Logout functionality

**Current Implementation:**
- Files: `client/src/screens/Profile.tsx`, `src/screens/profile/ProfileScreen.js`
- Needs dual profile system integration

---

### 🎭 THE HUB (Entertainment Section)
**Purpose:** Dedicated space within marketplace for local entertainers

**Features:**
- Artist profiles (DJs, comedians, bands, musicians)
- Booking system for events
- Event calendar
- Live streaming capabilities (Pro)
- Review and rating system

**Implementation Status:** Needs to be built as marketplace subcategory

---

### 👥 USER ACCOUNT SYSTEM

#### Account Types:
1. **Personal:** Individual buyers/sellers
2. **Personal + Business:** Enhanced accounts with business features

#### Business Categories:
- 🛒 **Shops:** Non-food retail
- 🛠 **Services:** Labor and professional services  
- 🎭 **Entertainment:** Artists and performers

#### Sign-up Flow:
1. Choose sign-up method (Facebook, Google, Apple, Email, Guest)
2. Email verification
3. Account type selection
4. Personalized questionnaire
5. Profile setup with business category (if applicable)

**Current Status:** Basic auth exists, needs enhancement for dual profiles

---

### 💳 SUBSCRIPTION SYSTEM

#### Membership Tiers:
- **Free:** Basic posting, browsing, MarketPace delivery only
- **Silver ($15/month):** Website integration, self pickup, color tracking
- **Gold ($25/month):** AI analysis, product import, event tools
- **Platinum ($50/month):** Livestreaming, analytics, advertising

**Current Implementation:** Stripe integration exists, needs subscription tiers

---

### 🎨 DESIGN THEME
**Visual Style:** Dark gradient purple with floating particle effects (cosmic, futuristic)
- Bold, clean sans-serif fonts
- Rounded buttons with soft shadows
- Glowing borders on hover
- Facebook-inspired grid layout

**Current Status:** Basic color scheme exists in `src/utils/colors.js`, needs cosmic theme

---

### 🚀 CAMPAIGN LAUNCH FEATURES
**Trial Period Benefits:**
- All features free during launch
- Lifetime Pro benefits for early users
- "Early Supporter" badge
- Featured in special supporters tab
- Campaign tracker on homepage

**Implementation:** Needs frontend campaign components and user flagging system

---

### 📊 ADMIN DASHBOARD FEATURES
**Management Tools:**
- User management (approve drivers, manage accounts)
- Business verification
- Content moderation
- City-by-city analytics
- Campaign tracking
- AI assistant for live coding help

**Current Status:** Basic admin structure exists, needs enhancement

---

### 🔧 TECHNICAL IMPLEMENTATION PRIORITIES

#### Phase 1: Core Navigation & UI Updates
1. Update bottom navigation styling
2. Implement cosmic design theme
3. Create marketplace tab structure
4. Build community feed interface

#### Phase 2: Enhanced Features
1. Dual profile system
2. Counter-offer functionality
3. Enhanced delivery tracking
4. Subscription tier implementation

#### Phase 3: Community Features
1. The Hub entertainment section
2. Live streaming capabilities
3. Advanced analytics
4. Campaign tracking dashboard

#### Phase 4: Polish & Launch
1. Admin dashboard completion
2. Performance optimization
3. Launch campaign features
4. Marketing integration

---

### 📁 KEY FILES TO UPDATE

**Navigation:**
- `client/App.tsx` - Main app structure
- `client/src/components/FloatingNavigation.tsx` - Bottom nav styling
- `src/navigation/MainNavigator.js` - Tab structure

**Screens:**
- `client/src/screens/Home.tsx` - Homepage feed
- `src/screens/marketplace/` - Marketplace tabs
- New: Community screen
- New: The Hub section

**Database:**
- `shared/schema.ts` - Add business types, subscription tiers
- `server/storage.ts` - Community features, dual profiles

**Styling:**
- `src/utils/colors.js` - Cosmic theme colors
- New: Particle effects and animations

This mapping shows how to transform the current codebase into the community-focused vision while maintaining existing functionality and building upon the solid foundation already in place.