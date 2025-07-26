import {
  users,
  events,
  rentalItems,
  rentalAvailability,
  rentalBookings,
  communityPosts,
  type User,
  type UpsertUser,
  type RentalItem,
  type InsertRentalItem,
  type RentalAvailability,
  type InsertRentalAvailability,
  type RentalBooking,
  type InsertRentalBooking,
  type CommunityPost,
  type InsertCommunityPost,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  
  // Rental items
  createRentalItem(insertRental: InsertRentalItem): Promise<RentalItem>;
  getRentalItem(id: string): Promise<RentalItem | undefined>;
  getRentalItemsByOwner(ownerId: string): Promise<RentalItem[]>;
  updateRentalItem(id: string, updates: Partial<RentalItem>): Promise<RentalItem>;
  
  // Rental availability
  setRentalAvailability(availability: InsertRentalAvailability[]): Promise<RentalAvailability[]>;
  getRentalAvailability(rentalItemId: string, startDate: Date, endDate: Date): Promise<RentalAvailability[]>;
  
  // Rental bookings
  createRentalBooking(booking: InsertRentalBooking): Promise<RentalBooking>;
  getRentalBooking(id: string): Promise<RentalBooking | undefined>;
  getRentalBookingsByRenter(renterId: string): Promise<RentalBooking[]>;
  getRentalBookingsByOwner(ownerId: string): Promise<RentalBooking[]>;
  updateRentalBooking(id: string, updates: Partial<RentalBooking>): Promise<RentalBooking>;
  
  // Community posts
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  getCommunityPosts(limit?: number, offset?: number): Promise<CommunityPost[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firstName, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: UpsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Rental items
  async createRentalItem(insertRental: InsertRentalItem): Promise<RentalItem> {
    const [rental] = await db.insert(rentalItems).values(insertRental).returning();
    return rental;
  }

  async getRentalItem(id: string): Promise<RentalItem | undefined> {
    const [rental] = await db.select().from(rentalItems).where(eq(rentalItems.id, id));
    return rental || undefined;
  }

  async getRentalItemsByOwner(ownerId: string): Promise<RentalItem[]> {
    return await db.select().from(rentalItems).where(eq(rentalItems.ownerId, ownerId));
  }

  async updateRentalItem(id: string, updates: Partial<RentalItem>): Promise<RentalItem> {
    const [rental] = await db
      .update(rentalItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rentalItems.id, id))
      .returning();
    return rental;
  }

  // Rental availability
  async setRentalAvailability(availability: InsertRentalAvailability[]): Promise<RentalAvailability[]> {
    return await db.insert(rentalAvailability).values(availability).returning();
  }

  async getRentalAvailability(rentalItemId: string, startDate: Date, endDate: Date): Promise<RentalAvailability[]> {
    return await db
      .select()
      .from(rentalAvailability)
      .where(
        and(
          eq(rentalAvailability.rentalItemId, rentalItemId),
          gte(rentalAvailability.date, startDate),
          lte(rentalAvailability.date, endDate)
        )
      );
  }

  // Rental bookings
  async createRentalBooking(booking: InsertRentalBooking): Promise<RentalBooking> {
    const [newBooking] = await db.insert(rentalBookings).values(booking).returning();
    return newBooking;
  }

  async getRentalBooking(id: string): Promise<RentalBooking | undefined> {
    const [booking] = await db.select().from(rentalBookings).where(eq(rentalBookings.id, id));
    return booking || undefined;
  }

  async getRentalBookingsByRenter(renterId: string): Promise<RentalBooking[]> {
    return await db
      .select()
      .from(rentalBookings)
      .where(eq(rentalBookings.renterId, renterId))
      .orderBy(desc(rentalBookings.createdAt));
  }

  async getRentalBookingsByOwner(ownerId: string): Promise<RentalBooking[]> {
    return await db
      .select()
      .from(rentalBookings)
      .where(eq(rentalBookings.ownerId, ownerId))
      .orderBy(desc(rentalBookings.createdAt));
  }

  async updateRentalBooking(id: string, updates: Partial<RentalBooking>): Promise<RentalBooking> {
    const [booking] = await db
      .update(rentalBookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rentalBookings.id, id))
      .returning();
    return booking;
  }

  // Community posts
  async createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost> {
    const [newPost] = await db.insert(communityPosts).values(post).returning();
    return newPost;
  }

  async getCommunityPosts(limit: number = 50, offset: number = 0): Promise<CommunityPost[]> {
    return await db
      .select()
      .from(communityPosts)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

export const storage = new DatabaseStorage();