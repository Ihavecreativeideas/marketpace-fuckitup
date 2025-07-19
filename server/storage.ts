import {
  users,
  businesses,
  passwordResetTokens,
  userIntegrations,
  categories,
  listings,
  cartItems,
  orders,
  orderItems,
  deliveryRoutes,
  routeOrders,
  driverApplications,
  communityPosts,
  comments,
  offers,
  appSettings,
  type User,
  type UpsertUser,
  type Business,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type Category,
  type InsertCategory,
  type Listing,
  type InsertListing,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type DeliveryRoute,
  type InsertDeliveryRoute,
  type DriverApplication,
  type InsertDriverApplication,
  type CommunityPost,
  type InsertCommunityPost,
  type Comment,
  type InsertComment,
  type Offer,
  type InsertOffer,
  type AppSetting,
  type InsertAppSetting,
  type DriverTip,
  type InsertDriverTip,
  driverTips,
  // Revenue system types
  userWallets,
  walletTransactions,
  subscriptions,
  transactionFees,
  promotions,
  sponsorships,
  localPartners,
  driverPayments,
  revenueMetrics,
  returns,
  type UserWallet,
  type InsertUserWallet,
  type WalletTransaction,
  type InsertWalletTransaction,
  type Subscription,
  type InsertSubscription,
  // Data collection and analytics types
  userSessions,
  userBehavior,
  userInterests,
  userConnections,
  browsingHistory,
  searchHistory,
  deviceFingerprints,
  purchaseHistory,
  type UserSession,
  type InsertUserSession,
  type UserBehavior,
  type InsertUserBehavior,
  type UserInterest,
  type InsertUserInterest,
  type UserConnection,
  type InsertUserConnection,
  type BrowsingHistory,
  type InsertBrowsingHistory,
  type SearchHistory,
  type InsertSearchHistory,
  type DeviceFingerprint,
  type InsertDeviceFingerprint,
  type PurchaseHistory,
  type InsertPurchaseHistory,
  // Advertising system types
  adCampaigns,
  adCreatives,
  adImpressions,
  adClicks,
  adConversions,
  audienceSegments,
  userSegmentMembership,
  adPerformanceMetrics,
  dataPrivacySettings,
  type AdCampaign,
  type InsertAdCampaign,
  type AdCreative,
  type InsertAdCreative,
  type AdImpression,
  type InsertAdImpression,
  type AdClick,
  type InsertAdClick,
  type AdConversion,
  type InsertAdConversion,
  type AudienceSegment,
  type InsertAudienceSegment,
  type UserSegmentMembership,
  type InsertUserSegmentMembership,
  type AdPerformanceMetric,
  type InsertAdPerformanceMetric,
  type DataPrivacySetting,
  type InsertDataPrivacySetting,
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

// RLS Context management
export async function setRLSContext(userId?: string, userType?: string) {
  if (userId) {
    await db.execute(sql`SELECT set_config('app.current_user_id', ${userId}, true)`);
  }
  if (userType) {
    await db.execute(sql`SELECT set_config('app.user_type', ${userType}, true)`);
  }
}

export async function clearRLSContext() {
  await db.execute(sql`SELECT set_config('app.current_user_id', '', true)`);
  await db.execute(sql`SELECT set_config('app.user_type', '', true)`);
}

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, updateData: Partial<UpsertUser>): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User>;
  updateUserType(userId: string, userType: string): Promise<User>;
  updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User>;
  updateUserSubscription(userId: string, subscriptionData: { userType: string; stripeSubscriptionId: string; subscriptionStatus: string }): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoriesByType(type: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Listing operations
  getListings(categoryId?: number, search?: string, limit?: number): Promise<(Listing & { user: User; category: Category })[]>;
  getListing(id: number): Promise<(Listing & { user: User; category: Category }) | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing>;
  getUserListings(userId: string): Promise<Listing[]>;
  
  // Cart operations
  getCartItems(userId: string): Promise<(CartItem & { listing: Listing & { user: User } })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  removeFromCart(userId: string, listingId: number): Promise<void>;
  clearCart(userId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<(Order & { buyer: User; seller: User; driver?: User; orderItems: (OrderItem & { listing: Listing })[] }) | undefined>;
  getUserOrders(userId: string, type: 'buyer' | 'seller' | 'driver'): Promise<Order[]>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  addOrderItems(orderItems: InsertOrderItem[]): Promise<OrderItem[]>;
  
  // Driver operations
  submitDriverApplication(application: InsertDriverApplication): Promise<DriverApplication>;
  getDriverApplication(userId: string): Promise<DriverApplication | undefined>;
  updateDriverApplicationStatus(id: number, status: string, reviewedBy?: string): Promise<DriverApplication>;
  getPendingDriverApplications(): Promise<(DriverApplication & { user: User })[]>;
  updateDriverStatus(userId: string, isOnline: boolean): Promise<void>;
  getDriverStats(userId: string): Promise<any>;
  getDriverActiveRoutes(userId: string): Promise<any[]>;
  getAvailableRoutes(timeSlot: string): Promise<any[]>;
  acceptDeliveryRoute(routeId: number, driverId: string): Promise<any>;
  completeRouteStop(routeId: number, stopIndex: number, driverId: string): Promise<any>;
  addDriverTip(tip: InsertDriverTip): Promise<DriverTip>;
  
  // Demo operations
  generateDeliveryDemo(): Promise<any>;
  
  // Delivery route operations
  createDeliveryRoute(route: InsertDeliveryRoute): Promise<DeliveryRoute>;
  getDriverRoutes(driverId: string): Promise<DeliveryRoute[]>;
  getActiveRoute(driverId: string): Promise<(DeliveryRoute & { routeOrders: any[] }) | undefined>;
  addOrderToRoute(routeId: number, orderId: number, stopOrder: number, stopType: string): Promise<void>;

  // ============ DATA COLLECTION & ANALYTICS OPERATIONS ============
  
  // User session tracking
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSession(sessionId: string, data: Partial<InsertUserSession>): Promise<UserSession>;
  getUserSessions(userId: string, limit?: number): Promise<UserSession[]>;
  
  // Behavior tracking
  trackUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior>;
  getUserBehavior(userId: string, timeframe?: { start: Date; end: Date }): Promise<UserBehavior[]>;
  
  // Interest profiling
  updateUserInterests(userId: string, interests: InsertUserInterest[]): Promise<UserInterest[]>;
  getUserInterests(userId: string): Promise<UserInterest[]>;
  
  // Social connections
  createUserConnection(connection: InsertUserConnection): Promise<UserConnection>;
  getUserConnections(userId: string): Promise<UserConnection[]>;
  
  // Browsing history
  trackBrowsingHistory(history: InsertBrowsingHistory): Promise<BrowsingHistory>;
  getBrowsingHistory(userId: string, limit?: number): Promise<BrowsingHistory[]>;
  
  // Search tracking
  trackSearch(search: InsertSearchHistory): Promise<SearchHistory>;
  getSearchHistory(userId: string): Promise<SearchHistory[]>;
  
  // Device fingerprinting
  createDeviceFingerprint(fingerprint: InsertDeviceFingerprint): Promise<DeviceFingerprint>;
  updateDeviceFingerprint(fingerprintHash: string, lastSeen: Date): Promise<DeviceFingerprint>;
  
  // Purchase analytics
  trackPurchase(purchase: InsertPurchaseHistory): Promise<PurchaseHistory>;
  getPurchaseHistory(userId: string): Promise<PurchaseHistory[]>;

  // ============ ADVERTISING SYSTEM OPERATIONS ============
  
  // Campaign management
  createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign>;
  updateAdCampaign(id: number, updates: Partial<InsertAdCampaign>): Promise<AdCampaign>;
  getAdCampaigns(businessId: string): Promise<AdCampaign[]>;
  getAdCampaign(id: number): Promise<AdCampaign | undefined>;
  
  // Creative management
  createAdCreative(creative: InsertAdCreative): Promise<AdCreative>;
  updateAdCreative(id: number, updates: Partial<InsertAdCreative>): Promise<AdCreative>;
  getAdCreatives(campaignId: number): Promise<AdCreative[]>;
  
  // Ad serving and tracking
  recordAdImpression(impression: InsertAdImpression): Promise<AdImpression>;
  recordAdClick(click: InsertAdClick): Promise<AdClick>;
  recordAdConversion(conversion: InsertAdConversion): Promise<AdConversion>;
  
  // Audience management
  createAudienceSegment(segment: InsertAudienceSegment): Promise<AudienceSegment>;
  updateAudienceSegment(id: number, updates: Partial<InsertAudienceSegment>): Promise<AudienceSegment>;
  getAudienceSegments(businessId: string): Promise<AudienceSegment[]>;
  addUserToSegment(userId: string, segmentId: number, score?: number): Promise<UserSegmentMembership>;
  
  // Performance analytics
  getAdPerformanceMetrics(campaignId: number, dateRange?: { start: Date; end: Date }): Promise<AdPerformanceMetric[]>;
  updateAdPerformanceMetrics(campaignId: number, date: Date, metrics: Partial<InsertAdPerformanceMetric>): Promise<AdPerformanceMetric>;
  
  // Targeting and recommendations
  getTargetableUsers(criteria: any): Promise<User[]>;
  calculateAudienceSize(targeting: any): Promise<number>;
  generateLookalikeAudience(sourceSegmentId: number, size: number): Promise<AudienceSegment>;
  
  // Privacy and consent
  updatePrivacySettings(userId: string, settings: Partial<InsertDataPrivacySetting>): Promise<DataPrivacySetting>;
  getPrivacySettings(userId: string): Promise<DataPrivacySetting | undefined>;
  
  // Community operations
  getCommunityPosts(limit?: number): Promise<(CommunityPost & { user: User })[]>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getPostComments(postId: number): Promise<(Comment & { user: User })[]>;
  addComment(comment: InsertComment): Promise<Comment>;
  
  // Offer operations
  createOffer(offer: InsertOffer): Promise<Offer>;
  getListingOffers(listingId: number): Promise<(Offer & { buyer: User })[]>;
  getUserOffers(userId: string, type: 'buyer' | 'seller'): Promise<(Offer & { listing: Listing; buyer: User; seller: User })[]>;
  updateOfferStatus(id: number, status: string): Promise<Offer>;
  
  // App settings operations
  getAppSettings(): Promise<AppSetting[]>;
  getAppSettingsByCategory(category: string): Promise<AppSetting[]>;
  getAppSetting(key: string): Promise<AppSetting | undefined>;
  updateAppSetting(key: string, value: string, updatedBy: string): Promise<AppSetting>;
  createAppSetting(setting: InsertAppSetting): Promise<AppSetting>;
  
  // Integration operations
  updateUserIntegration(userId: string, integration: any): Promise<any>;
  getUserIntegrations(userId: string): Promise<any[]>;
  removeUserIntegration(userId: string, platform: string): Promise<void>;
  
  // Business operations
  getBusinessById(id: string): Promise<Business | undefined>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(userId: string, updateData: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategoriesByType(type: string): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.type, type)).orderBy(categories.name);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Listing operations
  async getListings(categoryId?: number, search?: string, limit: number = 20): Promise<(Listing & { user: User; category: Category })[]> {
    let whereConditions = [eq(listings.isActive, true)];

    if (categoryId) {
      whereConditions.push(eq(listings.categoryId, categoryId));
    }

    if (search) {
      whereConditions.push(
        or(
          like(listings.title, `%${search}%`),
          like(listings.description, `%${search}%`)
        )
      );
    }

    const results = await db
      .select()
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(and(...whereConditions))
      .orderBy(desc(listings.createdAt))
      .limit(limit);

    return results.map(result => ({
      ...result.listings,
      user: result.users,
      category: result.categories,
    }));
  }

  async getListing(id: number): Promise<(Listing & { user: User; category: Category }) | undefined> {
    const [result] = await db
      .select()
      .from(listings)
      .innerJoin(users, eq(listings.userId, users.id))
      .innerJoin(categories, eq(listings.categoryId, categories.id))
      .where(eq(listings.id, id));

    if (!result) return undefined;

    return {
      ...result.listings,
      user: result.users,
      category: result.categories,
    };
  }

  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async updateListing(id: number, listing: Partial<InsertListing>): Promise<Listing> {
    const [updatedListing] = await db
      .update(listings)
      .set({ ...listing, updatedAt: new Date() })
      .where(eq(listings.id, id))
      .returning();
    return updatedListing;
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    return await db
      .select()
      .from(listings)
      .where(eq(listings.userId, userId))
      .orderBy(desc(listings.createdAt));
  }

  // Cart operations
  async getCartItems(userId: string): Promise<(CartItem & { listing: Listing & { user: User } })[]> {
    const results = await db
      .select()
      .from(cartItems)
      .innerJoin(listings, eq(cartItems.listingId, listings.id))
      .innerJoin(users, eq(listings.userId, users.id))
      .where(eq(cartItems.userId, userId))
      .orderBy(desc(cartItems.addedAt));

    return results.map(result => ({
      ...result.cart_items,
      listing: {
        ...result.listings,
        user: result.users,
      },
    }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.userId, cartItem.userId),
          eq(cartItems.listingId, cartItem.listingId)
        )
      );

    if (existingItem) {
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (cartItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [newItem] = await db.insert(cartItems).values(cartItem).returning();
    return newItem;
  }

  async removeFromCart(userId: string, listingId: number): Promise<void> {
    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.userId, userId),
          eq(cartItems.listingId, listingId)
        )
      );
  }

  async clearCart(userId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.userId, userId));
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async getOrder(id: number): Promise<(Order & { buyer: User; seller: User; driver?: User; orderItems: (OrderItem & { listing: Listing })[] }) | undefined> {
    const [orderResult] = await db
      .select()
      .from(orders)
      .innerJoin(users, eq(orders.buyerId, users.id))
      .where(eq(orders.id, id));

    if (!orderResult) return undefined;

    const orderItemsResult = await db
      .select()
      .from(orderItems)
      .innerJoin(listings, eq(orderItems.listingId, listings.id))
      .where(eq(orderItems.orderId, id));

    return {
      ...orderResult.orders,
      buyer: orderResult.users,
      seller: orderResult.users, // This needs proper join for seller
      orderItems: orderItemsResult.map(item => ({
        ...item.order_items,
        listing: item.listings,
      })),
    };
  }

  async getUserOrders(userId: string, type: 'buyer' | 'seller' | 'driver'): Promise<Order[]> {
    let whereClause;
    switch (type) {
      case 'buyer':
        whereClause = eq(orders.buyerId, userId);
        break;
      case 'seller':
        whereClause = eq(orders.sellerId, userId);
        break;
      case 'driver':
        whereClause = eq(orders.driverId, userId);
        break;
    }

    return await db
      .select()
      .from(orders)
      .where(whereClause)
      .orderBy(desc(orders.createdAt));
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }

  async addOrderItems(orderItemsData: InsertOrderItem[]): Promise<OrderItem[]> {
    return await db.insert(orderItems).values(orderItemsData).returning();
  }

  // Driver operations
  async submitDriverApplication(application: InsertDriverApplication): Promise<DriverApplication> {
    const [newApplication] = await db.insert(driverApplications).values(application).returning();
    return newApplication;
  }

  async getDriverApplication(userId: string): Promise<DriverApplication | undefined> {
    const [application] = await db
      .select()
      .from(driverApplications)
      .where(eq(driverApplications.userId, userId))
      .orderBy(desc(driverApplications.createdAt));
    return application;
  }

  async updateDriverApplicationStatus(id: number, status: string, reviewedBy?: string): Promise<DriverApplication> {
    const [updatedApplication] = await db
      .update(driverApplications)
      .set({
        status,
        reviewedBy,
        reviewedAt: new Date(),
      })
      .where(eq(driverApplications.id, id))
      .returning();
    return updatedApplication;
  }

  async getPendingDriverApplications(): Promise<(DriverApplication & { user: User })[]> {
    const results = await db
      .select()
      .from(driverApplications)
      .innerJoin(users, eq(driverApplications.userId, users.id))
      .where(eq(driverApplications.status, 'pending'))
      .orderBy(driverApplications.createdAt);

    return results.map(result => ({
      ...result.driver_applications,
      user: result.users,
    }));
  }

  // Delivery route operations
  async createDeliveryRoute(route: InsertDeliveryRoute): Promise<DeliveryRoute> {
    const [newRoute] = await db.insert(deliveryRoutes).values(route).returning();
    return newRoute;
  }

  async getDriverRoutes(driverId: string): Promise<DeliveryRoute[]> {
    return await db
      .select()
      .from(deliveryRoutes)
      .where(eq(deliveryRoutes.driverId, driverId))
      .orderBy(desc(deliveryRoutes.createdAt));
  }

  async getActiveRoute(driverId: string): Promise<(DeliveryRoute & { routeOrders: any[] }) | undefined> {
    const [route] = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.driverId, driverId),
          eq(deliveryRoutes.status, 'active')
        )
      );

    if (!route) return undefined;

    const routeOrdersData = await db
      .select()
      .from(routeOrders)
      .where(eq(routeOrders.routeId, route.id));

    return {
      ...route,
      routeOrders: routeOrdersData,
    };
  }

  async addOrderToRoute(routeId: number, orderId: number, stopOrder: number, stopType: string): Promise<void> {
    await db.insert(routeOrders).values({
      routeId,
      orderId,
      stopOrder,
      stopType,
    });
  }

  // Community operations
  async getCommunityPosts(limit: number = 20): Promise<(CommunityPost & { user: User })[]> {
    const results = await db
      .select()
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .where(eq(communityPosts.isActive, true))
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit);

    return results.map(result => ({
      ...result.community_posts,
      user: result.users,
    }));
  }

  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values(post).returning();
    return newPost;
  }

  async getPostComments(postId: number): Promise<(Comment & { user: User })[]> {
    const results = await db
      .select()
      .from(comments)
      .innerJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, postId))
      .orderBy(comments.createdAt);

    return results.map(result => ({
      ...result.comments,
      user: result.users,
    }));
  }

  async addComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments).values(comment).returning();
    return newComment;
  }

  // Offer operations
  async createOffer(offer: InsertOffer): Promise<Offer> {
    const [newOffer] = await db.insert(offers).values(offer).returning();
    return newOffer;
  }

  async getListingOffers(listingId: number): Promise<(Offer & { buyer: User })[]> {
    const results = await db
      .select()
      .from(offers)
      .innerJoin(users, eq(offers.buyerId, users.id))
      .where(eq(offers.listingId, listingId))
      .orderBy(desc(offers.createdAt));

    return results.map(result => ({
      ...result.offers,
      buyer: result.users,
    }));
  }

  async getUserOffers(userId: string, type: 'buyer' | 'seller'): Promise<(Offer & { listing: Listing; buyer: User; seller: User })[]> {
    const whereClause = type === 'buyer' ? eq(offers.buyerId, userId) : eq(offers.sellerId, userId);

    const results = await db
      .select()
      .from(offers)
      .innerJoin(listings, eq(offers.listingId, listings.id))
      .innerJoin(users, eq(offers.buyerId, users.id))
      .where(whereClause)
      .orderBy(desc(offers.createdAt));

    return results.map(result => ({
      ...result.offers,
      listing: result.listings,
      buyer: result.users,
      seller: result.users, // This needs proper join for seller
    }));
  }

  async updateOfferStatus(id: number, status: string): Promise<Offer> {
    const [updatedOffer] = await db
      .update(offers)
      .set({ status })
      .where(eq(offers.id, id))
      .returning();
    return updatedOffer;
  }

  // App settings operations
  async getAppSettings(): Promise<AppSetting[]> {
    return await db.select().from(appSettings).orderBy(appSettings.category, appSettings.label);
  }

  async getAppSettingsByCategory(category: string): Promise<AppSetting[]> {
    return await db.select().from(appSettings).where(eq(appSettings.category, category));
  }

  async getAppSetting(key: string): Promise<AppSetting | undefined> {
    const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
    return setting;
  }

  async updateAppSetting(key: string, value: string, updatedBy: string): Promise<AppSetting> {
    const [updatedSetting] = await db
      .update(appSettings)
      .set({ 
        value, 
        updatedBy, 
        updatedAt: new Date() 
      })
      .where(eq(appSettings.key, key))
      .returning();
    return updatedSetting;
  }

  async createAppSetting(setting: InsertAppSetting): Promise<AppSetting> {
    const [newSetting] = await db
      .insert(appSettings)
      .values(setting)
      .returning();
    return newSetting;
  }

  // New driver methods implementation
  async updateDriverStatus(userId: string, isOnline: boolean): Promise<void> {
    await setRLSContext(userId, 'driver');
    try {
      await db.update(driverApplications)
        .set({ isActive: isOnline })
        .where(eq(driverApplications.userId, userId));
    } finally {
      await clearRLSContext();
    }
  }

  async getDriverStats(userId: string): Promise<any> {
    await setRLSContext(userId, 'driver');
    try {
      const application = await db
        .select()
        .from(driverApplications)
        .where(eq(driverApplications.userId, userId))
        .limit(1);

      if (!application[0]) {
        return {
          todaysEarnings: 0,
          completedDeliveries: 0,
          averageRating: 5.0,
          timeOnline: '0h 0m',
        };
      }

      return {
        todaysEarnings: parseFloat(application[0].totalEarnings?.toString() || '0'),
        completedDeliveries: application[0].totalDeliveries || 0,
        averageRating: parseFloat(application[0].averageRating?.toString() || '5.0'),
        timeOnline: '2h 30m', // This would be calculated from actual time tracking
      };
    } finally {
      await clearRLSContext();
    }
  }

  async getDriverActiveRoutes(userId: string): Promise<any[]> {
    await setRLSContext(userId, 'driver');
    try {
      // For demo purposes, return sample active routes
      return await this.generateDeliveryDemo();
    } finally {
      await clearRLSContext();
    }
  }

  async getAvailableRoutes(timeSlot: string): Promise<any[]> {
    // For demo purposes, generate sample available routes
    return await this.generateAvailableRoutesDemo(timeSlot);
  }

  async acceptDeliveryRoute(routeId: number, driverId: string): Promise<any> {
    await setRLSContext(driverId, 'driver');
    try {
      // In a real implementation, this would update the route status
      return { success: true, message: 'Route accepted successfully' };
    } finally {
      await clearRLSContext();
    }
  }

  async completeRouteStop(routeId: number, stopIndex: number, driverId: string): Promise<any> {
    await setRLSContext(driverId, 'driver');
    try {
      // In a real implementation, this would update the stop status and earnings
      return { success: true, message: 'Stop completed successfully' };
    } finally {
      await clearRLSContext();
    }
  }

  async addDriverTip(tip: InsertDriverTip): Promise<DriverTip> {
    await setRLSContext(tip.buyerId, 'buyer');
    try {
      const result = await db.insert(driverTips).values(tip).returning();
      return result[0];
    } finally {
      await clearRLSContext();
    }
  }

  // Route optimization algorithm
  private optimizeRoute(pickups: any[], dropoffs: any[]): any[] {
    // Simple distance-based optimization (in a real app, you'd use a proper routing API)
    const allStops = [...pickups, ...dropoffs];
    
    // Sort by proximity - this is a simplified version
    // Real implementation would use Google Maps Directions API or similar
    allStops.sort((a, b) => {
      const aKey = `${a.coordinates.lat}_${a.coordinates.lng}`;
      const bKey = `${b.coordinates.lat}_${b.coordinates.lng}`;
      return aKey.localeCompare(bKey);
    });

    // Ensure pickups come before their corresponding dropoffs
    const optimized = [];
    const processed = new Set();

    for (const stop of allStops) {
      if (processed.has(stop.orderId)) continue;

      if (stop.type === 'pickup') {
        optimized.push(stop);
        // Find and add corresponding dropoff
        const dropoff = allStops.find(s => 
          s.orderId === stop.orderId && s.type === 'dropoff'
        );
        if (dropoff) {
          optimized.push(dropoff);
        }
        processed.add(stop.orderId);
      }
    }

    // Add any remaining dropoffs
    for (const stop of allStops) {
      if (!processed.has(stop.orderId) && stop.type === 'dropoff') {
        optimized.push(stop);
        processed.add(stop.orderId);
      }
    }

      return optimized.map((stop, index) => ({ ...stop, stopNumber: index + 1 }));
  }

  async generateDeliveryDemo(): Promise<any[]> {
    // Generate realistic demo data showing optimized delivery routes
    const colorSchemes = [
      { code: 'blue', pickup: '#1E3A8A', dropoff: '#3B82F6' },
      { code: 'red', pickup: '#7C2D12', dropoff: '#EF4444' },
      { code: 'green', pickup: '#14532D', dropoff: '#22C55E' },
    ];

    const sampleOrders = [
      {
        orderId: 1,
        customerName: 'Sarah Johnson',
        pickupAddress: '123 Main St, Downtown',
        dropoffAddress: '456 Oak Ave, Midtown',
        items: ['Vintage Camera', 'Film Rolls'],
        pickupCoords: { lat: 40.7128, lng: -74.0060 },
        dropoffCoords: { lat: 40.7589, lng: -73.9851 },
        earnings: 6.50, // $4 pickup + $2 dropoff + $0.50 mileage
      },
      {
        orderId: 2,
        customerName: 'Mike Chen',
        pickupAddress: '789 Pine St, Downtown',
        dropoffAddress: '321 Elm Dr, Uptown',
        items: ['Guitar Amp', 'Cables'],
        pickupCoords: { lat: 40.7150, lng: -74.0080 },
        dropoffCoords: { lat: 40.7831, lng: -73.9712 },
        earnings: 7.00,
      },
      {
        orderId: 3,
        customerName: 'Lisa Rodriguez',
        pickupAddress: '555 Broadway, Downtown',
        dropoffAddress: '777 Park Ave, Midtown',
        items: ['Designer Handbag'],
        pickupCoords: { lat: 40.7180, lng: -74.0020 },
        dropoffCoords: { lat: 40.7614, lng: -73.9776 },
        earnings: 6.00,
      },
    ];

    // Create pickup and dropoff stops
    const pickups = sampleOrders.map(order => ({
      orderId: order.orderId,
      type: 'pickup' as const,
      address: order.pickupAddress,
      customerName: order.customerName,
      items: order.items,
      earnings: 4.00, // Base pickup fee
      coordinates: order.pickupCoords,
    }));

    const dropoffs = sampleOrders.map(order => ({
      orderId: order.orderId,
      type: 'dropoff' as const,
      address: order.dropoffAddress,
      customerName: order.customerName,
      items: order.items,
      earnings: 2.50, // Base dropoff fee + mileage
      coordinates: order.dropoffCoords,
    }));

    // Optimize the route
    const optimizedStops = this.optimizeRoute(pickups, dropoffs);

    const route = {
      id: 1,
      timeSlot: '12pm-3pm',
      status: 'active',
      colorCode: 'blue',
      totalEarnings: 19.50,
      basePay: 18.00, // 6 stops × $3 average
      mileagePay: 1.50, // 3 miles × $0.50
      tips: 0.00,
      totalDistance: 3.2,
      estimatedDuration: 45,
      orders: optimizedStops,
    };

    return [route];
  }

  async generateAvailableRoutesDemo(timeSlot: string): Promise<any[]> {
    const colorSchemes = ['red', 'green', 'orange'];
    const routes = [];

    for (let i = 0; i < 2; i++) {
      const sampleOrders = [
        {
          orderId: 100 + i * 10 + 1,
          customerName: `Customer ${i * 3 + 1}`,
          pickupAddress: `${100 + i * 10} Commerce St`,
          dropoffAddress: `${200 + i * 10} Residential Ave`,
          items: ['Electronics', 'Accessories'],
          pickupCoords: { lat: 40.7128 + i * 0.01, lng: -74.0060 + i * 0.01 },
          dropoffCoords: { lat: 40.7589 + i * 0.01, lng: -73.9851 + i * 0.01 },
        },
        {
          orderId: 100 + i * 10 + 2,
          customerName: `Customer ${i * 3 + 2}`,
          pickupAddress: `${300 + i * 10} Market St`,
          dropoffAddress: `${400 + i * 10} Garden Rd`,
          items: ['Home Goods'],
          pickupCoords: { lat: 40.7200 + i * 0.01, lng: -74.0100 + i * 0.01 },
          dropoffCoords: { lat: 40.7700 + i * 0.01, lng: -73.9800 + i * 0.01 },
        },
      ];

      const pickups = sampleOrders.map(order => ({
        orderId: order.orderId,
        type: 'pickup' as const,
        address: order.pickupAddress,
        customerName: order.customerName,
        items: order.items,
        earnings: 4.00,
        coordinates: order.pickupCoords,
      }));

      const dropoffs = sampleOrders.map(order => ({
        orderId: order.orderId,
        type: 'dropoff' as const,
        address: order.dropoffAddress,
        customerName: order.customerName,
        items: order.items,
        earnings: 2.50,
        coordinates: order.dropoffCoords,
      }));

      const optimizedStops = this.optimizeRoute(pickups, dropoffs);

      routes.push({
        id: 10 + i,
        timeSlot,
        status: 'available',
        colorCode: colorSchemes[i],
        totalEarnings: 13.00,
        basePay: 12.00,
        mileagePay: 1.00,
        tips: 0.00,
        totalDistance: 2.1,
        estimatedDuration: 35,
        orders: optimizedStops,
      });
    }

    return routes;
  }

  // ============ DATA COLLECTION & ANALYTICS IMPLEMENTATION ============

  // User session tracking
  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    await setRLSContext(session.userId, 'user');
    try {
      const [result] = await db.insert(userSessions).values(session).returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async updateUserSession(sessionId: string, data: Partial<InsertUserSession>): Promise<UserSession> {
    try {
      const [result] = await db.update(userSessions)
        .set({ ...data, endTime: new Date() })
        .where(eq(userSessions.sessionId, sessionId))
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getUserSessions(userId: string, limit: number = 50): Promise<UserSession[]> {
    await setRLSContext(userId, 'user');
    try {
      return await db.select()
        .from(userSessions)
        .where(eq(userSessions.userId, userId))
        .orderBy(desc(userSessions.startTime))
        .limit(limit);
    } finally {
      await clearRLSContext();
    }
  }

  // Behavior tracking
  async trackUserBehavior(behavior: InsertUserBehavior): Promise<UserBehavior> {
    await setRLSContext(behavior.userId, 'user');
    try {
      const [result] = await db.insert(userBehavior).values(behavior).returning();
      
      // Update user interests based on behavior
      if (behavior.page && behavior.eventType === 'page_view') {
        await this.updateUserInterestsFromBehavior(behavior.userId!, behavior.page);
      }
      
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getUserBehavior(userId: string, timeframe?: { start: Date; end: Date }): Promise<UserBehavior[]> {
    await setRLSContext(userId, 'user');
    try {
      if (timeframe) {
        return await db.select()
          .from(userBehavior)
          .where(
            and(
              eq(userBehavior.userId, userId),
              sql`${userBehavior.timestamp} >= ${timeframe.start}`,
              sql`${userBehavior.timestamp} <= ${timeframe.end}`
            )
          )
          .orderBy(desc(userBehavior.timestamp))
          .limit(1000);
      } else {
        return await db.select()
          .from(userBehavior)
          .where(eq(userBehavior.userId, userId))
          .orderBy(desc(userBehavior.timestamp))
          .limit(1000);
      }
    } finally {
      await clearRLSContext();
    }
  }

  // Interest profiling
  async updateUserInterests(userId: string, interests: InsertUserInterest[]): Promise<UserInterest[]> {
    await setRLSContext(userId, 'user');
    try {
      const results = [];
      for (const interest of interests) {
        const [result] = await db.insert(userInterests)
          .values({ ...interest, userId })
          .onConflictDoUpdate({
            target: [userInterests.userId, userInterests.category, userInterests.subcategory],
            set: {
              score: sql`${userInterests.score} + ${interest.score}`,
              interactionCount: sql`${userInterests.interactionCount} + 1`,
              totalTimeSpent: sql`${userInterests.totalTimeSpent} + ${interest.totalTimeSpent || 0}`,
              updatedAt: new Date(),
            },
          })
          .returning();
        results.push(result);
      }
      return results;
    } finally {
      await clearRLSContext();
    }
  }

  async getUserInterests(userId: string): Promise<UserInterest[]> {
    await setRLSContext(userId, 'user');
    try {
      return await db.select()
        .from(userInterests)
        .where(eq(userInterests.userId, userId))
        .orderBy(desc(userInterests.score));
    } finally {
      await clearRLSContext();
    }
  }

  // Social connections
  async createUserConnection(connection: InsertUserConnection): Promise<UserConnection> {
    await setRLSContext(connection.userId, 'user');
    try {
      const [result] = await db.insert(userConnections).values(connection).returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getUserConnections(userId: string): Promise<UserConnection[]> {
    await setRLSContext(userId, 'user');
    try {
      return await db.select()
        .from(userConnections)
        .where(eq(userConnections.userId, userId))
        .orderBy(desc(userConnections.strength));
    } finally {
      await clearRLSContext();
    }
  }

  // Browsing history
  async trackBrowsingHistory(history: InsertBrowsingHistory): Promise<BrowsingHistory> {
    await setRLSContext(history.userId, 'user');
    try {
      const [result] = await db.insert(browsingHistory).values(history).returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getBrowsingHistory(userId: string, limit: number = 100): Promise<BrowsingHistory[]> {
    await setRLSContext(userId, 'user');
    try {
      return await db.select()
        .from(browsingHistory)
        .where(eq(browsingHistory.userId, userId))
        .orderBy(desc(browsingHistory.timestamp))
        .limit(limit);
    } finally {
      await clearRLSContext();
    }
  }

  // Search tracking
  async trackSearch(search: InsertSearchHistory): Promise<SearchHistory> {
    await setRLSContext(search.userId, 'user');
    try {
      const [result] = await db.insert(searchHistory).values(search).returning();
      
      // Update user interests based on search
      if (search.category) {
        await this.updateUserInterestsFromSearch(search.userId!, search.category, search.query!);
      }
      
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getSearchHistory(userId: string): Promise<SearchHistory[]> {
    await setRLSContext(userId, 'user');
    try {
      return await db.select()
        .from(searchHistory)
        .where(eq(searchHistory.userId, userId))
        .orderBy(desc(searchHistory.timestamp))
        .limit(100);
    } finally {
      await clearRLSContext();
    }
  }

  // Device fingerprinting
  async createDeviceFingerprint(fingerprint: InsertDeviceFingerprint): Promise<DeviceFingerprint> {
    await setRLSContext(fingerprint.userId, 'user');
    try {
      const [result] = await db.insert(deviceFingerprints)
        .values(fingerprint)
        .onConflictDoUpdate({
          target: deviceFingerprints.fingerprintHash,
          set: {
            lastSeen: new Date(),
            sessionsCount: sql`${deviceFingerprints.sessionsCount} + 1`,
          },
        })
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async updateDeviceFingerprint(fingerprintHash: string, lastSeen: Date): Promise<DeviceFingerprint> {
    try {
      const [result] = await db.update(deviceFingerprints)
        .set({ lastSeen, sessionsCount: sql`${deviceFingerprints.sessionsCount} + 1` })
        .where(eq(deviceFingerprints.fingerprintHash, fingerprintHash))
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  // Purchase analytics
  async trackPurchase(purchase: InsertPurchaseHistory): Promise<PurchaseHistory> {
    await setRLSContext(purchase.userId, 'user');
    try {
      const [result] = await db.insert(purchaseHistory).values(purchase).returning();
      
      // Update user interests based on purchase
      if (purchase.category) {
        await this.updateUserInterestsFromPurchase(purchase.userId!, purchase.category, purchase.subcategory);
      }
      
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getPurchaseHistory(userId: string): Promise<PurchaseHistory[]> {
    await setRLSContext(userId, 'user');
    try {
      return await db.select()
        .from(purchaseHistory)
        .where(eq(purchaseHistory.userId, userId))
        .orderBy(desc(purchaseHistory.timestamp));
    } finally {
      await clearRLSContext();
    }
  }

  // ============ ADVERTISING SYSTEM IMPLEMENTATION ============

  // Campaign management
  async createAdCampaign(campaign: InsertAdCampaign): Promise<AdCampaign> {
    await setRLSContext(campaign.businessId, 'business');
    try {
      const [result] = await db.insert(adCampaigns).values(campaign).returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async updateAdCampaign(id: number, updates: Partial<InsertAdCampaign>): Promise<AdCampaign> {
    try {
      const [result] = await db.update(adCampaigns)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(adCampaigns.id, id))
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getAdCampaigns(businessId: string): Promise<AdCampaign[]> {
    await setRLSContext(businessId, 'business');
    try {
      return await db.select()
        .from(adCampaigns)
        .where(eq(adCampaigns.businessId, businessId))
        .orderBy(desc(adCampaigns.createdAt));
    } finally {
      await clearRLSContext();
    }
  }

  async getAdCampaign(id: number): Promise<AdCampaign | undefined> {
    try {
      const [result] = await db.select()
        .from(adCampaigns)
        .where(eq(adCampaigns.id, id));
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  // Creative management
  async createAdCreative(creative: InsertAdCreative): Promise<AdCreative> {
    try {
      const [result] = await db.insert(adCreatives).values(creative).returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async updateAdCreative(id: number, updates: Partial<InsertAdCreative>): Promise<AdCreative> {
    try {
      const [result] = await db.update(adCreatives)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(adCreatives.id, id))
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getAdCreatives(campaignId: number): Promise<AdCreative[]> {
    try {
      return await db.select()
        .from(adCreatives)
        .where(eq(adCreatives.campaignId, campaignId))
        .orderBy(desc(adCreatives.createdAt));
    } finally {
      await clearRLSContext();
    }
  }

  // Ad serving and tracking
  async recordAdImpression(impression: InsertAdImpression): Promise<AdImpression> {
    try {
      const [result] = await db.insert(adImpressions).values(impression).returning();
      
      // Update campaign spend
      await this.updateCampaignSpend(impression.campaignId!, Number(impression.cost) || 0);
      
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async recordAdClick(click: InsertAdClick): Promise<AdClick> {
    try {
      const [result] = await db.insert(adClicks).values(click).returning();
      
      // Update campaign spend
      await this.updateCampaignSpend(click.campaignId!, Number(click.cost) || 0);
      
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async recordAdConversion(conversion: InsertAdConversion): Promise<AdConversion> {
    try {
      const [result] = await db.insert(adConversions).values(conversion).returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  // Audience management
  async createAudienceSegment(segment: InsertAudienceSegment): Promise<AudienceSegment> {
    await setRLSContext(segment.businessId, 'business');
    try {
      const [result] = await db.insert(audienceSegments).values(segment).returning();
      
      // Calculate initial user count
      const userCount = await this.calculateAudienceSize(segment.criteria);
      await this.updateAudienceSegment(result.id, { userCount });
      
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async updateAudienceSegment(id: number, updates: Partial<InsertAudienceSegment>): Promise<AudienceSegment> {
    try {
      const [result] = await db.update(audienceSegments)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(audienceSegments.id, id))
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getAudienceSegments(businessId: string): Promise<AudienceSegment[]> {
    await setRLSContext(businessId, 'business');
    try {
      return await db.select()
        .from(audienceSegments)
        .where(eq(audienceSegments.businessId, businessId))
        .orderBy(desc(audienceSegments.createdAt));
    } finally {
      await clearRLSContext();
    }
  }

  async addUserToSegment(userId: string, segmentId: number, score: number = 1): Promise<UserSegmentMembership> {
    try {
      const [result] = await db.insert(userSegmentMembership)
        .values({ userId, segmentId, score })
        .onConflictDoUpdate({
          target: [userSegmentMembership.userId, userSegmentMembership.segmentId],
          set: { score, lastUpdated: new Date() },
        })
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  // Performance analytics
  async getAdPerformanceMetrics(campaignId: number, dateRange?: { start: Date; end: Date }): Promise<AdPerformanceMetric[]> {
    try {
      if (dateRange) {
        return await db.select()
          .from(adPerformanceMetrics)
          .where(
            and(
              eq(adPerformanceMetrics.campaignId, campaignId),
              sql`${adPerformanceMetrics.date} >= ${dateRange.start}`,
              sql`${adPerformanceMetrics.date} <= ${dateRange.end}`
            )
          )
          .orderBy(desc(adPerformanceMetrics.date));
      } else {
        return await db.select()
          .from(adPerformanceMetrics)
          .where(eq(adPerformanceMetrics.campaignId, campaignId))
          .orderBy(desc(adPerformanceMetrics.date));
      }
    } finally {
      await clearRLSContext();
    }
  }

  async updateAdPerformanceMetrics(campaignId: number, date: Date, metrics: Partial<InsertAdPerformanceMetric>): Promise<AdPerformanceMetric> {
    try {
      const [result] = await db.insert(adPerformanceMetrics)
        .values({ campaignId, date: date.toISOString().split('T')[0], ...metrics })
        .onConflictDoUpdate({
          target: [adPerformanceMetrics.campaignId, adPerformanceMetrics.date],
          set: metrics,
        })
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  // Targeting and recommendations
  async getTargetableUsers(criteria: any): Promise<User[]> {
    try {
      // Build dynamic query based on targeting criteria
      const filters = [];
      
      if (criteria.age) {
        // Calculate age from birth date (if available)
        filters.push(sql`EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date)) BETWEEN ${criteria.age.min} AND ${criteria.age.max}`);
      }
      
      if (criteria.location) {
        // Location-based targeting (requires location data)
        filters.push(sql`location->>'country' = ${criteria.location.country}`);
      }
      
      if (criteria.interests?.length > 0) {
        // Interest-based targeting
        const interestUserIds = await db.select({ userId: userInterests.userId })
          .from(userInterests)
          .where(sql`${userInterests.category} = ANY(${criteria.interests})`);
        
        const userIds = interestUserIds.map(u => u.userId);
        if (userIds.length > 0) {
          filters.push(sql`${users.id} = ANY(${userIds})`);
        }
      }
      
      if (filters.length > 0) {
        return await db.select()
          .from(users)
          .where(and(...filters))
          .limit(1000);
      } else {
        return await db.select()
          .from(users)
          .limit(1000);
      }
    } finally {
      await clearRLSContext();
    }
  }

  async calculateAudienceSize(targeting: any): Promise<number> {
    try {
      const users = await this.getTargetableUsers(targeting);
      return users.length;
    } finally {
      await clearRLSContext();
    }
  }

  async generateLookalikeAudience(sourceSegmentId: number, size: number): Promise<AudienceSegment> {
    try {
      // Get source segment users
      const sourceUsers = await db.select({ userId: userSegmentMembership.userId })
        .from(userSegmentMembership)
        .where(eq(userSegmentMembership.segmentId, sourceSegmentId));
      
      // Analyze their interests and behaviors to create lookalike criteria
      const interests = await db.select({ category: userInterests.category })
        .from(userInterests)
        .where(sql`${userInterests.userId} = ANY(${sourceUsers.map(u => u.userId)})`);
      
      const lookalikeSegment = await this.createAudienceSegment({
        businessId: 'system', // or get from source segment
        name: `Lookalike of Segment ${sourceSegmentId}`,
        type: 'lookalike',
        criteria: {
          interests: interests.map(i => i.category),
          similarity_threshold: 0.7,
        },
      });
      
      return lookalikeSegment;
    } finally {
      await clearRLSContext();
    }
  }

  // Privacy and consent
  async updatePrivacySettings(userId: string, settings: Partial<InsertDataPrivacySetting>): Promise<DataPrivacySetting> {
    await setRLSContext(userId, 'user');
    try {
      const [result] = await db.insert(dataPrivacySettings)
        .values({ userId, ...settings })
        .onConflictDoUpdate({
          target: dataPrivacySettings.userId,
          set: { ...settings, updatedAt: new Date() },
        })
        .returning();
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  async getPrivacySettings(userId: string): Promise<DataPrivacySetting | undefined> {
    await setRLSContext(userId, 'user');
    try {
      const [result] = await db.select()
        .from(dataPrivacySettings)
        .where(eq(dataPrivacySettings.userId, userId));
      return result;
    } finally {
      await clearRLSContext();
    }
  }

  // Helper methods for interest calculation
  private async updateUserInterestsFromBehavior(userId: string, page: string): Promise<void> {
    const category = this.categorizePageView(page);
    if (category) {
      await this.updateUserInterests(userId, [{
        category,
        score: 0.1,
        source: 'behavior_derived',
        totalTimeSpent: 30, // average page view time
      }]);
    }
  }

  private async updateUserInterestsFromSearch(userId: string, category: string, query: string): Promise<void> {
    await this.updateUserInterests(userId, [{
      category,
      subcategory: query.substring(0, 100),
      score: 0.2,
      source: 'search_behavior',
      totalTimeSpent: 60,
    }]);
  }

  private async updateUserInterestsFromPurchase(userId: string, category: string, subcategory?: string): Promise<void> {
    await this.updateUserInterests(userId, [{
      category,
      subcategory,
      score: 1.0, // High weight for purchases
      source: 'purchase_history',
      totalTimeSpent: 0,
    }]);
  }

  private categorizePageView(page: string): string | null {
    const categoryMap: Record<string, string> = {
      'marketplace': 'shopping',
      'electronics': 'electronics',
      'fashion': 'fashion',
      'automotive': 'automotive',
      'home': 'home_garden',
      'sports': 'sports',
      'books': 'books_media',
      'food': 'food_beverages',
    };
    
    for (const [key, category] of Object.entries(categoryMap)) {
      if (page.includes(key)) {
        return category;
      }
    }
    
    return null;
  }

  private async updateCampaignSpend(campaignId: number, cost: number): Promise<void> {
    await db.update(adCampaigns)
      .set({ spent: sql`${adCampaigns.spent} + ${cost}` })
      .where(eq(adCampaigns.id, campaignId));
  }

  // Subscription-related methods
  async updateUserType(userId: string, userType: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ userType, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateStripeCustomerId(userId: string, stripeCustomerId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ stripeCustomerId, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscription(userId: string, subscriptionData: { userType: string; stripeSubscriptionId: string; subscriptionStatus: string }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        userType: subscriptionData.userType,
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Privacy-compliant analytics tracking
  async trackEvent(eventData: {
    event: string;
    properties: any;
    userId: string;
    timestamp: Date;
    userAgent?: string;
    ip?: string;
    sessionId?: string;
  }): Promise<void> {
    // Implementation would go here - storing in our own database instead of third-party
    console.log('Privacy-compliant analytics event:', eventData);
  }

  // Integration operations
  async updateUserIntegration(userId: string, integration: any): Promise<any> {
    const [userIntegration] = await db
      .insert(userIntegrations)
      .values({
        userId,
        platform: integration.platform,
        accessToken: integration.accessToken,
        refreshToken: integration.refreshToken,
        externalId: integration.externalId,
        externalEmail: integration.email,
        externalName: integration.name,
        shopName: integration.shopName,
        shopUrl: integration.shopUrl,
        venueName: integration.venueName,
        venueUrl: integration.venueUrl,
        clientId: integration.clientId,
        status: integration.status || 'active',
        capabilities: integration.capabilities,
        metadata: integration.metadata,
        lastSyncAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userIntegrations.userId, userIntegrations.platform],
        set: {
          accessToken: integration.accessToken,
          refreshToken: integration.refreshToken,
          externalId: integration.externalId,
          externalEmail: integration.email,
          externalName: integration.name,
          shopName: integration.shopName,
          shopUrl: integration.shopUrl,
          venueName: integration.venueName,
          venueUrl: integration.venueUrl,
          clientId: integration.clientId,
          status: integration.status || 'active',
          capabilities: integration.capabilities,
          metadata: integration.metadata,
          lastSyncAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    
    return userIntegration;
  }

  async getUserIntegrations(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(userIntegrations)
      .where(eq(userIntegrations.userId, userId))
      .orderBy(desc(userIntegrations.createdAt));
  }

  async removeUserIntegration(userId: string, platform: string): Promise<void> {
    await db
      .delete(userIntegrations)
      .where(
        and(
          eq(userIntegrations.userId, userId),
          eq(userIntegrations.platform, platform)
        )
      );
  }

  // Business operations
  async getBusinessById(id: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }
}

export const storage = new DatabaseStorage();
