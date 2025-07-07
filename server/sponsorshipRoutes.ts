import type { Express } from "express";
import Stripe from "stripe";
import { db } from "./db";
import { sponsors, sponsorBenefits, routeSponsorships, spotlightCalendar, aiAssistantTasks } from "../shared/sponsorSchema";
import { eq, and, desc, asc } from "drizzle-orm";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Sponsorship tier configurations
const SPONSORSHIP_TIERS = {
  supporter: {
    name: "Supporter",
    price: 25,
    currency: "usd",
    interval: "one_time",
    benefits: [
      "Thank-you email",
      "Public Thank You on MarketPace Community Feed",
      "Recognition as a MarketPace Backer"
    ]
  },
  starter: {
    name: "Starter Sponsor",
    price: 100,
    currency: "usd", 
    interval: "one_time",
    benefits: [
      "Lifetime MarketPace Pro membership",
      "Sponsor badge in web & app profile",
      "Shout-out on social media",
      "Listed in Supporter Wall"
    ]
  },
  community: {
    name: "Community Sponsor",
    price: 500,
    currency: "usd",
    interval: "one_time",
    benefits: [
      "No added delivery fees (1 year)",
      "100 QR-coded business cards",
      "Vinyl MarketPace Partner window sticker",
      "Co-branded tote bags",
      "Featured on landing page & sponsor page",
      "Live Mention at Local Events",
      "Gift bag insert for select drop-offs",
      "Pace Partner of the Month promotion",
      "Blog feature + backlink to website",
      "Beta access to upcoming tools & features"
    ]
  },
  ambassador: {
    name: "Ambassador Sponsor",
    price: 1000,
    currency: "usd",
    interval: "one_time",
    benefits: [
      "Personalized video shout-out from founder",
      "Featured business banner in app + web homepage",
      "Special Ambassador badge in app",
      "Custom social promo for business",
      "Route Sponsorship (1x/month)",
      "Monthly social promotion"
    ]
  },
  legacy: {
    name: "Legacy Sponsor",
    price: 2500,
    currency: "usd",
    interval: "one_time",
    benefits: [
      "Founding Partner status (permanent)",
      "Monthly social promotion (12 months)",
      "VIP founder updates & roadmap access",
      "Press mention & rollout announcements",
      "Invite to future MarketPace Partner events",
      "Priority feature request queue",
      "2 Route Sponsorships per month"
    ]
  }
};

// Create sponsor benefits when sponsor signs up
async function createSponsorBenefits(sponsorId: number, tier: string) {
  const tierConfig = SPONSORSHIP_TIERS[tier as keyof typeof SPONSORSHIP_TIERS];
  if (!tierConfig) return;

  const benefits = tierConfig.benefits.map(benefit => ({
    sponsorId,
    benefitType: benefit.toLowerCase().replace(/\s+/g, '_'),
    benefitName: benefit,
    description: `${benefit} for ${tierConfig.name}`,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    priority: tier === 'legacy' ? 1 : tier === 'ambassador' ? 1 : 2
  }));

  await db.insert(sponsorBenefits).values(benefits);

  // Create AI assistant tasks for high-priority sponsors
  if (tier === 'ambassador' || tier === 'legacy') {
    await db.insert(aiAssistantTasks).values([
      {
        taskType: 'reminder',
        title: `Welcome ${tierConfig.name} - Schedule video call`,
        description: `New ${tierConfig.name} signed up. Schedule welcome call and video shout-out within 48 hours.`,
        sponsorId,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000),
        priority: 1
      }
    ]);
  }

  // Create monthly spotlight calendar entries for eligible tiers
  if (tier === 'community' || tier === 'ambassador' || tier === 'legacy') {
    const currentDate = new Date();
    const months = tier === 'legacy' ? 12 : 1;
    
    for (let i = 0; i < months; i++) {
      const targetDate = new Date(currentDate);
      targetDate.setMonth(currentDate.getMonth() + i + 1);
      
      await db.insert(spotlightCalendar).values({
        sponsorId,
        month: targetDate.getMonth() + 1,
        year: targetDate.getFullYear(),
        spotlightType: 'pace_partner_month'
      });
    }
  }
}

