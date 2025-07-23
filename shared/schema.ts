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
  real,
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
  phoneNumber: varchar("phone_number"),
  passwordHash: varchar("password_hash"),
  isVerified: boolean("is_verified").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(true),
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

// Tips and payments table
export const tips = pgTable("tips", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromUserId: varchar("from_user_id").references(() => users.id), // who gave the tip
  toUserId: varchar("to_user_id").references(() => users.id), // who received the tip (business owner or employee)
  businessId: uuid("business_id").references(() => businesses.id), // which business the tip is for
  employeeId: uuid("employee_id").references(() => employees.id), // specific employee if applicable
  amount: integer("amount").notNull(), // amount in cents
  message: text("message"), // optional tip message
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeTransferId: varchar("stripe_transfer_id"), // for paying out to recipient
  status: varchar("status").default("pending"), // pending, completed, failed, refunded
  paidOut: boolean("paid_out").default(false), // whether the recipient has been paid
  paidOutAt: timestamp("paid_out_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Pro member payment settings
export const proMemberPayments = pgTable("pro_member_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessId: uuid("business_id").references(() => businesses.id),
  stripeAccountId: varchar("stripe_account_id"), // Stripe Connect account for receiving payments
  stripeOnboardingComplete: boolean("stripe_onboarding_complete").default(false),
  tipsEnabled: boolean("tips_enabled").default(false),
  defaultTipAmounts: jsonb("default_tip_amounts"), // [5, 10, 20, 50] or custom amounts
  tipButtonText: varchar("tip_button_text").default("Tip Us!"),
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

// Posts and listings for the marketplace and community
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  businessId: uuid("business_id").references(() => businesses.id), // null for personal posts
  category: varchar("category").notNull(), // rent, sale, service, event, poll, announcement, job, iso
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  price: integer("price"), // in cents
  rentalRate: varchar("rental_rate"), // daily, hourly, weekly, monthly
  images: jsonb("images"), // array of image URLs
  location: text("location"),
  // Event-specific fields
  eventDate: timestamp("event_date"),
  eventTime: varchar("event_time"),
  eventLocation: text("event_location"),
  eventQrCode: text("event_qr_code"), // Generated QR code for check-ins
  // Poll-specific fields
  pollOptions: jsonb("poll_options"), // array of poll options
  pollResults: jsonb("poll_results"), // voting results
  // Rental-specific fields
  availableFrom: timestamp("available_from"),
  availableTo: timestamp("available_to"),
  // Delivery and action buttons
  deliveryOptions: jsonb("delivery_options"), // delivery methods available
  actionButtons: jsonb("action_buttons"), // rent now, book now, etc.
  status: varchar("status").default("active"), // active, sold, expired, draft
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  isPromoted: boolean("is_promoted").default(false),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events for calendar and check-in system
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  businessId: uuid("business_id").references(() => businesses.id),
  title: varchar("title").notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  eventTime: varchar("event_time").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  qrCode: text("qr_code"), // Geo QR code for check-ins
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  checkInRadius: integer("check_in_radius").default(100), // meters
  isPublic: boolean("is_public").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  status: varchar("status").default("upcoming"), // upcoming, ongoing, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Member check-ins to events for MyPace social feed
export const eventCheckIns = pgTable("event_check_ins", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  checkedInAt: timestamp("checked_in_at").defaultNow(),
  location: text("location"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  distanceFromEvent: integer("distance_from_event"), // meters
  verificationMethod: varchar("verification_method").default("qr"), // qr, location, manual
  isVerified: boolean("is_verified").default(true),
  photos: jsonb("photos"), // photos uploaded during check-in
  message: text("message"), // optional check-in message
  createdAt: timestamp("created_at").defaultNow(),
});

// Poll votes
export const pollVotes = pgTable("poll_votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id),
  optionIndex: integer("option_index").notNull(), // index of the chosen option
  optionText: varchar("option_text").notNull(),
  votedAt: timestamp("voted_at").defaultNow(),
});

// Social feed posts for MyPace
export const socialPosts = pgTable("social_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  authorId: varchar("author_id").notNull().references(() => users.id),
  eventCheckInId: uuid("event_check_in_id").references(() => eventCheckIns.id), // if related to event check-in
  postType: varchar("post_type").notNull(), // check_in, status, photo, video
  content: text("content"), // text content
  media: jsonb("media"), // photos/videos
  location: text("location"),
  eventId: uuid("event_id").references(() => events.id), // if related to an event
  isVerified: boolean("is_verified").default(false), // for verified check-ins
  privacy: varchar("privacy").default("public"), // public, friends, private
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  shares: integer("shares").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Comments on social posts
export const socialComments = pgTable("social_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => socialPosts.id, { onDelete: "cascade" }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentCommentId: uuid("parent_comment_id").references(() => socialComments.id), // for replies
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Likes on social posts and comments
export const socialLikes = pgTable("social_likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  postId: uuid("post_id").references(() => socialPosts.id, { onDelete: "cascade" }),
  commentId: uuid("comment_id").references(() => socialComments.id, { onDelete: "cascade" }),
  likedAt: timestamp("liked_at").defaultNow(),
});

// QR codes for check-ins and job portals
export const qrCodes = pgTable("qr_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => events.id, { onDelete: "cascade" }),
  businessId: uuid("business_id").references(() => businesses.id, { onDelete: "cascade" }),
  codeType: varchar("code_type").notNull(), // event_checkin, job_portal, member_portal
  code: varchar("code").notNull().unique(), // the QR code string
  location: text("location"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  radius: integer("radius").default(100), // check-in radius in meters
  isActive: boolean("is_active").default(true),
  usageCount: integer("usage_count").default(0),
  maxUsages: integer("max_usages"), // null for unlimited
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Member portal attendance tracking
export const memberPortalAttendance = pgTable("member_portal_attendance", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull().references(() => users.id),
  qrCodeId: uuid("qr_code_id").notNull().references(() => qrCodes.id),
  eventId: uuid("event_id").references(() => events.id),
  businessId: uuid("business_id").references(() => businesses.id),
  checkedInAt: timestamp("checked_in_at").defaultNow(),
  location: text("location"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  distance: integer("distance"), // distance from QR code location in meters
  verificationStatus: varchar("verification_status").default("verified"), // verified, warning, failed
  createdAt: timestamp("created_at").defaultNow(),
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

// New Relations for MyPace features
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [posts.businessId],
    references: [businesses.id],
  }),
  event: one(events, {
    fields: [posts.id],
    references: [events.postId],
  }),
  pollVotes: many(pollVotes),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  post: one(posts, {
    fields: [events.postId],
    references: [posts.id],
  }),
  organizer: one(users, {
    fields: [events.organizerId],
    references: [users.id],
  }),
  business: one(businesses, {
    fields: [events.businessId],
    references: [businesses.id],
  }),
  checkIns: many(eventCheckIns),
  qrCodes: many(qrCodes),
  socialPosts: many(socialPosts),
}));

export const eventCheckInsRelations = relations(eventCheckIns, ({ one, many }) => ({
  event: one(events, {
    fields: [eventCheckIns.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventCheckIns.userId],
    references: [users.id],
  }),
  socialPosts: many(socialPosts),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  post: one(posts, {
    fields: [pollVotes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [pollVotes.userId],
    references: [users.id],
  }),
}));

export const socialPostsRelations = relations(socialPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [socialPosts.authorId],
    references: [users.id],
  }),
  eventCheckIn: one(eventCheckIns, {
    fields: [socialPosts.eventCheckInId],
    references: [eventCheckIns.id],
  }),
  event: one(events, {
    fields: [socialPosts.eventId],
    references: [events.id],
  }),
  comments: many(socialComments),
  likes: many(socialLikes),
}));

