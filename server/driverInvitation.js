const nodemailer = require('nodemailer');

// Import SMS function from employeeInvitation.js
const { sendSMS } = require('./employeeInvitation.js');

// Create email transporter using Gmail App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bb.music93@gmail.com',
    pass: 'qffr zdgq ekvh fhkl' // Gmail App Password
  }
});

async function sendDriverInvitation(driverData) {
  const { name, email, phone, vehicleInfo, driverId, status } = driverData;
  
  try {
    console.log(`📱 Sending driver invitation to ${name} (${email}, ${phone})`);
    
    // SMS message for driver invitation
    const smsMessage = `🚗 CONGRATULATIONS ${name}! Your MarketPace driver application has been APPROVED! 

✅ You're now an official MarketPace driver
🚚 Start earning with delivery routes today
📱 Join MarketPace as a member to access your Driver Portal

Join here: https://www.marketpace.shop?driverId=${driverId}

Your Driver ID: ${driverId}
Status: ${status}

Welcome to the MarketPace driver team!`;

    // Email HTML content for driver invitation
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🚗 DRIVER APPLICATION APPROVED!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Welcome to the MarketPace Driver Team</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 18px; margin-bottom: 20px;">Congratulations <strong>${name}</strong>!</p>
          
          <div style="background: rgba(34, 197, 94, 0.1); border: 2px solid rgba(34, 197, 94, 0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #22c55e; margin: 0 0 15px 0;">✅ Your Driver Application Status</h3>
            <p><strong>Status:</strong> ${status}</p>
            <p><strong>Driver ID:</strong> ${driverId}</p>
            <p><strong>Vehicle:</strong> ${vehicleInfo || 'On file'}</p>
            <p><strong>Approval Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <h3 style="color: #22c55e;">🚚 Next Steps:</h3>
          <ol style="line-height: 1.6;">
            <li><strong>Join MarketPace:</strong> Sign up as a regular member using the link below</li>
            <li><strong>Access Driver Portal:</strong> Your menu will automatically show driver features</li>
            <li><strong>Start Earning:</strong> Browse available routes and accept deliveries</li>
            <li><strong>Use QR Scanner:</strong> Scan pickup and delivery QR codes for confirmations</li>
          </ol>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.marketpace.shop?driverId=${driverId}" style="background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
              🚗 JOIN MARKETPACE AS DRIVER
            </a>
          </div>
          
          <div style="background: rgba(255, 215, 0, 0.1); border: 2px solid rgba(255, 215, 0, 0.3); border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #ffd700; margin: 0 0 10px 0;">💰 Driver Earnings Structure</h4>
            <p style="margin: 5px 0;">• $4 per pickup + $2 per drop-off + $0.50 per mile</p>
            <p style="margin: 5px 0;">• 100% of customer tips go directly to you</p>
            <p style="margin: 5px 0;">• Instant payment after route completion</p>
          </div>
          
          <p style="margin-top: 20px; font-size: 14px; color: #94a3b8;">
            Questions? Reply to this email or contact support at MarketPace.contact@gmail.com
          </p>
        </div>
        
        <div style="background: rgba(0,0,0,0.3); padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p>© 2025 MarketPace - Community-First Marketplace</p>
          <p>Delivered by the MarketPace Driver Team</p>
        </div>
      </div>
    `;

    // Send SMS invitation
    let smsSuccess = false;
    try {
      await sendSMS(phone, smsMessage);
      smsSuccess = true;
      console.log(`✅ Driver invitation SMS sent to ${phone}`);
    } catch (smsError) {
      console.error(`❌ SMS failed for ${phone}:`, smsError.message);
    }

    // Send email invitation
    let emailSuccess = false;
    try {
      await transporter.sendMail({
        from: '"MarketPace Driver Team" <bb.music93@gmail.com>',
        to: email,
        subject: `🚗 DRIVER APPLICATION APPROVED - Welcome to MarketPace!`,
        html: emailHtml
      });
      emailSuccess = true;
      console.log(`✅ Driver invitation email sent to ${email}`);
    } catch (emailError) {
      console.error(`❌ Email failed for ${email}:`, emailError.message);
    }

    return {
      success: smsSuccess || emailSuccess,
      sms: smsSuccess,
      email: emailSuccess,
      driverData: driverData,
      message: 'Driver invitation sent successfully'
    };

  } catch (error) {
    console.error('Driver invitation error:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to send driver invitation'
    };
  }
}

module.exports = {
  sendDriverInvitation
};