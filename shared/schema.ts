import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  // MarketPace Pro features
  isPro: boolean("is_pro").default(false),
  businessName: varchar("business_name"),
  businessType: varchar("business_type"), // shop, service, entertainment, restaurant
  businessDescription: text("business_description"),
  businessAddress: text("business_address"),
  businessPhone: varchar("business_phone"),
  businessWebsite: varchar("business_website"),
  // Social Media Integration
  facebookPageUrl: varchar("facebook_page_url"),
  instagramUrl: varchar("instagram_url"),
  twitterUrl: varchar("twitter_url"),
  tiktokUrl: varchar("tiktok_url"),
  youtubeUrl: varchar("youtube_url"),
  linkedinUrl: varchar("linkedin_url"),
  socialMediaSettings: jsonb("social_media_settings"), // auto-response settings, cross-posting preferences
});

// Business profiles for Pro members
export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // shop, service, entertainment, restaurant, venue
  description: text("description"),
  address: text("address"),
  phone: varchar("phone"),
  website: varchar("website"),
  settings: jsonb("settings"), // business-specific settings
  // Social Media Integration
  facebookPageUrl: varchar("facebook_page_url"),
  facebookPageId: varchar("facebook_page_id"), // for API integration
  instagramUrl: varchar("instagram_url"),
  twitterUrl: varchar("twitter_url"),
  tiktokUrl: varchar("tiktok_url"),
  youtubeUrl: varchar("youtube_url"),
  linkedinUrl: varchar("linkedin_url"),
  socialMediaSettings: jsonb("social_media_settings"), // auto-response settings, cross-posting preferences
  facebookAutoResponseEnabled: boolean("facebook_auto_response_enabled").default(true),
  deliveryAvailable: boolean("delivery_available").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Employee invitations and management
