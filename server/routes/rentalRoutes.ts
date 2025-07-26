import type { Express } from "express";
import Stripe from "stripe";
import { storage } from "../storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export function setupRentalRoutes(app: Express) {
  
  // Create rental item
  app.post("/api/rentals", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const rentalData = {
        ownerId: req.user.id,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        hourlyRate: req.body.hourlyRate ? Math.round(req.body.hourlyRate * 100) : null,
        dailyRate: req.body.dailyRate ? Math.round(req.body.dailyRate * 100) : null,
        weeklyRate: req.body.weeklyRate ? Math.round(req.body.weeklyRate * 100) : null,
        monthlyRate: req.body.monthlyRate ? Math.round(req.body.monthlyRate * 100) : null,
        securityDeposit: req.body.securityDeposit ? Math.round(req.body.securityDeposit * 100) : null,
        cancellationFee: req.body.cancellationFee ? Math.round(req.body.cancellationFee * 100) : null,
        isRefundableCancellation: req.body.isRefundableCancellation || false,
        cancellationPolicy: req.body.cancellationPolicy,
        minRentalDuration: req.body.minRentalDuration || 1,
        maxRentalDuration: req.body.maxRentalDuration,
        location: req.body.location,
        address: req.body.address,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        images: req.body.images || [],
      };

      const rental = await storage.createRentalItem(rentalData);
      
      // Set default availability if provided
      if (req.body.availability && req.body.availability.length > 0) {
        const availabilityData = req.body.availability.map((slot: any) => ({
          rentalItemId: rental.id,
          date: new Date(slot.date),
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: slot.isAvailable !== false,
          customRate: slot.customRate ? Math.round(slot.customRate * 100) : null,
          notes: slot.notes,
        }));
        
        await storage.setRentalAvailability(availabilityData);
      }

      res.json(rental);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get rental item
  app.get("/api/rentals/:id", async (req, res) => {
    try {
      const rental = await storage.getRentalItem(req.params.id);
      if (!rental) {
        return res.status(404).json({ error: "Rental not found" });
      }
      res.json(rental);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get rental availability
  app.get("/api/rentals/:id/availability", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ error: "Start date and end date required" });
      }

      const availability = await storage.getRentalAvailability(
        req.params.id,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Set rental availability
  app.post("/api/rentals/:id/availability", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const rental = await storage.getRentalItem(req.params.id);
      if (!rental) {
        return res.status(404).json({ error: "Rental not found" });
      }

      if (rental.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const availabilityData = req.body.availability.map((slot: any) => ({
        rentalItemId: req.params.id,
        date: new Date(slot.date),
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable !== false,
        customRate: slot.customRate ? Math.round(slot.customRate * 100) : null,
        notes: slot.notes,
      }));

      const availability = await storage.setRentalAvailability(availabilityData);
      res.json(availability);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create rental booking with escrow
  app.post("/api/rentals/:id/book", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const rental = await storage.getRentalItem(req.params.id);
      if (!rental) {
        return res.status(404).json({ error: "Rental not found" });
      }

      if (rental.ownerId === req.user.id) {
        return res.status(400).json({ error: "Cannot book your own rental" });
      }

      const { startDate, endDate, startTime, endTime, specialInstructions, pickupMethod, deliveryAddress } = req.body;
      
      // Calculate total amount
      const start = new Date(startDate);
      const end = new Date(endDate);
      const durationHours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
      const durationDays = Math.ceil(durationHours / 24);
      
      let totalAmount = 0;
      if (rental.hourlyRate && durationHours <= 24) {
        totalAmount = rental.hourlyRate * durationHours;
      } else if (rental.dailyRate) {
        totalAmount = rental.dailyRate * durationDays;
      } else {
        return res.status(400).json({ error: "No applicable rate found" });
      }

      // Create Stripe PaymentIntent for escrow
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount + (rental.securityDeposit || 0),
        currency: "usd",
        capture_method: "manual", // Hold the payment in escrow
        metadata: {
          rental_id: rental.id,
          renter_id: req.user.id,
          owner_id: rental.ownerId,
        },
      });

      // Create booking
      const booking = await storage.createRentalBooking({
        rentalItemId: rental.id,
        renterId: req.user.id,
        ownerId: rental.ownerId,
        startDate: start,
        endDate: end,
        startTime,
        endTime,
        totalAmount,
        securityDeposit: rental.securityDeposit || 0,
        cancellationFee: rental.cancellationFee || 0,
        stripePaymentIntentId: paymentIntent.id,
        escrowStatus: 'pending',
        bookingStatus: 'confirmed',
        specialInstructions,
        pickupMethod: pickupMethod || 'pickup',
        deliveryAddress,
      });

      res.json({
        booking,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's rental bookings
  app.get("/api/bookings/renter", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const bookings = await storage.getRentalBookingsByRenter(req.user.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get owner's rental bookings
  app.get("/api/bookings/owner", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const bookings = await storage.getRentalBookingsByOwner(req.user.id);
      res.json(bookings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel booking
  app.post("/api/bookings/:id/cancel", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const booking = await storage.getRentalBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.renterId !== req.user.id && booking.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const { reason } = req.body;
      const cancellationFee = booking.cancellationFee || 0;
      
      // Handle Stripe refund minus cancellation fee
      if (booking.stripePaymentIntentId) {
        const paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
        if (paymentIntent.status === 'requires_capture') {
          await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
        }
      }

      const updatedBooking = await storage.updateRentalBooking(req.params.id, {
        bookingStatus: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
        cancelledBy: req.user.id === booking.renterId ? 'renter' : 'owner',
        escrowStatus: 'refunded',
      });

      res.json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete rental (release escrow)
  app.post("/api/bookings/:id/complete", async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const booking = await storage.getRentalBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.ownerId !== req.user.id) {
        return res.status(403).json({ error: "Only owner can complete rental" });
      }

      // Release escrow payment
      if (booking.stripePaymentIntentId) {
        await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
      }

      const updatedBooking = await storage.updateRentalBooking(req.params.id, {
        bookingStatus: 'completed',
        escrowStatus: 'released',
      });

      res.json(updatedBooking);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

}