export function registerSponsorshipRoutes(app: Express): void {
  
  // Get sponsorship tiers for checkout page
  app.get('/api/sponsorship/tiers', (req, res) => {
    res.json(SPONSORSHIP_TIERS);
  });

  // Create Stripe checkout session for sponsorship
  app.post('/api/sponsorship/create-checkout', async (req, res) => {
    try {
      const { tier, businessInfo } = req.body;
      const tierConfig = SPONSORSHIP_TIERS[tier as keyof typeof SPONSORSHIP_TIERS];
      
      if (!tierConfig) {
        return res.status(400).json({ error: 'Invalid sponsorship tier' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: tierConfig.currency,
              product_data: {
                name: `MarketPace ${tierConfig.name}`,
                description: `Support local community marketplace - ${tierConfig.benefits.length} benefits included`,
                images: [] // Add logo URL here if available
              },
              unit_amount: tierConfig.price * 100, // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${req.headers.origin}/sponsorship/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/sponsorship`,
        metadata: {
          tier,
          businessName: businessInfo.businessName,
          contactName: businessInfo.contactName,
          email: businessInfo.email
        },
        customer_email: businessInfo.email
      });

      res.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Handle successful payment and create sponsor record
  app.post('/api/sponsorship/payment-success', async (req, res) => {
    try {
      const { sessionId } = req.body;
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        const { tier, businessName, contactName, email } = session.metadata!;
        const tierConfig = SPONSORSHIP_TIERS[tier as keyof typeof SPONSORSHIP_TIERS];
        
        // Create sponsor record
        const [sponsor] = await db.insert(sponsors).values({
          businessName,
          contactName,
          email,
          tier,
          amount: tierConfig.price.toString(),
          stripeCustomerId: session.customer as string,
          status: 'active',
          totalPaid: tierConfig.price.toString(),
          joinedAt: new Date()
        }).returning();

        // Create benefits and tasks
        await createSponsorBenefits(sponsor.id, tier);

        res.json({ success: true, sponsor });
      } else {
        res.status(400).json({ error: 'Payment not completed' });
      }
    } catch (error: any) {
      console.error('Payment success handling error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get all sponsors for admin dashboard
  app.get('/api/admin/sponsors', async (req, res) => {
    try {
      const allSponsors = await db.select().from(sponsors).orderBy(desc(sponsors.joinedAt));
      res.json(allSponsors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get sponsor details with benefits
  app.get('/api/admin/sponsors/:id', async (req, res) => {
    try {
      const sponsorId = parseInt(req.params.id);
      
      const [sponsor] = await db.select().from(sponsors).where(eq(sponsors.id, sponsorId));
      if (!sponsor) {
        return res.status(404).json({ error: 'Sponsor not found' });
      }

      const benefits = await db.select().from(sponsorBenefits)
        .where(eq(sponsorBenefits.sponsorId, sponsorId))
        .orderBy(asc(sponsorBenefits.dueDate));

      const spotlights = await db.select().from(spotlightCalendar)
        .where(eq(spotlightCalendar.sponsorId, sponsorId))
        .orderBy(asc(spotlightCalendar.year), asc(spotlightCalendar.month));

      const routes = await db.select().from(routeSponsorships)
        .where(eq(routeSponsorships.sponsorId, sponsorId))
        .orderBy(desc(routeSponsorships.routeDate));

      res.json({ sponsor, benefits, spotlights, routes });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mark benefit as completed
  app.post('/api/admin/benefits/:id/complete', async (req, res) => {
    try {
      const benefitId = parseInt(req.params.id);
      const { notes, completedBy } = req.body;
      
      await db.update(sponsorBenefits)
        .set({ 
          completedAt: new Date(),
          notes,
          completedBy: completedBy || 'Admin'
        })
        .where(eq(sponsorBenefits.id, benefitId));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get AI assistant dashboard
  app.get('/api/admin/ai-assistant', async (req, res) => {
    try {
      const tasks = await db.select().from(aiAssistantTasks)
        .where(eq(aiAssistantTasks.isCompleted, false))
        .orderBy(asc(aiAssistantTasks.priority), asc(aiAssistantTasks.dueDate));

      const upcomingSpotlights = await db.select({
        id: spotlightCalendar.id,
        sponsorId: spotlightCalendar.sponsorId,
        month: spotlightCalendar.month,
        year: spotlightCalendar.year,
        spotlightType: spotlightCalendar.spotlightType,
        businessName: sponsors.businessName,
        tier: sponsors.tier
      })
      .from(spotlightCalendar)
      .leftJoin(sponsors, eq(spotlightCalendar.sponsorId, sponsors.id))
      .where(eq(spotlightCalendar.isCompleted, false))
      .orderBy(asc(spotlightCalendar.year), asc(spotlightCalendar.month));

      res.json({ tasks, upcomingSpotlights });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new AI task
  app.post('/api/admin/ai-assistant/tasks', async (req, res) => {
    try {
      const { title, description, sponsorId, dueDate, priority } = req.body;
      
      const [task] = await db.insert(aiAssistantTasks).values({
        taskType: 'manual',
        title,
        description,
        sponsorId: sponsorId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 2
      }).returning();

      res.json(task);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete AI task
  app.post('/api/admin/ai-assistant/tasks/:id/complete', async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      
      await db.update(aiAssistantTasks)
        .set({ 
          isCompleted: true,
          completedAt: new Date()
        })
        .where(eq(aiAssistantTasks.id, taskId));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update sponsor information
  app.put('/api/admin/sponsors/:id', async (req, res) => {
    try {
      const sponsorId = parseInt(req.params.id);
      const updates = req.body;
      
      await db.update(sponsors)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(sponsors.id, sponsorId));

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}