export const socialCommentsRelations = relations(socialComments, ({ one, many }) => ({
  post: one(socialPosts, {
    fields: [socialComments.postId],
    references: [socialPosts.id],
  }),
  author: one(users, {
    fields: [socialComments.authorId],
    references: [users.id],
  }),
  parentComment: one(socialComments, {
    fields: [socialComments.parentCommentId],
    references: [socialComments.id],
  }),
  replies: many(socialComments),
  likes: many(socialLikes),
}));

export const socialLikesRelations = relations(socialLikes, ({ one }) => ({
  user: one(users, {
    fields: [socialLikes.userId],
    references: [users.id],
  }),
  post: one(socialPosts, {
    fields: [socialLikes.postId],
    references: [socialPosts.id],
  }),
  comment: one(socialComments, {
    fields: [socialLikes.commentId],
    references: [socialComments.id],
  }),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  event: one(events, {
    fields: [qrCodes.eventId],
    references: [events.id],
  }),
  business: one(businesses, {
    fields: [qrCodes.businessId],
    references: [businesses.id],
  }),
  attendance: many(memberPortalAttendance),
}));

export const memberPortalAttendanceRelations = relations(memberPortalAttendance, ({ one }) => ({
  user: one(users, {
    fields: [memberPortalAttendance.userId],
    references: [users.id],
  }),
  qrCode: one(qrCodes, {
    fields: [memberPortalAttendance.qrCodeId],
    references: [qrCodes.id],
  }),
  event: one(events, {
    fields: [memberPortalAttendance.eventId],
    references: [events.id],
  }),
  business: one(businesses, {
    fields: [memberPortalAttendance.businessId],
    references: [businesses.id],
  }),
}));

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;
export type Post = typeof posts.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEventCheckIn = typeof eventCheckIns.$inferInsert;
export type EventCheckIn = typeof eventCheckIns.$inferSelect;
export type InsertPollVote = typeof pollVotes.$inferInsert;
export type PollVote = typeof pollVotes.$inferSelect;
export type InsertSocialPost = typeof socialPosts.$inferInsert;
export type SocialPost = typeof socialPosts.$inferSelect;
export type InsertSocialComment = typeof socialComments.$inferInsert;
export type SocialComment = typeof socialComments.$inferSelect;
export type InsertQrCode = typeof qrCodes.$inferInsert;
export type QrCode = typeof qrCodes.$inferSelect;
export type InsertMemberPortalAttendance = typeof memberPortalAttendance.$inferInsert;
export type MemberPortalAttendance = typeof memberPortalAttendance.$inferSelect;

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



