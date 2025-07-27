import express from 'express';
import { db } from './db';
import { rentalItems, rentalBookings, users } from '../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';
import Stripe from 'stripe';

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-10-28.acacia',
});

// STEP 1: Get unavailable dates for a rental item
router.get('/api/rentals/:itemId/unavailable-dates', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Get all confirmed bookings for this rental item
    const bookings = await db
      .select({ bookingDate: rentalBookings.bookingDate })
      .from(rentalBookings)
      .where(
        and(
          eq(rentalBookings.rentalItemId, itemId),
          eq(rentalBookings.bookingStatus, 'confirmed')
        )
      );
    
    const unavailableDates = bookings.map(booking => booking.bookingDate);
    res.json({ unavailableDates });
  } catch (error) {
    console.error('Error fetching unavailable dates:', error);
    res.status(500).json({ error: 'Failed to fetch unavailable dates' });
  }
});

// STEP 2: Create rental booking with escrow
router.post('/api/rentals/:itemId/book', async (req, res) => {
  try {
    const { itemId } = req.params;
    const { renterId, selectedDates, totalAmount, securityDeposit, cancellationFee, renterNotes } = req.body;
    
    // Get rental item details
    const [rentalItem] = await db
      .select()
      .from(rentalItems)
      .where(eq(rentalItems.id, itemId));
    
    if (!rentalItem) {
      return res.status(404).json({ error: 'Rental item not found' });
    }
    
    // Check if any selected dates are already booked
    const existingBookings = await db
      .select()
      .from(rentalBookings)
      .where(
        and(
          eq(rentalBookings.rentalItemId, itemId),
          inArray(rentalBookings.bookingDate, selectedDates),
          eq(rentalBookings.bookingStatus, 'confirmed')
        )
      );
    
    if (existingBookings.length > 0) {
      return res.status(400).json({ 
        error: 'Some selected dates are no longer available',
        unavailableDates: existingBookings.map(b => b.bookingDate)
      });
    }
    
    // Create Stripe payment intent for escrow
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount + (securityDeposit || 0),
      currency: 'usd',
      capture_method: 'manual', // Hold funds in escrow
      metadata: {
        rentalItemId: itemId,
        renterId,
        type: 'rental_booking'
      }
    });
    
    // Create bookings for each selected date
    const bookingPromises = selectedDates.map(async (date: string) => {
      const [booking] = await db
        .insert(rentalBookings)
        .values({
          rentalItemId: itemId,
          renterId,
          ownerId: rentalItem.ownerId,
          bookingDate: date,
          totalAmount,
          securityDeposit: securityDeposit || 0,
          cancellationFee: cancellationFee || 0,
          paymentIntentId: paymentIntent.id,
          escrowStatus: 'pending',
          bookingStatus: 'confirmed',
          isRefundable: rentalItem.isRefundableCancellation,
          renterNotes: renterNotes || null,
        })
        .returning();
      
      return booking;
    });
    
    const bookings = await Promise.all(bookingPromises);
    
    res.json({
      success: true,
      bookings,
      paymentIntent: {
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      }
    });
  } catch (error) {
    console.error('Error creating rental booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// STEP 3: Get renter's bookings
router.get('/api/rentals/bookings/renter/:renterId', async (req, res) => {
  try {
    const { renterId } = req.params;
    
    const bookings = await db
      .select({
        id: rentalBookings.id,
        bookingDate: rentalBookings.bookingDate,
        totalAmount: rentalBookings.totalAmount,
        escrowStatus: rentalBookings.escrowStatus,
        bookingStatus: rentalBookings.bookingStatus,
        createdAt: rentalBookings.createdAt,
        // Rental item details
        itemTitle: rentalItems.title,
        itemDescription: rentalItems.description,
        // Owner details
        ownerFirstName: users.firstName,
        ownerLastName: users.lastName,
      })
      .from(rentalBookings)
      .leftJoin(rentalItems, eq(rentalBookings.rentalItemId, rentalItems.id))
      .leftJoin(users, eq(rentalBookings.ownerId, users.id))
      .where(eq(rentalBookings.renterId, renterId))
      .orderBy(rentalBookings.createdAt);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching renter bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// STEP 4: Get owner's bookings
router.get('/api/rentals/bookings/owner/:ownerId', async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    const bookings = await db
      .select({
        id: rentalBookings.id,
        bookingDate: rentalBookings.bookingDate,
        totalAmount: rentalBookings.totalAmount,
        escrowStatus: rentalBookings.escrowStatus,
        bookingStatus: rentalBookings.bookingStatus,
        createdAt: rentalBookings.createdAt,
        // Rental item details
        itemTitle: rentalItems.title,
        itemDescription: rentalItems.description,
        // Renter details
        renterFirstName: users.firstName,
        renterLastName: users.lastName,
        renterEmail: users.email,
      })
      .from(rentalBookings)
      .leftJoin(rentalItems, eq(rentalBookings.rentalItemId, rentalItems.id))
      .leftJoin(users, eq(rentalBookings.renterId, users.id))
      .where(eq(rentalBookings.ownerId, ownerId))
      .orderBy(rentalBookings.createdAt);
    
    res.json({ bookings });
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// STEP 5: Cancel booking with escrow refund logic
router.post('/api/rentals/bookings/:bookingId/cancel', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { cancelledBy, cancellationReason } = req.body;
    
    const [booking] = await db
      .select()
      .from(rentalBookings)
      .where(eq(rentalBookings.id, bookingId));
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Calculate refund based on cancellation policy
    let refundAmount = booking.totalAmount;
    if (!booking.isRefundable) {
      // Non-refundable: owner keeps cancellation fee
      refundAmount = booking.totalAmount - booking.cancellationFee;
    }
    
    // Cancel/refund Stripe payment intent
    if (booking.paymentIntentId) {
      await stripe.paymentIntents.cancel(booking.paymentIntentId);
    }
    
    // Update booking status
    const [updatedBooking] = await db
      .update(rentalBookings)
      .set({
        bookingStatus: 'cancelled',
        escrowStatus: 'refunded',
        updatedAt: new Date(),
      })
      .where(eq(rentalBookings.id, bookingId))
      .returning();
    
    res.json({
      success: true,
      booking: updatedBooking,
      refundAmount
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

// STEP 6: Complete rental and release escrow
router.post('/api/rentals/bookings/:bookingId/complete', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    const [booking] = await db
      .select()
      .from(rentalBookings)
      .where(eq(rentalBookings.id, bookingId));
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Capture Stripe payment (release from escrow to owner)
    if (booking.paymentIntentId) {
      await stripe.paymentIntents.capture(booking.paymentIntentId);
    }
    
    // Update booking status
    const [updatedBooking] = await db
      .update(rentalBookings)
      .set({
        bookingStatus: 'completed',
        escrowStatus: 'released',
        updatedAt: new Date(),
      })
      .where(eq(rentalBookings.id, bookingId))
      .returning();
    
    res.json({
      success: true,
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Error completing booking:', error);
    res.status(500).json({ error: 'Failed to complete booking' });
  }
});

export default router;