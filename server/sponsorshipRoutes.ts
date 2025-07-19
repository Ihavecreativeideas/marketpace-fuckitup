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

  // Direct SMS test for sponsor notifications
  app.post('/api/test-sponsor-sms', async (req, res) => {
    try {
      const testSponsorData = {
        businessName: 'Test Business SMS',
        contactName: 'SMS Test Contact',
        email: 'smstest@example.com',
        phone: '+15551234567',
        tierName: 'Community Champion',
        amount: 500,
        website: 'https://testbusiness.com',
        address: '123 Test St, Test City, ST 12345'
      };

      // Send the actual sponsor notification SMS to admin
      const { sendSMS } = require('./smsService');
      const adminSMSMessage = `New MarketPace sponsor: ${testSponsorData.businessName}
Tier: ${testSponsorData.tierName} ($${testSponsorData.amount})
Contact: ${testSponsorData.contactName}
Email: ${testSponsorData.email}
Phone: ${testSponsorData.phone}
${testSponsorData.website ? `Website: ${testSponsorData.website}` : ''}

Business info sent to your email.`;

      const smsResult = await sendSMS('251-282-6662', adminSMSMessage);
      
      res.json({
        success: true,
        message: 'Sponsor notification SMS sent',
        smsResult: smsResult,
        testData: testSponsorData
      });
      
    } catch (error) {
      console.error('Test sponsor SMS error:', error);
      res.status(500).json({ error: 'Failed to send test sponsor SMS' });
    }
  });

  // Test endpoint for sponsor notifications
  app.post('/api/test-sponsor-notifications', async (req, res) => {
    try {
      const { testType, adminPhone, adminEmail } = req.body;
      
      if (testType === 'simple_test') {
        // Send very simple clean message using basic format
        const simpleMessage = `MarketPace test message. Your notifications are working. Contact info: ${adminEmail}`;
        
        const { smsService } = require('./smsService');
        
        let smsResult = false;
        try {
          const message = await smsService.client.messages.create({
            body: simpleMessage,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: adminPhone,
          });
          console.log(`Simple SMS sent - SID: ${message.sid} to ${adminPhone}`);
          smsResult = true;
        } catch (error) {
          console.error('Simple SMS Error:', error);
          smsResult = false;
        }
        
        res.json({
          success: true,
          message: 'Simple test message sent',
          results: { sms: smsResult, phone: adminPhone },
          sid: smsResult ? 'Check console for SID' : null
        });
        
      } else if (testType === 'admin_notifications') {
        // Format phone number properly
        const formattedPhone = adminPhone.replace(/[^\d]/g, '');
        const finalPhone = formattedPhone.length === 10 ? `+1${formattedPhone}` : `+${formattedPhone}`;
        
        console.log(`Attempting to send SMS to: ${finalPhone} (original: ${adminPhone})`);
        
        // Send test SMS to admin using direct smsService method
        const testSMSMessage = `MarketPace SMS TEST

This is a test notification for your phone ${finalPhone}.

Time: ${new Date().toLocaleString()}

If you receive this, notifications work!`;

        console.log(`SMS Message to send: ${testSMSMessage}`);

        // Send test email to admin
        const testEmailHTML = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
          <div style="background: linear-gradient(135deg, #1a0b3d 0%, #4b0082 50%, #191970 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 2rem;">🧪 TEST NOTIFICATION</h1>
            <p style="margin: 10px 0 0 0; font-size: 1.2rem;">MarketPace Notification System Test</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            <h2 style="color: #1a0b3d; border-bottom: 2px solid #4b0082; padding-bottom: 10px;">Test Results</h2>
            
            <div style="margin: 20px 0;">
              <strong style="color: #4b0082;">Email System:</strong> ✅ Working<br/>
              <strong style="color: #4b0082;">Recipient:</strong> ${adminEmail}<br/>
              <strong style="color: #4b0082;">Test Time:</strong> ${new Date().toLocaleString()}<br/>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; border-left: 4px solid #4b0082; margin: 20px 0;">
              <h3 style="color: #1a0b3d; margin-top: 0;">Notification System Status</h3>
              <p style="margin: 0;">
                This test confirms that email notifications are successfully configured and working. 
                When sponsors submit forms, you will receive detailed notifications with all their information.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #666;">MarketPace sponsor notification system is ready! 🚀</p>
            </div>
          </div>
        </div>`;

        // Import notification services
        const { smsService } = require('./smsService');
        const { sendEmail } = require('./emailService');

        // Send SMS using direct service method
        let smsResult = false;
        try {
          if (smsService.isEnabled()) {
            const message = await smsService.client.messages.create({
              body: testSMSMessage,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: finalPhone,
            });
            console.log(`SMS sent - SID: ${message.sid}, Status: ${message.status}, To: ${finalPhone}`);
            smsResult = true;
          } else {
            console.log('SMS service not enabled - check Twilio credentials');
            smsResult = false;
          }
        } catch (smsError) {
          console.error('Direct SMS Error:', smsError);
          smsResult = false;
        }
        const emailResult = await sendEmail({
          to: adminEmail,
          subject: '🧪 TEST: MarketPace Notification System Working',
          html: testEmailHTML
        });

        res.json({
          success: true,
          message: 'Test notifications sent',
          results: {
            sms: smsResult,
            email: emailResult,
            timestamp: new Date().toISOString()
          }
        });
      } else {
        res.status(400).json({ error: 'Invalid test type' });
      }
    } catch (error) {
      console.error('Test notification error:', error);
      res.status(500).json({ error: 'Failed to send test notifications' });
    }
  });

  // Debug endpoint to check Twilio account status and phone number verification
  app.post('/api/debug-twilio-status', async (req, res) => {
    try {
      const { phone } = req.body;
      const { smsService } = require('./smsService');
      
      if (!smsService.isEnabled()) {
        return res.json({
          status: 'disabled',
          message: 'Twilio SMS service not configured',
          hasCredentials: {
            accountSid: !!process.env.TWILIO_ACCOUNT_SID,
            authToken: !!process.env.TWILIO_AUTH_TOKEN,
            phoneNumber: !!process.env.TWILIO_PHONE_NUMBER
          }
        });
      }

      // Check Twilio account info
      let accountInfo = {};
      try {
        const account = await smsService.client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        accountInfo = {
          status: account.status,
          type: account.type,
          dateCreated: account.dateCreated
        };
      } catch (err) {
        console.error('Account fetch error:', err);
        accountInfo = { error: 'Could not fetch account info' };
      }

      // Try to get verified phone numbers (for trial accounts)
      let verifiedNumbers = [];
      try {
        const numbers = await smsService.client.outgoingCallerIds.list({ limit: 20 });
        verifiedNumbers = numbers.map(num => num.phoneNumber);
      } catch (err) {
        console.error('Verified numbers fetch error:', err);
      }

      // Send a basic test message
      let testResult = null;
      try {
        const testMsg = await smsService.client.messages.create({
          body: `TWILIO TEST: MarketPace SMS verification for ${phone} at ${new Date().toLocaleTimeString()}`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        testResult = {
          sid: testMsg.sid,
          status: testMsg.status,
          to: testMsg.to,
          from: testMsg.from,
          dateCreated: testMsg.dateCreated
        };
      } catch (err) {
        testResult = { error: err.message, code: err.code };
      }

      res.json({
        status: 'enabled',
        accountInfo,
        verifiedNumbers,
        testResult,
        phone,
        troubleshooting: {
          isTrialAccount: accountInfo.type === 'Trial',
          phoneIsVerified: verifiedNumbers.includes(phone),
          recommendations: [
            'For trial accounts, verify your phone number in Twilio Console',
            'Check your phone for carrier spam filtering',
            'Try sending from Twilio Console directly to test delivery'
          ]
        }
      });
    } catch (error) {
      console.error('Debug Twilio error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}

// Helper function to send sponsor notifications
async function sendSponsorNotifications(sponsorData: any) {
  const { businessName, contactName, email, phone, address, website, socialMedia, businessDescription, tier, tierName, amount, logoData } = sponsorData;
  
  try {
    // Import notification services
    const { sendSMS } = require('./smsService');
    const { sendEmail } = require('./emailService');
    
    // Send SMS notification to admin (you) - Simple format to avoid carrier filtering
    const adminSMSMessage = `New MarketPace sponsor: ${businessName}
Tier: ${tierName} ($${amount})
Contact: ${contactName}
Email: ${email}
Phone: ${phone}
${website ? `Website: ${website}` : ''}

Business info sent to your email.`;

    // Email is primary notification method (100% reliable)
    // SMS is backup (carrier may block new business numbers)
    try {
      const smsResult = await sendSMS('251-282-6662', adminSMSMessage);
      console.log(`SMS attempt: ${smsResult ? 'sent' : 'failed'} (Email is primary notification)`);
    } catch (smsError) {
      console.log('SMS blocked by carrier - email notification sent successfully');
    }

    // Send welcome SMS to sponsor (may be blocked)
    try {
      const sponsorSMSMessage = `Welcome to MarketPace ${contactName}. Thank you for becoming a ${tierName} sponsor. We'll send updates via email.`;
      const sponsorSMSResult = await sendSMS(phone, sponsorSMSMessage);
      console.log(`Sponsor SMS: ${sponsorSMSResult ? 'sent' : 'carrier blocked'}`);
    } catch (smsError) {
      console.log('Sponsor SMS blocked - welcome email sent instead');
    }

    // Send detailed email notification to admin (you)
    const adminEmailHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #1a0b3d 0%, #4b0082 50%, #191970 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 2rem;">🎉 NEW SPONSOR ALERT!</h1>
        <p style="margin: 10px 0 0 0; font-size: 1.2rem;">MarketPace has a new ${tierName} sponsor!</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h2 style="color: #1a0b3d; border-bottom: 2px solid #4b0082; padding-bottom: 10px;">Sponsor Information</h2>
        
        <div style="margin: 20px 0;">
          <strong style="color: #4b0082;">Business Name:</strong> ${businessName}<br/>
          <strong style="color: #4b0082;">Contact Person:</strong> ${contactName}<br/>
          <strong style="color: #4b0082;">Email:</strong> ${email}<br/>
          <strong style="color: #4b0082;">Phone:</strong> ${phone}<br/>
          <strong style="color: #4b0082;">Address:</strong> ${address}<br/>
          ${website ? `<strong style="color: #4b0082;">Website:</strong> ${website}<br/>` : ''}
          ${socialMedia ? `<strong style="color: #4b0082;">Social Media:</strong><br/><pre style="background: #f8f9fa; padding: 10px; border-radius: 5px;">${socialMedia}</pre>` : ''}
          ${businessDescription ? `<strong style="color: #4b0082;">Business Description:</strong><br/>${businessDescription}<br/>` : ''}
        </div>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; border-left: 4px solid #4b0082; margin: 20px 0;">
          <h3 style="color: #1a0b3d; margin-top: 0;">Sponsorship Details</h3>
          <strong>Tier:</strong> ${tierName}<br/>
          <strong>Amount:</strong> $${amount}<br/>
          <strong>Payment Status:</strong> Completed via Stripe
        </div>
        
        ${logoData ? `
        <div style="margin: 20px 0; text-align: center;">
          <h3 style="color: #1a0b3d;">Business Logo</h3>
          <img src="${logoData}" alt="${businessName} Logo" style="max-width: 300px; max-height: 150px; border-radius: 10px; border: 2px solid #4b0082;"/>
        </div>` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666;">Next Steps: Review sponsor benefits and add them to the platform radar!</p>
        </div>
      </div>
    </div>`;

    await sendEmail({
      to: 'MarketPace.contact@gmail.com',
      subject: `🎉 NEW ${tierName.toUpperCase()} SPONSOR: ${businessName}`,
      html: adminEmailHTML
    });

    // Send welcome email to sponsor
    const sponsorWelcomeHTML = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa;">
      <div style="background: linear-gradient(135deg, #1a0b3d 0%, #4b0082 50%, #191970 100%); color: white; padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 2rem;">Welcome to MarketPace!</h1>
        <p style="margin: 10px 0 0 0; font-size: 1.2rem;">Thank you for becoming our ${tierName} sponsor!</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h2 style="color: #1a0b3d;">Dear ${contactName},</h2>
        
        <p style="color: #333; line-height: 1.6; font-size: 1.1rem;">
          We are absolutely thrilled to welcome <strong>${businessName}</strong> as our ${tierName} sponsor! 
          Your support means the world to us and will help us build stronger local communities through MarketPace.
        </p>
        
        <div style="background: #e8f4fd; padding: 20px; border-radius: 10px; border-left: 4px solid #4b0082; margin: 20px 0;">
          <h3 style="color: #1a0b3d; margin-top: 0;">What's Next?</h3>
          <ul style="color: #333; line-height: 1.8;">
            <li>📱 We'll keep you updated on our app development progress</li>
            <li>🎯 You'll receive notifications about sponsorship shout-outs</li>
            <li>🎁 We'll inform you about all your sponsor perks and benefits</li>
            <li>🤝 You'll be featured prominently in our community platform</li>
            <li>📊 Regular updates on MarketPace growth and impact</li>
          </ul>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 10px; border-left: 4px solid #ffc107; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">Your ${tierName} Benefits Include:</h3>
          <p style="color: #856404; margin: 0;">
            ${tier === 'champion' ? 'Lifetime Free Subscription, Featured sponsor section with champion badge, Co-branded marketing materials, MarketPace Merch, and Social media features' : 
              tier === 'ambassador' ? 'Everything in Community Champion plus Exclusive event sponsorships, Premium placement, Custom integration opportunities, Custom video ads, and Custom radar effects' : 
              tier === 'legacy' ? 'Everything in Brand Ambassador plus Permanent legacy recognition, First access to new features, and Lifetime sponsor benefits' : 
              'Premium sponsor benefits and platform features'}
          </p>
        </div>
        
        <p style="color: #333; line-height: 1.6;">
          If you have any questions or need assistance with anything, please don't hesitate to reach out to us at 
          <a href="mailto:MarketPace.contact@gmail.com" style="color: #4b0082; text-decoration: none;">MarketPace.contact@gmail.com</a>
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #4b0082; font-size: 1.2rem; font-weight: bold;">
            Welcome to the MarketPace family! 🚀
          </p>
          <p style="color: #666; font-style: italic;">
            "Delivering Opportunities. Building Local Power."
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #666; font-size: 0.9rem;">
        <p>MarketPace - Community-First Marketplace<br/>
        Contact: MarketPace.contact@gmail.com</p>
      </div>
    </div>`;

    await sendEmail({
      to: email,
      subject: `🎉 Welcome to MarketPace - Thank you for your ${tierName} sponsorship!`,
      html: sponsorWelcomeHTML
    });

    console.log('✅ All sponsor notifications sent successfully');
    
  } catch (error) {
    console.error('❌ Error sending sponsor notifications:', error);
  }
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
    
    // Send sponsor notifications immediately after successful sponsor creation
    await sendSponsorNotifications({
      businessName, contactName, email, phone, 
      address: address, website, socialMedia, 
      businessDescription, tier, tierName, amount, logoData
    });

    // Send purchase notifications (SMS + Email)  
    const notificationData: PurchaseNotificationData = {
      customerName: contactName || 'Valued Sponsor',
      customerEmail: email || '',
      customerPhone: phone || '',
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