// QR Scans table - logs every scan event
export const qrScans = pgTable("qr_scans", {
  id: uuid("id").primaryKey().defaultRandom(),
  qrCodeId: uuid("qr_code_id").notNull().references(() => qrCodes.id),
  scannedBy: varchar("scanned_by").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow(),
  geoLat: real("geo_lat"), // scanner's latitude
  geoLng: real("geo_lng"), // scanner's longitude
  geoValidationPassed: boolean("geo_validation_passed"), // null if no geo validation
  geoDistanceMeters: real("geo_distance_meters"), // distance from target location
});

// Rentals table - tracks rental transactions with escrow
export const rentals = pgTable("rentals", {
  id: uuid("id").primaryKey().defaultRandom(),
  renterId: varchar("renter_id").notNull().references(() => users.id),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  itemId: uuid("item_id").notNull(), // rental item reference
  deliveryType: varchar("delivery_type").notNull(), // "self_pickup" or "driver"
  status: varchar("status").notNull().default("pending"), // pending, picked_up, returned, complete, issue_reported
  escrowStatus: varchar("escrow_status").notNull().default("held"), // held, released, refunded, under_review
  paidAmount: real("paid_amount").notNull(),
  escrowId: varchar("escrow_id"), // link to escrow/payment system
  pickupConfirmedAt: timestamp("pickup_confirmed_at"),
  returnConfirmedAt: timestamp("return_confirmed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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
export type QRCode = typeof qrCodes.$inferSelect;
export type InsertQRCode = typeof qrCodes.$inferInsert;
export type QRScan = typeof qrScans.$inferSelect;
export type InsertQRScan = typeof qrScans.$inferInsert;
export type Rental = typeof rentals.$inferSelect;
export type InsertRental = typeof rentals.$inferInsert;