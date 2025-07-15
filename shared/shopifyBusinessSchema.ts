import { pgTable, text, integer, decimal, boolean, timestamp, uuid } from 'drizzle-orm/pg-core';

// Business integration settings table
export const businessIntegrations = pgTable('business_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessId: text('business_id').notNull(),
  userId: text('user_id').notNull(),
  platform: text('platform').notNull(), // 'shopify', 'etsy', etc.
  shopDomain: text('shop_domain').notNull(),
  accessToken: text('access_token').notNull(),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 }).default('0.00'),
  processingFee: decimal('processing_fee', { precision: 5, scale: 2 }).default('0.00'), // Percentage
  enableLocalDelivery: boolean('enable_local_delivery').default(true),
  allowRedirectToStore: boolean('allow_redirect_to_store').default(false),
  autoSync: boolean('auto_sync').default(false),
  deliveryRadius: integer('delivery_radius').default(10),
  deliveryDays: text('delivery_days').array().default(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']),
  lastSyncAt: timestamp('last_sync_at'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Synced products table
export const syncedProducts = pgTable('synced_products', {
  id: uuid('id').primaryKey().defaultRandom(),
  businessIntegrationId: uuid('business_integration_id').references(() => businessIntegrations.id),
  externalProductId: text('external_product_id').notNull(), // Shopify product ID
  marketpaceProductId: text('marketpace_product_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  originalPrice: decimal('original_price', { precision: 10, scale: 2 }).notNull(),
  finalPrice: decimal('final_price', { precision: 10, scale: 2 }).notNull(),
  shippingFee: decimal('shipping_fee', { precision: 10, scale: 2 }).default('0.00'),
  processingFee: decimal('processing_fee', { precision: 10, scale: 2 }).default('0.00'),
  images: text('images').array().default([]),
  externalUrl: text('external_url'), // Link back to original store
  sku: text('sku'),
  inventoryQuantity: integer('inventory_quantity').default(0),
  tags: text('tags').array().default([]),
  category: text('category'),
  isActive: boolean('is_active').default(true),
  enableLocalDelivery: boolean('enable_local_delivery').default(true),
  deliveryRadius: integer('delivery_radius').default(10),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Product promotions table
export const productPromotions = pgTable('product_promotions', {
  id: uuid('id').primaryKey().defaultRandom(),
  syncedProductId: uuid('synced_product_id').references(() => syncedProducts.id),
  promotionType: text('promotion_type').notNull(), // 'facebook', 'local', 'featured'
  budget: decimal('budget', { precision: 10, scale: 2 }).notNull(),
  spent: decimal('spent', { precision: 10, scale: 2 }).default('0.00'),
  targetAudience: text('target_audience'),
  estimatedReach: integer('estimated_reach'),
  actualReach: integer('actual_reach'),
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  status: text('status').default('active'), // 'active', 'paused', 'completed'
  startDate: timestamp('start_date').defaultNow(),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Social media shares table
export const productShares = pgTable('product_shares', {
  id: uuid('id').primaryKey().defaultRandom(),
  syncedProductId: uuid('synced_product_id').references(() => syncedProducts.id),
  platform: text('platform').notNull(), // 'facebook', 'instagram', 'twitter'
  externalPostId: text('external_post_id'),
  shareUrl: text('share_url').notNull(),
  message: text('message'),
  estimatedReach: integer('estimated_reach'),
  actualReach: integer('actual_reach'),
  engagement: integer('engagement').default(0),
  clicks: integer('clicks').default(0),
  createdAt: timestamp('created_at').defaultNow()
});

// Delivery settings for synced products
export const productDeliverySettings = pgTable('product_delivery_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  syncedProductId: uuid('synced_product_id').references(() => syncedProducts.id),
  deliveryRadius: integer('delivery_radius').default(10),
  estimatedDeliveryTime: text('estimated_delivery_time').default('2-3 business days'),
  specialInstructions: text('special_instructions'),
  requiresSpecialHandling: boolean('requires_special_handling').default(false),
  maxWeight: decimal('max_weight', { precision: 8, scale: 2 }),
  maxDimensions: text('max_dimensions'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export type BusinessIntegration = typeof businessIntegrations.$inferSelect;
export type SyncedProduct = typeof syncedProducts.$inferSelect;
export type ProductPromotion = typeof productPromotions.$inferSelect;
export type ProductShare = typeof productShares.$inferSelect;
export type ProductDeliverySettings = typeof productDeliverySettings.$inferSelect;