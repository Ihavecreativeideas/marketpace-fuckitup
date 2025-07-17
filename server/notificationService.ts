// Dynamic imports to avoid startup issues
let twilioClient: any = null;
let emailTransporter: any = null;

async function initializeTwilio() {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = await import('twilio');
      twilioClient = twilio.default(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
    } catch (error) {
      console.log('Twilio initialization failed:', error);
    }
  }
}

async function initializeEmail() {
  if (!emailTransporter && process.env.SENDGRID_API_KEY) {
    try {
      const nodemailer = await import('nodemailer');
      emailTransporter = nodemailer.createTransporter({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      });
    } catch (error) {
      console.log('Email transporter initialization failed:', error);
    }
  }
}

export interface PurchaseNotificationData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  purchaseType: 'sponsorship' | 'marketplace' | 'service' | 'rental';
  itemName: string;
  amount: number;
  orderNumber?: string;
  transactionId: string;
}

export class NotificationService {
  
  // Send SMS notification for purchase
  async sendPurchaseSMS(data: PurchaseNotificationData): Promise<boolean> {
    try {
      await initializeTwilio();
      
      if (!data.customerPhone || !process.env.TWILIO_PHONE_NUMBER || !twilioClient) {
        console.log('SMS notification skipped - missing phone number or Twilio not initialized');
        return false;
      }

      const message = this.formatSMSMessage(data);
      
      await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: data.customerPhone
      });

