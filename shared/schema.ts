import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  integer,
  decimal,
  boolean,
  primaryKey,
  real,
  date,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  interests: jsonb("interests"), // Array of interest categories
  userType: varchar("user_type").notNull().default("buyer"), // buyer, seller, driver, admin
  accountType: varchar("account_type").notNull().default("personal"), // personal, dual
  businessName: varchar("business_name"),
  businessType: varchar("business_type"), // shop, service, entertainment
  businessDescription: text("business_description"),
  businessLocation: text("business_location"),
  businessCategories: jsonb("business_categories"), // Array of category IDs
  businessPricing: jsonb("business_pricing"), // Price list for services/products
  allowsDelivery: boolean("allows_delivery").default(true),
  allowsPickup: boolean("allows_pickup").default(true),
  customShipping: boolean("custom_shipping").default(false),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  driverStatus: varchar("driver_status"), // pending, approved, rejected
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isPro: boolean("is_pro").default(false),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories for marketplace items
export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type").notNull(), // shops, services, entertainment
  icon: varchar("icon"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace listings
export const listings = pgTable("listings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  images: jsonb("images"), // Array of image URLs
  condition: varchar("condition"), // new, used, refurbished
  location: varchar("location"),
  isRental: boolean("is_rental").default(false),
  rentalPeriod: varchar("rental_period"), // daily, weekly, monthly
  isActive: boolean("is_active").default(true),
  views: integer("views").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Shopping cart items
export const cartItems = pgTable("cart_items", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  listingId: integer("listing_id").notNull(),
  quantity: integer("quantity").default(1),
  addedAt: timestamp("added_at").defaultNow(),
});

// Orders
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  buyerId: varchar("buyer_id").notNull(),
  sellerId: varchar("seller_id").notNull(),
  driverId: varchar("driver_id"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: decimal("delivery_fee", { precision: 10, scale: 2 }).default('0'),
  status: varchar("status").notNull().default("pending"), // pending, confirmed, in_transit, delivered, cancelled
  deliveryAddress: text("delivery_address"),
  pickupAddress: text("pickup_address"),
  estimatedDelivery: timestamp("estimated_delivery"),
  paymentStatus: varchar("payment_status").default("pending"), // pending, paid, failed, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items
export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id").notNull(),
  listingId: integer("listing_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Delivery routes
export const deliveryRoutes = pgTable("delivery_routes", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  driverId: varchar("driver_id").notNull(),
  status: varchar("status").notNull().default("active"), // active, completed, cancelled
  maxOrders: integer("max_orders").default(6),
  timeSlot: varchar("time_slot").notNull(), // "9am-12pm", "12pm-3pm", "3pm-6pm", "6pm-9pm"
  colorCode: varchar("color_code"), // For UI organization
  routeOptimization: jsonb("route_optimization"), // Optimized stop order
  totalDistance: decimal("total_distance", { precision: 8, scale: 2 }), // in miles
  estimatedDuration: integer("estimated_duration"), // in minutes
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  basePay: decimal("base_pay", { precision: 10, scale: 2 }).default("0.00"),
  mileagePay: decimal("mileage_pay", { precision: 10, scale: 2 }).default("0.00"),
  tips: decimal("tips", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Route orders (junction table)
export const routeOrders = pgTable("route_orders", {
  routeId: integer("route_id").notNull(),
  orderId: integer("order_id").notNull(),
  stopOrder: integer("stop_order").notNull(), // Order of delivery stops
  stopType: varchar("stop_type").notNull(), // pickup, dropoff
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  pk: primaryKey({ columns: [table.routeId, table.orderId] }),
}));

// Driver applications
export const driverApplications = pgTable("driver_applications", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  licenseNumber: varchar("license_number").notNull(),
  licenseExpirationDate: timestamp("license_expiration_date"),
  licenseImageUrl: varchar("license_image_url"),
  insuranceCompany: varchar("insurance_company"),
  insurancePolicyNumber: varchar("insurance_policy_number"),
  insuranceExpirationDate: timestamp("insurance_expiration_date"),
  insuranceImageUrl: varchar("insurance_image_url"),
  backgroundCheckProvider: varchar("background_check_provider"),
  backgroundCheckDate: timestamp("background_check_date"),
  backgroundCheckPassed: boolean("background_check_passed"),
  backgroundCheckUrl: varchar("background_check_url"),
  vehicleInfo: jsonb("vehicle_info"), // make, model, year, plate, color
  bankAccountNumber: varchar("bank_account_number"),
  bankRoutingNumber: varchar("bank_routing_number"),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  rejectionReason: text("rejection_reason"),
  isActive: boolean("is_active").default(false), // driver online/offline status
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("5.00"),
  totalDeliveries: integer("total_deliveries").default(0),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0.00"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Community posts
export const communityPosts = pgTable("community_posts", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  content: text("content"),
  images: jsonb("images"), // Array of image URLs
  postType: varchar("post_type").notNull(), // general, event, announcement, question
  location: varchar("location"),
  likes: integer("likes").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments on community posts
export const comments = pgTable("comments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  postId: integer("post_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Offers and counter-offers
export const offers = pgTable("offers", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  listingId: integer("listing_id").notNull(),
  buyerId: varchar("buyer_id").notNull(),
  sellerId: varchar("seller_id").notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  offerPrice: decimal("offer_price", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  status: varchar("status").notNull().default("pending"), // pending, accepted, rejected, countered
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  listings: many(listings),
  cartItems: many(cartItems),
  buyerOrders: many(orders, { relationName: "buyerOrders" }),
  sellerOrders: many(orders, { relationName: "sellerOrders" }),
  driverOrders: many(orders, { relationName: "driverOrders" }),
  driverApplication: many(driverApplications),
  communityPosts: many(communityPosts),
  comments: many(comments),
  buyerOffers: many(offers, { relationName: "buyerOffers" }),
  sellerOffers: many(offers, { relationName: "sellerOffers" }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  user: one(users, {
    fields: [listings.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [listings.categoryId],
    references: [categories.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  offers: many(offers),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [cartItems.listingId],
    references: [listings.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, {
    fields: [orders.buyerId],
    references: [users.id],
    relationName: "buyerOrders",
  }),
  seller: one(users, {
    fields: [orders.sellerId],
    references: [users.id],
    relationName: "sellerOrders",
  }),
  driver: one(users, {
    fields: [orders.driverId],
    references: [users.id],
    relationName: "driverOrders",
  }),
  orderItems: many(orderItems),
  routeOrders: many(routeOrders),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  listing: one(listings, {
    fields: [orderItems.listingId],
    references: [listings.id],
  }),
}));

export const deliveryRoutesRelations = relations(deliveryRoutes, ({ one, many }) => ({
  driver: one(users, {
    fields: [deliveryRoutes.driverId],
    references: [users.id],
  }),
  routeOrders: many(routeOrders),
}));

export const routeOrdersRelations = relations(routeOrders, ({ one }) => ({
  route: one(deliveryRoutes, {
    fields: [routeOrders.routeId],
    references: [deliveryRoutes.id],
  }),
  order: one(orders, {
    fields: [routeOrders.orderId],
    references: [orders.id],
  }),
}));

export const driverApplicationsRelations = relations(driverApplications, ({ one }) => ({
  user: one(users, {
    fields: [driverApplications.userId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(communityPosts, {
    fields: [comments.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
}));

export const offersRelations = relations(offers, ({ one }) => ({
  listing: one(listings, {
    fields: [offers.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [offers.buyerId],
    references: [users.id],
    relationName: "buyerOffers",
  }),
  seller: one(users, {
    fields: [offers.sellerId],
    references: [users.id],
    relationName: "sellerOffers",
  }),
}));

// Tips tracking
export const driverTips = pgTable("driver_tips", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  orderId: integer("order_id").notNull(),
  driverId: varchar("driver_id").notNull(),
  buyerId: varchar("buyer_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  tipType: varchar("tip_type").notNull(), // "checkout", "post_delivery"
  paymentIntentId: varchar("payment_intent_id"), // Stripe payment intent
  status: varchar("status").default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

// App settings table for admin configuration
export const appSettings = pgTable("app_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  key: varchar("key").unique().notNull(), // setting identifier
  value: text("value").notNull(), // setting value
  type: varchar("type").notNull().default("text"), // text, number, boolean, json
  category: varchar("category").notNull(), // general, pricing, driver, subscription, content
  label: varchar("label").notNull(), // display name for admin panel
  description: text("description"), // help text
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: varchar("updated_by").references(() => users.id),
});

export const appSettingsRelations = relations(appSettings, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [appSettings.updatedBy],
    references: [users.id],
  }),
}));

// ============ DATA COLLECTION & ANALYTICS SYSTEM ============

// User session tracking for detailed analytics
export const userSessions = pgTable("user_sessions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").notNull().unique(),
  deviceType: varchar("device_type"), // mobile, desktop, tablet
  browser: varchar("browser"),
  browserVersion: varchar("browser_version"),
  os: varchar("os"),
  osVersion: varchar("os_version"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  location: jsonb("location"), // { country, state, city, lat, lng, timezone }
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in seconds
  pageViews: integer("page_views").default(0),
  actions: integer("actions").default(0),
  purchases: integer("purchases").default(0),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
});

// Detailed user behavior tracking
export const userBehavior = pgTable("user_behavior", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id").references(() => userSessions.sessionId),
  eventType: varchar("event_type").notNull(), // page_view, click, search, scroll, hover, purchase, etc.
  page: varchar("page"), // marketplace, profile, listing_detail, etc.
  section: varchar("section"), // header, sidebar, feed, product_grid, etc.
  element: varchar("element"), // button_id, link_href, image_alt, etc.
  elementText: text("element_text"), // button text, link text
  elementPosition: jsonb("element_position"), // { x, y, scroll_position }
  duration: integer("duration"), // time spent on element/page in ms
  data: jsonb("data"), // additional event data (form_data, click_coordinates, etc.)
  referrer: text("referrer"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Advanced user interests and preferences
export const userInterests = pgTable("user_interests", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  category: varchar("category").notNull(), // electronics, fashion, automotive, etc.
  subcategory: varchar("subcategory"), // smartphones, dresses, motorcycles, etc.
  score: real("score").default(0), // interest strength 0-1
  source: varchar("source"), // behavior_derived, explicitly_stated, purchase_history, etc.
  lastInteraction: timestamp("last_interaction").defaultNow(),
  interactionCount: integer("interaction_count").default(1),
  totalTimeSpent: integer("total_time_spent").default(0), // seconds
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Social network mapping
export const userConnections = pgTable("user_connections", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  connectedUserId: varchar("connected_user_id").references(() => users.id),
  connectionType: varchar("connection_type"), // friend, following, business_contact, family
  strength: real("strength").default(0), // relationship strength 0-1
  interactions: integer("interactions").default(0),
  sharedInterests: integer("shared_interests").default(0),
  lastInteraction: timestamp("last_interaction"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comprehensive browsing history tracking
export const browsingHistory = pgTable("browsing_history", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  url: text("url"),
  title: text("title"),
  category: varchar("category"), // marketplace, entertainment, news, social, etc.
  subcategory: varchar("subcategory"),
  timeSpent: integer("time_spent"), // seconds
  scrollDepth: real("scroll_depth"), // percentage scrolled
  interactions: integer("interactions"), // clicks, form fills, etc.
  timestamp: timestamp("timestamp").defaultNow(),
});

// Search behavior and intent tracking
export const searchHistory = pgTable("search_history", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  query: text("query"),
  normalizedQuery: text("normalized_query"), // cleaned/stemmed version
  category: varchar("category"),
  intent: varchar("intent"), // purchase, browse, research, compare
  resultsShown: integer("results_shown"),
  resultsClicked: integer("results_clicked"),
  position: integer("position"), // which result was clicked
  timeSpent: integer("time_spent"), // time on search results
  convertedToPurchase: boolean("converted_to_purchase").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Device fingerprinting for cross-device tracking
export const deviceFingerprints = pgTable("device_fingerprints", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  fingerprintHash: varchar("fingerprint_hash").unique(),
  deviceInfo: jsonb("device_info"), // screen resolution, browser plugins, fonts, etc.
  networkInfo: jsonb("network_info"), // connection type, ISP, etc.
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
  sessionsCount: integer("sessions_count").default(1),
  isActive: boolean("is_active").default(true),
});

// Purchase behavior and patterns
export const purchaseHistory = pgTable("purchase_history", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  category: varchar("category"),
  subcategory: varchar("subcategory"),
  brand: varchar("brand"),
  priceRange: varchar("price_range"), // budget, mid_range, premium, luxury
  paymentMethod: varchar("payment_method"),
  seasonality: varchar("seasonality"), // spring, summer, fall, winter
  dayOfWeek: integer("day_of_week"), // 0-6
  hourOfDay: integer("hour_of_day"), // 0-23
  purchaseContext: varchar("purchase_context"), // impulse, planned, gift, necessity
  timestamp: timestamp("timestamp").defaultNow(),
});

// ============ FACEBOOK-STYLE ADVERTISING SYSTEM ============

// Business advertising campaigns
export const adCampaigns = pgTable("ad_campaigns", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  businessId: varchar("business_id").references(() => users.id),
  name: varchar("name").notNull(),
  objective: varchar("objective").notNull(), // awareness, traffic, engagement, conversions, catalog_sales
  type: varchar("type").notNull(), // image, video, carousel, collection, stories
  status: varchar("status").default("draft"), // draft, active, paused, completed, rejected
  dailyBudget: decimal("daily_budget", { precision: 10, scale: 2 }), // daily spend limit
  lifetimeBudget: decimal("lifetime_budget", { precision: 10, scale: 2 }), // total campaign budget
  bidStrategy: varchar("bid_strategy").default("lowest_cost"), // lowest_cost, bid_cap, cost_cap
  bidAmount: decimal("bid_amount", { precision: 10, scale: 2 }),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  targeting: jsonb("targeting"), // comprehensive targeting criteria
  schedule: jsonb("schedule"), // start_date, end_date, day_parting, timezone
  optimization: varchar("optimization").default("conversions"), // what to optimize for
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual ad creatives within campaigns
export const adCreatives = pgTable("ad_creatives", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  campaignId: integer("campaign_id").references(() => adCampaigns.id),
  name: varchar("name").notNull(),
  format: varchar("format").notNull(), // single_image, single_video, carousel, collection
  headline: text("headline"),
  primaryText: text("primary_text"),
  description: text("description"),
  callToAction: varchar("call_to_action"), // learn_more, shop_now, sign_up, contact_us, etc.
  mediaUrls: jsonb("media_urls"), // array of image/video URLs
  linkUrl: text("link_url"),
  displayUrl: varchar("display_url"),
  adAccountId: varchar("ad_account_id"),
  status: varchar("status").default("active"), // active, paused, archived
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ad impressions tracking
export const adImpressions = pgTable("ad_impressions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  campaignId: integer("campaign_id").references(() => adCampaigns.id),
  creativeId: integer("creative_id").references(() => adCreatives.id),
  userId: varchar("user_id").references(() => users.id),
  sessionId: varchar("session_id"),
  placement: varchar("placement"), // feed, story, right_column, audience_network, etc.
  position: integer("position"), // position in feed
  deviceType: varchar("device_type"),
  cost: decimal("cost", { precision: 10, scale: 4 }), // cost per impression
  timestamp: timestamp("timestamp").defaultNow(),
  viewDuration: integer("view_duration"), // milliseconds viewed
  isViewable: boolean("is_viewable").default(true),
});

// Ad clicks and interactions
export const adClicks = pgTable("ad_clicks", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  impressionId: integer("impression_id").references(() => adImpressions.id),
  campaignId: integer("campaign_id").references(() => adCampaigns.id),
  creativeId: integer("creative_id").references(() => adCreatives.id),
  userId: varchar("user_id").references(() => users.id),
  clickType: varchar("click_type"), // link_click, like, share, comment, etc.
  cost: decimal("cost", { precision: 10, scale: 4 }), // cost per click
  timestamp: timestamp("timestamp").defaultNow(),
});

// Conversion tracking
export const adConversions = pgTable("ad_conversions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  campaignId: integer("campaign_id").references(() => adCampaigns.id),
  clickId: integer("click_id").references(() => adClicks.id),
  userId: varchar("user_id").references(() => users.id),
  conversionType: varchar("conversion_type"), // purchase, add_to_cart, view_content, lead, etc.
  value: decimal("value", { precision: 10, scale: 2 }), // conversion value
  currency: varchar("currency").default("USD"),
  conversionWindow: integer("conversion_window"), // days between click and conversion
  attributionModel: varchar("attribution_model").default("last_click"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Custom audience segments for targeting
export const audienceSegments = pgTable("audience_segments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  businessId: varchar("business_id").references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // custom, lookalike, saved, automatic
  source: varchar("source"), // website_visitors, customer_list, app_activity, engagement
  criteria: jsonb("criteria"), // detailed targeting rules
  userCount: integer("user_count").default(0),
  updateFrequency: varchar("update_frequency").default("daily"), // real_time, daily, weekly
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User membership in audience segments
export const userSegmentMembership = pgTable("user_segment_membership", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id),
  segmentId: integer("segment_id").references(() => audienceSegments.id),
  score: real("score").default(1), // how well user matches segment criteria
  lastUpdated: timestamp("last_updated").defaultNow(),
  addedAt: timestamp("added_at").defaultNow(),
});

// Detailed ad performance metrics
export const adPerformanceMetrics = pgTable("ad_performance_metrics", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  campaignId: integer("campaign_id").references(() => adCampaigns.id),
  creativeId: integer("creative_id").references(() => adCreatives.id),
  date: date("date").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  spend: decimal("spend", { precision: 10, scale: 2 }).default("0"),
  revenue: decimal("revenue", { precision: 10, scale: 2 }).default("0"),
  cpm: decimal("cpm", { precision: 10, scale: 4 }).default("0"), // cost per mille
  cpc: decimal("cpc", { precision: 10, scale: 4 }).default("0"), // cost per click
  ctr: decimal("ctr", { precision: 5, scale: 4 }).default("0"), // click through rate
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 4 }).default("0"),
  roas: decimal("roas", { precision: 10, scale: 4 }).default("0"), // return on ad spend
});

// Privacy settings and data consent
export const dataPrivacySettings = pgTable("data_privacy_settings", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id").references(() => users.id).unique(),
  allowDataCollection: boolean("allow_data_collection").default(true),
  allowTargetedAds: boolean("allow_targeted_ads").default(true),
  allowDataSharing: boolean("allow_data_sharing").default(false),
  allowLocationTracking: boolean("allow_location_tracking").default(true),
  allowBehaviorTracking: boolean("allow_behavior_tracking").default(true),
  allowCrossDeviceTracking: boolean("allow_cross_device_tracking").default(true),
  allowThirdPartyData: boolean("allow_third_party_data").default(false),
  dataRetentionPeriod: integer("data_retention_period").default(730), // days (2 years default)
  consentDate: timestamp("consent_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type exports for existing tables
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = typeof listings.$inferInsert;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;
export type DeliveryRoute = typeof deliveryRoutes.$inferSelect;
export type InsertDeliveryRoute = typeof deliveryRoutes.$inferInsert;
export type DriverApplication = typeof driverApplications.$inferSelect;
export type InsertDriverApplication = typeof driverApplications.$inferInsert;
export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = typeof communityPosts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;
export type DriverTip = typeof driverTips.$inferSelect;
export type InsertDriverTip = typeof driverTips.$inferInsert;
export type AppSetting = typeof appSettings.$inferSelect;
export type InsertAppSetting = typeof appSettings.$inferInsert;

// Type exports for data collection & analytics tables
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;
export type UserBehavior = typeof userBehavior.$inferSelect;
export type InsertUserBehavior = typeof userBehavior.$inferInsert;
export type UserInterest = typeof userInterests.$inferSelect;
export type InsertUserInterest = typeof userInterests.$inferInsert;
export type UserConnection = typeof userConnections.$inferSelect;
export type InsertUserConnection = typeof userConnections.$inferInsert;
export type BrowsingHistory = typeof browsingHistory.$inferSelect;
export type InsertBrowsingHistory = typeof browsingHistory.$inferInsert;
export type SearchHistory = typeof searchHistory.$inferSelect;
export type InsertSearchHistory = typeof searchHistory.$inferInsert;
export type DeviceFingerprint = typeof deviceFingerprints.$inferSelect;
export type InsertDeviceFingerprint = typeof deviceFingerprints.$inferInsert;
export type PurchaseHistory = typeof purchaseHistory.$inferSelect;
export type InsertPurchaseHistory = typeof purchaseHistory.$inferInsert;

// Type exports for advertising system tables
export type AdCampaign = typeof adCampaigns.$inferSelect;
export type InsertAdCampaign = typeof adCampaigns.$inferInsert;
export type AdCreative = typeof adCreatives.$inferSelect;
export type InsertAdCreative = typeof adCreatives.$inferInsert;
export type AdImpression = typeof adImpressions.$inferSelect;
export type InsertAdImpression = typeof adImpressions.$inferInsert;
export type AdClick = typeof adClicks.$inferSelect;
export type InsertAdClick = typeof adClicks.$inferInsert;
export type AdConversion = typeof adConversions.$inferSelect;
export type InsertAdConversion = typeof adConversions.$inferInsert;
export type AudienceSegment = typeof audienceSegments.$inferSelect;
export type InsertAudienceSegment = typeof audienceSegments.$inferInsert;
export type UserSegmentMembership = typeof userSegmentMembership.$inferSelect;
export type InsertUserSegmentMembership = typeof userSegmentMembership.$inferInsert;
export type AdPerformanceMetric = typeof adPerformanceMetrics.$inferSelect;
export type InsertAdPerformanceMetric = typeof adPerformanceMetrics.$inferInsert;
export type DataPrivacySetting = typeof dataPrivacySettings.$inferSelect;
export type InsertDataPrivacySetting = typeof dataPrivacySettings.$inferInsert;