export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id), // null if not yet accepted
  email: varchar("email").notNull(), // for invitation
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  role: varchar("role").default("employee"), // employee, manager, musician, chef, etc.
  status: varchar("status").default("pending"), // pending, active, inactive
  permissions: jsonb("permissions"), // custom permissions per employee
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Work schedules
export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id").notNull().references(() => employees.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(), // "Dinner Service", "Live Music", "Morning Shift"
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: varchar("status").default("scheduled"), // scheduled, confirmed, declined, cancelled, filled
  isUrgent: boolean("is_urgent").default(false),
  requiresConfirmation: boolean("requires_confirmation").default(true),
  confirmedAt: timestamp("confirmed_at"),
  declinedAt: timestamp("declined_at"),
  cancelledAt: timestamp("cancelled_at"),
  filledBy: uuid("filled_by").references(() => employees.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Fill-in requests for urgent needs
export const fillInRequests = pgTable("fill_in_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  originalScheduleId: uuid("original_schedule_id").references(() => schedules.id),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  urgencyLevel: varchar("urgency_level").default("normal"), // low, normal, high, critical
  status: varchar("status").default("open"), // open, claimed, filled, expired
  claimedBy: uuid("claimed_by").references(() => employees.id),
  claimedAt: timestamp("claimed_at"),
  filledAt: timestamp("filled_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business announcements
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  content: text("content").notNull(),
  type: varchar("type").default("general"), // general, urgent, policy, event
  targetAudience: varchar("target_audience").default("all"), // all, employees, managers
  isPublic: boolean("is_public").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Volunteers for nonprofit organizations
export const volunteers = pgTable("volunteers", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: varchar("user_id").references(() => users.id), // null if not yet a MarketPace user
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone"),
  role: varchar("role").notNull(), // food-pantry, event-setup, community-outreach, etc.
  availability: text("availability"),
  skills: text("skills"),
  emergencyContact: text("emergency_contact"),
  status: varchar("status").default("active"), // active, inactive, on-leave
  totalHours: integer("total_hours").default(0),
  joinedAt: timestamp("joined_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Provider Calendars for Pro booking features
export const serviceCalendars = pgTable("service_calendars", {
  id: uuid("id").primaryKey().defaultRandom(),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  serviceType: varchar("service_type").notNull(), // entertainment, photography, tutoring, etc.
  hourlyRate: integer("hourly_rate").notNull(), // rate in cents
  minDuration: integer("min_duration").default(1), // minimum hours
  bookingFee: integer("booking_fee").default(0), // optional booking fee in cents
  hasBookingFee: boolean("has_booking_fee").default(false),
  escrowEnabled: boolean("escrow_enabled").default(true),
  availability: jsonb("availability"), // JSON object with dates and time slots
  settings: jsonb("settings"), // additional provider settings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customer Bookings with Escrow Support
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  calendarId: uuid("calendar_id").notNull().references(() => serviceCalendars.id),
  bookingDate: timestamp("booking_date").notNull(),
  startTime: varchar("start_time").notNull(), // e.g., "7:00 PM"
  duration: integer("duration").notNull(), // hours
  serviceCost: integer("service_cost").notNull(), // in cents
  bookingFee: integer("booking_fee").default(0), // in cents
  platformFee: integer("platform_fee").notNull(), // 5% platform fee in cents
  totalAmount: integer("total_amount").notNull(), // total charged to customer
  status: varchar("status").default("pending_payment"), // pending_payment, paid, confirmed, completed, cancelled, disputed
  escrowStatus: varchar("escrow_status").default("holding"), // holding, released, refunded
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  customerNotes: text("customer_notes"),
  providerNotes: text("provider_notes"),
  showUpConfirmed: boolean("show_up_confirmed").default(false),
  showUpConfirmedAt: timestamp("show_up_confirmed_at"),
  paymentReleasedAt: timestamp("payment_released_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Escrow Transactions for secure payments
export const escrowTransactions = pgTable("escrow_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // amount held in escrow (cents)
  platformFee: integer("platform_fee").notNull(), // MarketPace's 5% fee (cents)
  status: varchar("status").default("holding"), // holding, released, refunded, disputed
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeTransferId: varchar("stripe_transfer_id"), // when released to provider
  releasedAt: timestamp("released_at"),
  refundedAt: timestamp("refunded_at"),
  disputeReason: text("dispute_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Reviews and Ratings for service quality tracking
export const serviceReviews = pgTable("service_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  bookingId: uuid("booking_id").notNull().references(() => bookings.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text"),
  showUpRating: integer("show_up_rating").notNull(), // separate rating for showing up
  qualityRating: integer("quality_rating").notNull(), // separate rating for service quality
  wouldRecommend: boolean("would_recommend").default(true),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Volunteer hour logs
export const volunteerHours = pgTable("volunteer_hours", {
  id: uuid("id").primaryKey().defaultRandom(),
  volunteerId: uuid("volunteer_id").notNull().references(() => volunteers.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  totalHours: integer("total_hours").notNull(), // hours * 100 for precision (e.g., 4.5 hours = 450)
  task: varchar("task").notNull(),
  description: text("description"),
  supervisor: varchar("supervisor"),
  verified: boolean("verified").default(false),
  verifiedBy: varchar("verified_by"),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Volunteer schedules
export const volunteerSchedules = pgTable("volunteer_schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  volunteerId: uuid("volunteer_id").notNull().references(() => volunteers.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  title: varchar("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  task: varchar("task").notNull(),
  priority: varchar("priority").default("normal"), // normal, high, urgent
  status: varchar("status").default("scheduled"), // scheduled, confirmed, completed, cancelled
  notificationSent: boolean("notification_sent").default(false),
  confirmedAt: timestamp("confirmed_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Notifications for employees
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").references(() => businesses.id),
  type: varchar("type").notNull(), // schedule_reminder, fill_in_request, announcement, schedule_change
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data"), // additional data for the notification
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Discount codes table
export const discountCodes = pgTable("discount_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // percentage, fixed_amount, free_shipping
  value: integer("value").notNull(), // percentage (1-100) or amount in cents
  minimumPurchase: integer("minimum_purchase").default(0), // minimum purchase in cents
  maximumDiscount: integer("maximum_discount"), // maximum discount in cents (for percentage)
  usageLimit: integer("usage_limit"), // null for unlimited
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  applicableCategories: jsonb("applicable_categories"), // array of category types
  applicableBusinessTypes: jsonb("applicable_business_types"), // array of business types
  excludeCategories: jsonb("exclude_categories"), // array of excluded categories
  createdBy: varchar("created_by").notNull().references(() => users.id),
  businessId: uuid("business_id").references(() => businesses.id), // null for global admin codes
  scope: varchar("scope").default("business"), // 'global' for admin, 'business' for Pro members
  specificProducts: jsonb("specific_products"), // array of specific product/service IDs
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discount code usage tracking
export const discountCodeUsage = pgTable("discount_code_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  codeId: uuid("code_id").notNull().references(() => discountCodes.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id"), // stripe payment intent id or order reference
  discountAmount: integer("discount_amount").notNull(), // actual discount applied in cents
  originalAmount: integer("original_amount").notNull(), // original order amount in cents
  finalAmount: integer("final_amount").notNull(), // final amount after discount
  usedAt: timestamp("used_at").defaultNow(),
});

// Relations
export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  employees: many(employees),
  schedules: many(schedules),
  fillInRequests: many(fillInRequests),
  announcements: many(announcements),
  discountCodes: many(discountCodes),
}));

export const employeesRelations = relations(employees, ({ one, many }) => ({
  business: one(businesses, {
    fields: [employees.businessId],
    references: [businesses.id],
  }),
  user: one(users, {
    fields: [employees.userId],
    references: [users.id],
  }),
  schedules: many(schedules),
}));

export const schedulesRelations = relations(schedules, ({ one }) => ({
  business: one(businesses, {
    fields: [schedules.businessId],
    references: [businesses.id],
  }),
  employee: one(employees, {
    fields: [schedules.employeeId],
    references: [employees.id],
  }),
  filledByEmployee: one(employees, {
    fields: [schedules.filledBy],
    references: [employees.id],
  }),
}));

export const fillInRequestsRelations = relations(fillInRequests, ({ one }) => ({
  business: one(businesses, {
    fields: [fillInRequests.businessId],
    references: [businesses.id],
  }),
  originalSchedule: one(schedules, {
    fields: [fillInRequests.originalScheduleId],
    references: [schedules.id],
  }),
  claimedByEmployee: one(employees, {
    fields: [fillInRequests.claimedBy],
    references: [employees.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  business: one(businesses, {
    fields: [announcements.businessId],
    references: [businesses.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [notifications.businessId],
    references: [businesses.id],
  }),
}));

export const discountCodesRelations = relations(discountCodes, ({ one, many }) => ({
  creator: one(users, {
    fields: [discountCodes.createdBy],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [discountCodes.businessId],
    references: [businesses.id],
  }),
  usage: many(discountCodeUsage),
}));

export const discountCodeUsageRelations = relations(discountCodeUsage, ({ one }) => ({
  code: one(discountCodes, {
    fields: [discountCodeUsage.codeId],
    references: [discountCodes.id],
  }),
  user: one(users, {
    fields: [discountCodeUsage.userId],
    references: [users.id],
  }),
}));

// Type exports
// Facebook Marketplace Integration
export const facebookMarketplacePosts = pgTable("facebook_marketplace_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  marketplacePostId: varchar("marketplace_post_id").notNull(), // MarketPace internal post ID
  facebookPostId: varchar("facebook_post_id"), // Facebook Marketplace post ID
  title: varchar("title").notNull(),
  description: text("description"),
  price: varchar("price"),
  category: varchar("category"),
  deliveryAvailable: boolean("delivery_available").default(true),
  autoResponseEnabled: boolean("auto_response_enabled").default(true),
  crossPostingEnabled: boolean("cross_posting_enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Facebook Auto-Response Log
export const facebookAutoResponses = pgTable("facebook_auto_responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  facebookPostId: varchar("facebook_post_id").notNull(),
  senderName: varchar("sender_name"),
  messageReceived: text("message_received"),
  responseMessage: text("response_message"),
  responseType: varchar("response_type"), // 'delivery_available', 'pickup_only', 'cross_sell'
  sentAt: timestamp("sent_at").defaultNow(),
});



export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;
export type FacebookMarketplacePost = typeof facebookMarketplacePosts.$inferSelect;

// Type exports for volunteer management
export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = typeof volunteers.$inferInsert;
export type VolunteerHours = typeof volunteerHours.$inferSelect;
export type InsertVolunteerHours = typeof volunteerHours.$inferInsert;
export type VolunteerSchedule = typeof volunteerSchedules.$inferSelect;
export type InsertVolunteerSchedule = typeof volunteerSchedules.$inferInsert;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = typeof employees.$inferInsert;
export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = typeof schedules.$inferInsert;
export type FillInRequest = typeof fillInRequests.$inferSelect;
export type InsertFillInRequest = typeof fillInRequests.$inferInsert;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = typeof announcements.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = typeof discountCodes.$inferInsert;
export type DiscountCodeUsage = typeof discountCodeUsage.$inferSelect;
export type InsertDiscountCodeUsage = typeof discountCodeUsage.$inferInsert;