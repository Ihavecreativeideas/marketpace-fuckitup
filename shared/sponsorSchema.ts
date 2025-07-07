import { pgTable, serial, text, integer, timestamp, boolean, jsonb, decimal } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Sponsor tiers and payments
export const sponsors = pgTable('sponsors', {
  id: serial('id').primaryKey(),
  businessName: text('business_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  businessAddress: text('business_address'),
  website: text('website'),
  logoUrl: text('logo_url'),
  tier: text('tier').notNull(), // supporter, starter, community, ambassador, legacy
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  status: text('status').default('active'), // active, paused, cancelled
  joinedAt: timestamp('joined_at').defaultNow(),
  nextBillingDate: timestamp('next_billing_date'),
  totalPaid: decimal('total_paid', { precision: 10, scale: 2 }).default('0'),
  businessDescription: text('business_description'),
  socialMedia: jsonb('social_media'), // {facebook, instagram, twitter, etc}
  specialRequests: text('special_requests'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Sponsor benefits tracking
export const sponsorBenefits = pgTable('sponsor_benefits', {
  id: serial('id').primaryKey(),
  sponsorId: integer('sponsor_id').references(() => sponsors.id),
  benefitType: text('benefit_type').notNull(), // video_shoutout, social_mention, business_cards, etc
  benefitName: text('benefit_name').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  completedAt: timestamp('completed_at'),
  completedBy: text('completed_by'),
  notes: text('notes'),
  isRecurring: boolean('is_recurring').default(false),
  recurringInterval: text('recurring_interval'), // monthly, quarterly, etc
  priority: integer('priority').default(1), // 1=high, 2=medium, 3=low
  createdAt: timestamp('created_at').defaultNow()
});

// Route sponsorships
export const routeSponsorships = pgTable('route_sponsorships', {
  id: serial('id').primaryKey(),
  sponsorId: integer('sponsor_id').references(() => sponsors.id),
  routeDate: timestamp('route_date').notNull(),
  routeType: text('route_type').default('standard'), // standard, market_blitz
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('scheduled'), // scheduled, completed, cancelled
  driverPaid: boolean('driver_paid').default(false),
  sponsorshipMessage: text('sponsorship_message'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow()
});

// Monthly spotlight calendar
export const spotlightCalendar = pgTable('spotlight_calendar', {
  id: serial('id').primaryKey(),
  sponsorId: integer('sponsor_id').references(() => sponsors.id),
  month: integer('month').notNull(), // 1-12
  year: integer('year').notNull(),
  spotlightType: text('spotlight_type').notNull(), // pace_partner_month, featured_banner, social_promotion
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow()
});

// Sponsor communications log
export const sponsorCommunications = pgTable('sponsor_communications', {
  id: serial('id').primaryKey(),
  sponsorId: integer('sponsor_id').references(() => sponsors.id),
  communicationType: text('communication_type').notNull(), // email, call, meeting, social_post
  subject: text('subject'),
  content: text('content'),
  sentAt: timestamp('sent_at').defaultNow(),
  sentBy: text('sent_by'),
  response: text('response'),
  followUpRequired: boolean('follow_up_required').default(false),
  followUpDate: timestamp('follow_up_date'),
  attachments: jsonb('attachments') // file urls
});

// AI assistant tasks and reminders
export const aiAssistantTasks = pgTable('ai_assistant_tasks', {
  id: serial('id').primaryKey(),
  taskType: text('task_type').notNull(), // reminder, calendar_event, benefit_check, follow_up
  title: text('title').notNull(),
  description: text('description'),
  sponsorId: integer('sponsor_id').references(() => sponsors.id),
  dueDate: timestamp('due_date'),
  priority: integer('priority').default(2),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at'),
  aiSuggestion: text('ai_suggestion'),
  createdAt: timestamp('created_at').defaultNow()
});

// Relations
export const sponsorsRelations = relations(sponsors, ({ many }) => ({
  benefits: many(sponsorBenefits),
  routeSponsorships: many(routeSponsorships),
  spotlights: many(spotlightCalendar),
  communications: many(sponsorCommunications),
  aiTasks: many(aiAssistantTasks)
}));

export const sponsorBenefitsRelations = relations(sponsorBenefits, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [sponsorBenefits.sponsorId],
    references: [sponsors.id]
  })
}));

export const routeSponsorshipsRelations = relations(routeSponsorships, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [routeSponsorships.sponsorId],
    references: [sponsors.id]
  })
}));

export const spotlightCalendarRelations = relations(spotlightCalendar, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [spotlightCalendar.sponsorId],
    references: [sponsors.id]
  })
}));

export const sponsorCommunicationsRelations = relations(sponsorCommunications, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [sponsorCommunications.sponsorId],
    references: [sponsors.id]
  })
}));

export const aiAssistantTasksRelations = relations(aiAssistantTasks, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [aiAssistantTasks.sponsorId],
    references: [sponsors.id]
  })
}));

export type Sponsor = typeof sponsors.$inferSelect;
export type InsertSponsor = typeof sponsors.$inferInsert;
export type SponsorBenefit = typeof sponsorBenefits.$inferSelect;
export type InsertSponsorBenefit = typeof sponsorBenefits.$inferInsert;
export type RouteSponsorShip = typeof routeSponsorships.$inferSelect;
export type InsertRouteSponsorShip = typeof routeSponsorships.$inferInsert;
export type SpotlightCalendar = typeof spotlightCalendar.$inferSelect;
export type InsertSpotlightCalendar = typeof spotlightCalendar.$inferInsert;
export type SponsorCommunication = typeof sponsorCommunications.$inferSelect;
export type InsertSponsorCommunication = typeof sponsorCommunications.$inferInsert;
export type AIAssistantTask = typeof aiAssistantTasks.$inferSelect;
export type InsertAIAssistantTask = typeof aiAssistantTasks.$inferInsert;