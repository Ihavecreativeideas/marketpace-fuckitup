import {
  users,
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
}

export const storage = new DatabaseStorage();
