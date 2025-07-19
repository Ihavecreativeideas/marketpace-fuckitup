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
      const { 
        tier, 
        tierName, 
        amount, 
        businessName, 
        contactName, 
        email, 
        phone, 
        address, 
        website, 
        socialMedia, 
        businessDescription, 
        logoData 
      } = req.body;
      
      if (!tier || !tierName || !amount || !businessName || !contactName || !email || !phone || !address) {
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
                name: `MarketPace ${tierName} Sponsorship`,
                description: `${businessName} - ${tierName} sponsorship to support community commerce`,
              },
              unit_amount: amount * 100, // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: email,
        success_url: `${req.headers.origin || 'http://localhost:5000'}/sponsor-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin || 'http://localhost:5000'}/sponsor-form.html?tier=${tier}&tierName=${encodeURIComponent(tierName)}&amount=${amount}`,
        metadata: {
          tier: tier,
          tierName: tierName,
          amount: amount.toString(),
          businessName: businessName,
          contactName: contactName,
          email: email,
          phone: phone,
          address: address,
          website: website || '',
          socialMedia: socialMedia || '',
          businessDescription: businessDescription || '',
          logoData: logoData || ''
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
    const { 
      tier, 
      tierName, 
      amount, 
      businessName, 
      contactName, 
      email, 
      phone, 
      address, 
      website, 
      socialMedia, 
      businessDescription, 
      logoData 
    } = session.metadata!;
    
    // Parse social media JSON if it exists
    let socialMediaObject = null;
    if (socialMedia) {
      try {
        // Parse social media links from textarea format
        const lines = socialMedia.split('\n').filter(line => line.trim());
        socialMediaObject = {};
        lines.forEach(line => {
          if (line.includes(':')) {
            const [platform, url] = line.split(':').map(s => s.trim());
            socialMediaObject[platform.toLowerCase()] = url;
          }
        });
      } catch (e) {
        console.log('Error parsing social media:', e);
      }
    }
    
    // Create sponsor record with full information
    const [newSponsor] = await db.insert(sponsors).values({
      businessName: businessName || 'Business Name',
      contactName: contactName || 'Contact Name',
      email: email,
      phone: phone,
      businessAddress: address,
      website: website || null,
      logoUrl: logoData || null, // Store base64 data temporarily, could be uploaded to CDN later
      tier: tier,
      amount: amount,
      stripeCustomerId: session.customer as string,
      status: 'active',
      joinedAt: new Date(),
      totalPaid: parseFloat(amount),
      businessDescription: businessDescription || null,
      socialMedia: socialMediaObject
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
      { name: '6 months without sustainability fees', type: 'platform_benefit', recurring: false },
      { name: '12 months free pro features', type: 'platform_benefit', recurring: false },
      { name: 'Community supporter badge', type: 'digital_badge', recurring: false },
      { name: 'Basic analytics dashboard', type: 'platform_feature', recurring: true }
    ],
    partner: [
      { name: 'Homepage logo placement', type: 'marketing', recurring: true },
      { name: 'Quarterly business showcase', type: 'promotion', recurring: true },
      { name: 'Priority customer support', type: 'support', recurring: true },
      { name: 'Local event promotion', type: 'marketing', recurring: true }
    ],
    champion: [
      { name: 'Lifetime Free Subscription', type: 'platform_benefit', recurring: false },
      { name: 'Featured sponsor section with champion badge', type: 'marketing', recurring: true },
      { name: 'Co-branded marketing materials', type: 'physical_marketing', recurring: false },
      { name: 'MarketPace Merch', type: 'physical_marketing', recurring: false },
      { name: 'Social media features', type: 'social_media', recurring: true }
    ],
    ambassador: [
      { name: 'Exclusive event sponsorships', type: 'event_sponsor', recurring: true },
      { name: 'Premium placement in all channels', type: 'marketing', recurring: true },
      { name: 'Custom integration opportunities', type: 'platform_integration', recurring: true },
      { name: 'Custom video ads', type: 'video_marketing', recurring: true },
      { name: 'Custom radar effects (like Browns Painting)', type: 'platform_customization', recurring: false }
    ],
    legacy: [
      { name: 'Permanent legacy recognition', type: 'platform_recognition', recurring: false },
      { name: 'First access to new features', type: 'platform_feature', recurring: true },
      { name: 'Lifetime sponsor benefits', type: 'platform_benefit', recurring: false }
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