      console.log(`SMS sent successfully to ${data.customerPhone}`);
      return true;
    } catch (error) {
      console.error('Error sending SMS:', error);
      return false;
    }
  }

  // Send email notification for purchase
  async sendPurchaseEmail(data: PurchaseNotificationData): Promise<boolean> {
    try {
      await initializeEmail();
      
      if (!data.customerEmail || !process.env.SENDGRID_API_KEY || !emailTransporter) {
        console.log('Email notification skipped - missing email or SendGrid key');
        return false;
      }

      const emailContent = this.formatEmailMessage(data);
      
      await emailTransporter.sendMail({
        from: 'noreply@marketpace.shop',
        to: data.customerEmail,
        subject: `Purchase Confirmation - ${data.itemName}`,
        html: emailContent
      });

      console.log(`Email sent successfully to ${data.customerEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send both SMS and email notifications
  async sendPurchaseNotifications(data: PurchaseNotificationData): Promise<void> {
    console.log(`Sending purchase notifications for ${data.customerName} - ${data.itemName}`);
    
    // Send both notifications in parallel
    const [smsResult, emailResult] = await Promise.all([
      this.sendPurchaseSMS(data),
      this.sendPurchaseEmail(data)
    ]);

    console.log(`Notification results - SMS: ${smsResult ? '✅' : '❌'}, Email: ${emailResult ? '✅' : '❌'}`);
  }

  // Format SMS message based on purchase type
  private formatSMSMessage(data: PurchaseNotificationData): string {
    const baseMessage = `MarketPace Purchase Confirmed!\n\n`;
    
    switch (data.purchaseType) {
      case 'sponsorship':
        return `${baseMessage}Thank you for becoming a MarketPace sponsor!\n\nTier: ${data.itemName}\nAmount: $${data.amount}\nTransaction: ${data.transactionId}\n\nYou'll receive your sponsor benefits over the next 12 months. Welcome to the MarketPace community!`;
      
      case 'marketplace':
        return `${baseMessage}Item: ${data.itemName}\nAmount: $${data.amount}\nOrder: ${data.orderNumber || data.transactionId}\n\nYour order is being processed. You'll receive delivery updates soon!\n\nTrack: marketpace.shop/orders`;
      
      case 'service':
        return `${baseMessage}Service: ${data.itemName}\nAmount: $${data.amount}\nBooking: ${data.orderNumber || data.transactionId}\n\nService provider will contact you within 24 hours to schedule.\n\nView: marketpace.shop/bookings`;
      
      case 'rental':
        return `${baseMessage}Rental: ${data.itemName}\nAmount: $${data.amount}\nBooking: ${data.orderNumber || data.transactionId}\n\nRental pickup/delivery will be scheduled soon!\n\nTrack: marketpace.shop/rentals`;
      
      default:
        return `${baseMessage}Purchase: ${data.itemName}\nAmount: $${data.amount}\nTransaction: ${data.transactionId}\n\nThank you for using MarketPace!`;
    }
  }

  // Format email message with HTML content
  private formatEmailMessage(data: PurchaseNotificationData): string {
    const logoUrl = 'https://marketpace.shop/marketpace-logo-optimized.jpeg';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Purchase Confirmation - MarketPace</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0d0221 0%, #1a0b3d 50%, #2d1b69 100%); padding: 30px; text-align: center; }
          .logo { width: 80px; height: 80px; margin-bottom: 15px; border-radius: 10px; }
          .header h1 { color: #00FFFF; margin: 0; font-size: 24px; text-shadow: 0 0 10px rgba(0,255,255,0.5); }
          .content { padding: 30px; }
          .purchase-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00FFFF; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
          .amount { font-size: 20px; font-weight: bold; color: #8A2BE2; }
          .cta-button { background: linear-gradient(45deg, #4169E1, #87ceeb); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${logoUrl}" alt="MarketPace Logo" class="logo">
            <h1>Purchase Confirmed!</h1>
            <p style="color: #87ceeb; margin: 0;">Thank you for supporting community commerce</p>
          </div>
          
          <div class="content">
            <p>Hi ${data.customerName},</p>
            <p>Your MarketPace purchase has been successfully processed. Here are the details:</p>
            
            <div class="purchase-details">
              <div class="detail-row">
                <span class="detail-label">${this.getPurchaseTypeLabel(data.purchaseType)}:</span>
                <span class="detail-value">${data.itemName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount">$${data.amount}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">${data.orderNumber ? 'Order Number' : 'Transaction ID'}:</span>
                <span class="detail-value">${data.orderNumber || data.transactionId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Purchase Date:</span>
                <span class="detail-value">${new Date().toLocaleDateString()}</span>
              </div>
            </div>

            ${this.getPurchaseTypeContent(data)}
            
            <div style="text-align: center;">
              <a href="https://marketpace.shop/community.html" class="cta-button">Visit Community</a>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>MarketPace</strong> - Building stronger communities through local commerce</p>
            <p>Questions? Contact us at support@marketpace.shop</p>
            <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getPurchaseTypeLabel(type: string): string {
    switch (type) {
      case 'sponsorship': return 'Sponsorship Tier';
      case 'marketplace': return 'Item Purchased';
      case 'service': return 'Service Booked';
      case 'rental': return 'Rental Item';
      default: return 'Purchase';
    }
  }

  private getPurchaseTypeContent(data: PurchaseNotificationData): string {
    switch (data.purchaseType) {
      case 'sponsorship':
        return `
          <p><strong>Welcome to the MarketPace sponsor family!</strong></p>
          <p>You'll receive your sponsor benefits over the next 12 months, including:</p>
          <ul>
            <li>Community recognition and social media features</li>
            <li>Direct access to founder updates</li>
            <li>Monthly check-ins and progress reports</li>
            <li>Exclusive sponsor events and networking</li>
          </ul>
          <p>Our team will begin fulfilling your sponsor perks within 48 hours.</p>
        `;
      
      case 'marketplace':
        return `
          <p><strong>Your order is being processed!</strong></p>
          <p>Next steps:</p>
          <ul>
            <li>Seller will confirm availability within 24 hours</li>
            <li>Delivery route will be assigned to a driver</li>
            <li>You'll receive SMS updates during delivery</li>
            <li>Track your order at marketpace.shop/orders</li>
          </ul>
        `;
      
      case 'service':
        return `
          <p><strong>Service booking confirmed!</strong></p>
          <p>What happens next:</p>
          <ul>
            <li>Service provider will contact you within 24 hours</li>
            <li>Schedule will be confirmed via phone/SMS</li>
            <li>Receive service reminders and updates</li>
            <li>View booking details at marketpace.shop/bookings</li>
          </ul>
        `;
      
      case 'rental':
        return `
          <p><strong>Rental booking confirmed!</strong></p>
          <p>Pickup/delivery details:</p>
          <ul>
            <li>Rental owner will confirm availability</li>
            <li>Pickup time and location will be scheduled</li>
            <li>You'll receive delivery tracking updates</li>
            <li>Track rental at marketpace.shop/rentals</li>
          </ul>
        `;
      
      default:
        return `<p>Thank you for your purchase! You'll receive updates as your order is processed.</p>`;
    }
  }

  // Send seller notification for new order
  async sendSellerNotification(data: {
    sellerEmail: string;
    customerName: string;
    itemName: string;
    amount: number;
    orderNumber: string;
    deliveryAddress: string;
  }): Promise<boolean> {
    try {
      await initializeEmail();
      
      if (!data.sellerEmail || !process.env.SENDGRID_API_KEY || !emailTransporter) {
        console.log('Seller email notification skipped - missing email or SendGrid key');
        return false;
      }

      const emailContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>New Order Received - MarketPace</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #0d0221 0%, #1a0b3d 50%, #2d1b69 100%); padding: 30px; text-align: center; }
            .header h1 { color: #00FFFF; margin: 0; font-size: 24px; text-shadow: 0 0 10px rgba(0,255,255,0.5); }
            .content { padding: 30px; }
            .order-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
            .detail-label { font-weight: bold; color: #555; }
            .detail-value { color: #333; }
            .amount { font-size: 20px; font-weight: bold; color: #28a745; }
            .cta-button { background: linear-gradient(45deg, #28a745, #20c997); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 New Order Received!</h1>
              <p style="color: #87ceeb; margin: 0;">You have a new MarketPace order</p>
            </div>
            
            <div class="content">
              <p>Great news! You have received a new order through MarketPace.</p>
              
              <div class="order-details">
                <div class="detail-row">
                  <span class="detail-label">Customer:</span>
                  <span class="detail-value">${data.customerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Item:</span>
                  <span class="detail-value">${data.itemName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Amount:</span>
                  <span class="detail-value amount">$${data.amount}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Order Number:</span>
                  <span class="detail-value">${data.orderNumber}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Delivery Address:</span>
                  <span class="detail-value">${data.deliveryAddress}</span>
                </div>
              </div>

              <p><strong>Next Steps:</strong></p>
              <ul>
                <li>Confirm item availability within 24 hours</li>
                <li>Prepare item for MarketPace driver pickup</li>
                <li>You'll receive pickup notification when driver is assigned</li>
                <li>Payment will be transferred after successful delivery</li>
              </ul>
              
              <div style="text-align: center;">
                <a href="https://marketpace.shop/seller-dashboard.html" class="cta-button">Manage Orders</a>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
      
      await emailTransporter.sendMail({
        from: 'orders@marketpace.shop',
        to: data.sellerEmail,
        subject: `New Order Received - ${data.itemName} ($${data.amount})`,
        html: emailContent
      });

      console.log(`Seller notification sent to ${data.sellerEmail}`);
      return true;
    } catch (error) {
      console.error('Error sending seller notification:', error);
      return false;
    }
  }
}

export const notificationService = new NotificationService();