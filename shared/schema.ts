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

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Type exports for volunteer management
export type Volunteer = typeof volunteers.$inferSelect;
export type InsertVolunteer = typeof volunteers.$inferInsert;
export type VolunteerHours = typeof volunteerHours.$inferSelect;
export type InsertVolunteerHours = typeof volunteerHours.$inferInsert;
export type VolunteerSchedule = typeof volunteerSchedules.$inferSelect;
export type InsertVolunteerSchedule = typeof volunteerSchedules.$inferInsert;
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = typeof businesses.$inferInsert;
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