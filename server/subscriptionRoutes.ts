import type { Express } from "express";
import Stripe from "stripe";
import { storage } from "./storage";
import { isAuthenticated } from "./replitAuth";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Campaign management
interface CampaignSettings {
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
  lifetimeProEnabled: boolean;
}

class CampaignManager {
  private static settings: CampaignSettings = {
    isActive: true, // Campaign is active by default
    startDate: new Date(),
    lifetimeProEnabled: true
  };

  static getCampaignStatus(): CampaignSettings {
    return this.settings;
  }

  static endCampaign(): void {
    this.settings.isActive = false;
    this.settings.endDate = new Date();
    this.settings.lifetimeProEnabled = false;
  }

  static startCampaign(): void {
    this.settings.isActive = true;
    this.settings.lifetimeProEnabled = true;
  }

  static isLifetimeProAvailable(): boolean {
    return this.settings.isActive && this.settings.lifetimeProEnabled;
  }
}

export function registerSubscriptionRoutes(app: Express): void {
  // Get campaign status
  app.get('/api/campaign/status', (req, res) => {
    const status = CampaignManager.getCampaignStatus();
    res.json(status);
  });

  // Admin endpoint to end campaign (this would normally require admin auth)
  app.post('/api/admin/campaign/end', isAuthenticated, async (req, res) => {
    try {
      CampaignManager.endCampaign();
      res.json({ 
        success: true, 
        message: 'Campaign ended. New users will be charged $3.99/month.',
        campaignStatus: CampaignManager.getCampaignStatus()
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to end campaign: ' + error.message 
      });
    }
  });

  // Admin endpoint to start campaign
  app.post('/api/admin/campaign/start', isAuthenticated, async (req, res) => {
    try {
      CampaignManager.startCampaign();
      res.json({ 
        success: true, 
        message: 'Campaign started. New users get lifetime Pro access.',
        campaignStatus: CampaignManager.getCampaignStatus()
      });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: 'Failed to start campaign: ' + error.message 
      });
    }
  });

  // Upgrade user to Pro (during campaign: free, after campaign: $3.99/month)
  app.post('/api/subscription/upgrade', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.userType === 'dual') {
        return res.json({ 
          success: true, 
          message: 'User already has Pro access',
          userType: 'dual'
        });
      }

      const isLifetimeFree = CampaignManager.isLifetimeProAvailable();

      if (isLifetimeFree) {
        // Free upgrade during campaign
        await storage.updateUserType(userId, 'dual');
        
        res.json({
          success: true,
          message: 'Congratulations! You now have lifetime Pro access.',
          userType: 'dual',
          isLifetime: true,
          campaignUpgrade: true
        });
      } else {
        // Paid subscription after campaign
        if (!user.email) {
          return res.status(400).json({ message: 'Email required for paid subscription' });
        }

        // Create Stripe customer if doesn't exist
        let customerId = user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: { userId: userId }
          });
          customerId = customer.id;
          await storage.updateStripeCustomerId(userId, customerId);
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: customerId,
          items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'MarketPlace Pro',
                description: 'Dual account with business features'
              },
              unit_amount: 399, // $3.99 in cents
              recurring: {
                interval: 'month'
              }
            }
          }],
          payment_behavior: 'default_incomplete',
          expand: ['latest_invoice.payment_intent']
        });

        // Update user with subscription info
        await storage.updateUserSubscription(userId, {
          userType: 'dual',
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: 'active'
        });

        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntent = invoice?.payment_intent as Stripe.PaymentIntent;

        res.json({
          success: true,
          message: 'Pro subscription created',
          userType: 'dual',
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
          isLifetime: false,
          monthlyPrice: 3.99
        });
      }
    } catch (error: any) {
      console.error('Subscription upgrade error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to upgrade subscription: ' + error.message 
      });
    }
  });

  // Cancel subscription
  app.post('/api/subscription/cancel', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({ message: 'No active subscription found' });
      }

      // Cancel at period end (don't immediately revoke access)
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });

      res.json({
        success: true,
        message: 'Subscription will be cancelled at the end of the billing period',
        cancelAtPeriodEnd: true
      });
    } catch (error: any) {
      console.error('Subscription cancellation error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to cancel subscription: ' + error.message 
      });
    }
  });

  // Get subscription status
  app.get('/api/subscription/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      let subscriptionDetails = null;
      
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        subscriptionDetails = {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          amount: subscription.items.data[0]?.price?.unit_amount / 100 || 3.99
        };
      }

      res.json({
        userType: user.userType,
        isPro: user.userType === 'dual',
        isLifetime: !user.stripeSubscriptionId && user.userType === 'dual',
        subscription: subscriptionDetails,
        campaignStatus: CampaignManager.getCampaignStatus()
      });
    } catch (error: any) {
      console.error('Subscription status error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get subscription status: ' + error.message 
      });
    }
  });

  // Webhook for handling Stripe events
  app.post('/api/webhooks/stripe', async (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );

      switch (event.type) {
        case 'invoice.payment_succeeded':
          const invoice = event.data.object as Stripe.Invoice;
          // Handle successful payment
          break;
          
        case 'invoice.payment_failed':
          const failedInvoice = event.data.object as Stripe.Invoice;
          // Handle failed payment - potentially downgrade user
          break;
          
        case 'customer.subscription.deleted':
          const deletedSub = event.data.object as Stripe.Subscription;
          // Handle subscription cancellation - downgrade user to personal
          if (deletedSub.metadata?.userId) {
            await storage.updateUserType(deletedSub.metadata.userId, 'personal');
          }
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Webhook signature verification failed' });
    }
  });
}

export { CampaignManager };