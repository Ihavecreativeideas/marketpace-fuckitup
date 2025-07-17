import type { Express } from "express";
import express from "express";
import Stripe from 'stripe';
import { db } from "./db";
import { sponsors, sponsorBenefits, aiAssistantTasks } from "../shared/sponsorSchema";
import { notificationService, PurchaseNotificationData } from "./notificationService";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export function registerSponsorshipRoutes(app: Express) {
  
  // Create Stripe checkout session for sponsorship
  app.post('/api/create-sponsor-checkout', async (req, res) => {
    try {
      const { tier, tierName, amount } = req.body;
      
      if (!tier || !tierName || !amount) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `MarketPace ${tierName}`,
                description: `One-time sponsorship to support community commerce`,
                images: ['https://your-domain.com/logo.png'], // Add your logo URL
              },
              unit_amount: amount * 100, // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin || 'http://localhost:5000'}/sponsor-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}/sponsorship.html`,
        metadata: {
          tier: tier,
          tierName: tierName,
          amount: amount.toString()
        }
      });

      res.json({ sessionUrl: session.url });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  });

  // Handle successful sponsorship payment
  app.get('/sponsor-success', async (req, res) => {
    try {
      const { session_id } = req.query;
      
      if (!session_id) {
        return res.redirect('/sponsorship.html?error=no_session');
      }

      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id as string);
      
      if (session.payment_status === 'paid') {
        // Create sponsor record in database
        await createSponsorRecord(session);
        
        // Redirect to success page
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
              <title>Sponsorship Success - MarketPace</title>
              <style>
                  body { font-family: Arial, sans-serif; background: #0d0221; color: white; text-align: center; padding: 50px; }
                  .success-container { max-width: 600px; margin: 0 auto; }
                  .success-icon { font-size: 4rem; color: #4CAF50; margin-bottom: 20px; }
                  h1 { color: #87ceeb; margin-bottom: 20px; }
                  .tier-name { color: #FFD700; font-size: 1.5rem; margin: 20px 0; }
                  .benefits { text-align: left; margin: 30px auto; max-width: 400px; }
                  .benefits li { margin: 10px 0; }
                  .cta-button { 
                      background: linear-gradient(45deg, #4169E1, #87ceeb); 
                      color: white; padding: 15px 30px; border: none; border-radius: 25px; 
                      font-size: 1.1rem; cursor: pointer; margin-top: 30px; text-decoration: none; display: inline-block;
                  }
              </style>
          </head>
          <body>
              <div class="success-container">
                  <div class="success-icon">🎉</div>
                  <h1>Thank You for Your Sponsorship!</h1>
                  <div class="tier-name">${session.metadata?.tierName}</div>
                  <p>Your payment of $${session.metadata?.amount} has been processed successfully.</p>
                  <p>You are now a valued MarketPace sponsor and will receive all tier benefits over the next 12 months.</p>
                  
                  <div class="benefits">
                      <h3>What happens next:</h3>
                      <ul>
                          <li>Welcome email with benefit schedule</li>
                          <li>Admin team will begin fulfilling your perks</li>
                          <li>Monthly check-ins and updates</li>
                          <li>Direct access to founder for feedback</li>
                      </ul>
                  </div>
                  
                  <a href="/community.html" class="cta-button">Explore Community Feed</a>
                  <a href="/pitch-page.html" class="cta-button">Back to Home</a>
              </div>
          </body>
          </html>
        `);
      } else {
        res.redirect('/sponsorship.html?error=payment_failed');
      }
    } catch (error) {
      console.error('Error processing sponsorship success:', error);
      res.redirect('/sponsorship.html?error=processing_failed');
    }
  });

  // Stripe webhook for sponsorship confirmations
  app.post('/api/sponsor-webhook', express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return res.status(400).send('Webhook secret not configured');
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await createSponsorRecord(session);
    }

    res.json({received: true});
  });
}

// Helper function to create sponsor record and benefits
async function createSponsorRecord(session: Stripe.Checkout.Session) {
  try {
    const { tier, tierName, amount } = session.metadata!;
    
    // Get customer details from Stripe
    const customer = await stripe.customers.retrieve(session.customer as string);
    const customerEmail = (customer as Stripe.Customer).email || session.customer_details?.email;
    const customerName = (customer as Stripe.Customer).name || session.customer_details?.name;
    
    // Create sponsor record
    const [newSponsor] = await db.insert(sponsors).values({
      businessName: customerName || 'Business Name',
      contactName: customerName || 'Contact Name',
      email: customerEmail!,
      tier: tier,
      amount: amount,
      stripeCustomerId: session.customer as string,
      status: 'active',
      joinedAt: new Date(),
      totalPaid: parseFloat(amount)
    }).returning();

    // Create monthly benefits for 12 months
    await createSponsorBenefits(newSponsor.id!, tier);
    
    // Send purchase notifications (SMS + Email)
    const notificationData: PurchaseNotificationData = {
      customerName: customerName || 'Valued Sponsor',
      customerEmail: customerEmail || '',
      customerPhone: session.customer_details?.phone || '',
      purchaseType: 'sponsorship',
      itemName: tierName || 'MarketPace Sponsorship',
      amount: parseFloat(amount),
      transactionId: session.id,
    };
    
    await notificationService.sendPurchaseNotifications(notificationData);
    
    console.log(`Sponsor created: ${customerName} - ${tierName} - $${amount}`);
    
  } catch (error) {
    console.error('Error creating sponsor record:', error);
  }
}

// Create tier-specific benefits for 12 months
async function createSponsorBenefits(sponsorId: number, tier: string) {
  const benefitTemplates = {
    supporter: [
      { name: 'Personal Thank-You Letter', type: 'communication', recurring: false },
      { name: 'Community Recognition', type: 'social_media', recurring: true },
      { name: 'MarketPace Backer Badge', type: 'digital_badge', recurring: false }
    ],
    partner: [
      { name: 'Zero Delivery Upcharge', type: 'platform_benefit', recurring: true },
      { name: 'Monthly Check-in', type: 'communication', recurring: true }
    ],
    champion: [
      { name: 'Website Logo Feature', type: 'marketing', recurring: true },
      { name: 'Social Media Shout-out', type: 'social_media', recurring: true },
      { name: 'Custom Business Cards', type: 'physical_marketing', recurring: false },
      { name: 'Monthly Spotlight', type: 'promotion', recurring: true }
    ],
    ambassador: [
      { name: 'Personal Video from Founder', type: 'communication', recurring: false },
      { name: 'Featured Banner Placement', type: 'marketing', recurring: true },
      { name: 'Route Sponsorship', type: 'route_sponsor', recurring: true }
    ],
    legacy: [
      { name: 'Permanent Founding Partner Status', type: 'platform_recognition', recurring: false },
      { name: 'VIP Updates & Roadmap', type: 'communication', recurring: true },
      { name: 'Bi-monthly Route Sponsorship', type: 'route_sponsor', recurring: true },
      { name: 'Press Mentions', type: 'marketing', recurring: true }
    ]
  };

  const benefits = benefitTemplates[tier as keyof typeof benefitTemplates] || [];
  
  for (const benefit of benefits) {
    // Create initial benefit
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // Due in 1 week

    await db.insert(sponsorBenefits).values({
      sponsorId: sponsorId,
      benefitType: benefit.type,
      benefitName: benefit.name,
      dueDate: dueDate,
      isRecurring: benefit.recurring,
      recurringInterval: benefit.recurring ? 'monthly' : undefined,
      priority: 1
    });

    // If recurring, create 11 more monthly benefits
    if (benefit.recurring) {
      for (let month = 1; month < 12; month++) {
        const nextDueDate = new Date();
        nextDueDate.setMonth(nextDueDate.getMonth() + month);
        
        await db.insert(sponsorBenefits).values({
          sponsorId: sponsorId,
          benefitType: benefit.type,
          benefitName: `${benefit.name} - Month ${month + 1}`,
          dueDate: nextDueDate,
          isRecurring: true,
          recurringInterval: 'monthly',
          priority: 2
        });
      }
    }
  }

  // Create AI assistant tasks for high-priority follow-ups
  await db.insert(aiAssistantTasks).values({
    taskType: 'follow_up',
    title: `Welcome new ${tier} sponsor`,
    description: `Send welcome email and begin benefit fulfillment for new sponsor`,
    sponsorId: sponsorId,
    dueDate: new Date(),
    priority: 1
  });
}