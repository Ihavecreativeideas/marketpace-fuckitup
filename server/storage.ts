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
} from "../shared/schema";
import { db } from "./db";
import { eq, desc, and, or, like, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
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
}

export const storage = new DatabaseStorage();
