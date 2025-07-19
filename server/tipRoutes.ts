import { Router } from 'express';
import Stripe from 'stripe';

const router = Router();

// Initialize Stripe
let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-12-18.acacia',
  });
}

// Create payment intent for tip
router.post('/api/tips/create-payment-intent', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const { amount, businessId, employeeId, message, fromUserId, toUserId } = req.body;

    // Validate required fields
    if (!amount || !toUserId) {
      return res.status(400).json({ error: 'Amount and recipient required' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        type: 'tip',
        businessId: businessId || '',
        employeeId: employeeId || '',
        fromUserId: fromUserId || '',
        toUserId: toUserId,
        message: message || '',
      },
      description: `Tip for ${businessId ? 'business' : 'user'} - $${amount}`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error: any) {
    console.error('Error creating tip payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pro member tip settings
router.get('/api/tips/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Return demo tip settings for now
    const tipSettings = {
      tipsEnabled: true,
      defaultTipAmounts: [5, 10, 20, 50],
      tipButtonText: 'Tip Us!',
      stripeOnboardingComplete: true // For demo purposes
    };

    res.json(tipSettings);

  } catch (error: any) {
    console.error('Error fetching tip settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update pro member tip settings
router.post('/api/tips/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { tipsEnabled, defaultTipAmounts, tipButtonText } = req.body;

    // For demo purposes, just return success
    const updatedSettings = {
      tipsEnabled: tipsEnabled !== undefined ? tipsEnabled : true,
      defaultTipAmounts: defaultTipAmounts || [5, 10, 20, 50],
      tipButtonText: tipButtonText || 'Tip Us!',
      stripeOnboardingComplete: true
    };

    res.json({
      success: true,
      settings: updatedSettings
    });

  } catch (error: any) {
    console.error('Error updating tip settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle successful tip payments
router.post('/api/tips/webhook', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripe not configured' });
    }

    const event = req.body;

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        
        if (paymentIntent.metadata?.type === 'tip') {
          console.log('Tip payment successful:', {
            amount: paymentIntent.amount,
            from: paymentIntent.metadata.fromUserId,
            to: paymentIntent.metadata.toUserId,
            business: paymentIntent.metadata.businessId,
            message: paymentIntent.metadata.message
          });

          // Here you would normally:
          // 1. Save tip to database
          // 2. Transfer funds to recipient's Stripe Connect account
          // 3. Send notification to recipient
          // 4. Send thank you message to tipper
        }
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error: any) {
    console.error('Error handling tip webhook:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get tips received by a user/business
router.get('/api/tips/received/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Return demo tips data
    const tips = [
      {
        id: '1',
        amount: 2000, // $20.00
        message: 'Great service!',
        fromUser: 'Anonymous',
        createdAt: new Date().toISOString(),
        status: 'completed'
      },
      {
        id: '2',
        amount: 1000, // $10.00
        message: 'Thank you!',
        fromUser: 'Customer',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        status: 'completed'
      }
    ];

    const totalTips = tips.reduce((sum, tip) => sum + tip.amount, 0);

    res.json({
      tips,
      totalTips,
      totalTipsFormatted: `$${(totalTips / 100).toFixed(2)}`
    });

  } catch (error: any) {
    console.error('Error fetching received tips:', error);
    res.status(500).json({ error: error.message });
  }
});

export { router as tipRoutes };