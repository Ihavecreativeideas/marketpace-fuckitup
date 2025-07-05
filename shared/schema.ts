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
  userType: varchar("user_type").notNull().default("buyer"), // buyer, seller, driver, admin
  accountType: varchar("account_type").notNull().default("personal"), // personal, business
  businessName: varchar("business_name"),
  phoneNumber: varchar("phone_number"),
  address: text("address"),
  isVerified: boolean("is_verified").default(false),
  driverStatus: varchar("driver_status"), // pending, approved, rejected
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isPro: boolean("is_pro").default(false),
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
  colorCode: varchar("color_code"), // For UI organization
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
  licenseImageUrl: varchar("license_image_url"),
  insuranceImageUrl: varchar("insurance_image_url"),
  backgroundCheckUrl: varchar("background_check_url"),
  vehicleInfo: jsonb("vehicle_info"), // make, model, year, plate
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
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

// Type exports
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
