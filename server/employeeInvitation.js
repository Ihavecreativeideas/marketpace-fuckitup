const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Initialize Twilio client
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Initialize Gmail transporter
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bb.music93@gmail.com',
        pass: process.env.SENDGRID_API_KEY || 'fallback_password' // Will use app password when available
    }
});

async function sendEmployeeInvitation(employeeData) {
    const { name, role, email, phone, paymentInfo, employeeId, businessName } = employeeData;
    
    // Create employee dashboard URL
    const dashboardUrl = `${process.env.BASE_URL || 'https://www.marketpace.shop'}/employee-dashboard?id=${employeeId}`;
    const qrSystemUrl = `${process.env.BASE_URL || 'https://www.marketpace.shop'}/employee-geo-qr-system`;
    
    // SMS Message with business name integration
    const businessNameText = businessName && businessName !== 'Your Business' ? businessName : 'MarketPace';
    const smsMessage = `🎉 Welcome to MarketPace, ${name}!

You've been invited to join ${businessNameText} as a ${role} with ${paymentInfo} pay.

Your MarketPace Job Portal:
${dashboardUrl}

Features:
• View your work schedule
• Check in/out with Geo QR codes
• Track your earnings
• Receive shift notifications

Get started: Download MarketPace app or visit the link above.

Questions? Reply to this message.`;

    // Email HTML content
    const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #1a1a2e 0%, #2d1b69 100%); color: white; padding: 30px; text-align: center; }
            .header h1 { margin: 0; color: #00ffff; font-size: 28px; }
            .content { padding: 30px; }
            .welcome-box { background: linear-gradient(135deg, #00ffff, #4169e1); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .info-item { background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #00ffff; }
            .info-label { font-weight: bold; color: #333; font-size: 14px; }
            .info-value { color: #666; font-size: 16px; margin-top: 4px; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #00ffff, #0066ff); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .features { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature-item { display: flex; align-items: center; margin: 10px 0; }
            .feature-icon { background: #00ffff; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Welcome to MarketPace!</h1>
                <p>Your Job Portal is Ready</p>
            </div>
            
            <div class="content">
                <div class="welcome-box">
                    <h2 style="margin: 0 0 10px 0;">Hi ${name}! 👋</h2>
                    <p style="margin: 0;">You've been invited to join ${businessNameText} as a ${role}</p>
                </div>
                
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Your Role</div>
                        <div class="info-value">${role}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Payment Rate</div>
                        <div class="info-value">${paymentInfo}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Employee ID</div>
                        <div class="info-value">#${employeeId}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Phone</div>
                        <div class="info-value">${phone}</div>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${dashboardUrl}" class="cta-button">Access Your Job Portal</a>
                </div>
                
                <div class="features">
                    <h3 style="color: #333; margin-top: 0;">What you can do:</h3>
                    
                    <div class="feature-item">
                        <div class="feature-icon">📅</div>
                        <div>
                            <strong>View Your Schedule</strong><br>
                            See your upcoming shifts and work hours
                        </div>
                    </div>
                    
                    <div class="feature-item">
                        <div class="feature-icon">📍</div>
                        <div>
                            <strong>Geo QR Check-In/Out</strong><br>
                            Check in and out of work using location-verified QR codes
                        </div>
                    </div>
                    
                    <div class="feature-item">
                        <div class="feature-icon">💰</div>
                        <div>
                            <strong>Track Earnings</strong><br>
                            Monitor your hours worked and earnings in real-time
                        </div>
                    </div>
                    
                    <div class="feature-item">
                        <div class="feature-icon">🔔</div>
                        <div>
                            <strong>Shift Notifications</strong><br>
                            Get SMS and email alerts for schedule changes
                        </div>
                    </div>
                </div>
                
                <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h4 style="color: #1976d2; margin-top: 0;">Getting Started:</h4>
                    <p style="margin: 10px 0;">1. <strong>Click the dashboard link above</strong> to access your job portal</p>
                    <p style="margin: 10px 0;">2. <strong>Download MarketPace app</strong> for mobile access (coming soon)</p>
                    <p style="margin: 10px 0;">3. <strong>Set up QR check-ins</strong> at your work location</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>MarketPace Employee Support</strong></p>
                <p>Questions? Reply to this email or text your manager.</p>
                <p style="font-size: 12px; color: #999;">This invitation was sent because you were added as an employee. If you received this in error, please contact your manager.</p>
            </div>
        </div>
    </body>
    </html>`;
    
    try {
        // Send SMS invitation
        let smsResult = null;
        if (process.env.TWILIO_PHONE_NUMBER) {
            try {
                const sms = await twilioClient.messages.create({
                    body: smsMessage,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone
                });
                smsResult = { success: true, sid: sms.sid };
                console.log(`✅ SMS invitation sent to ${name}: ${sms.sid}`);
            } catch (smsError) {
                console.error('❌ SMS send failed:', smsError);
                smsResult = { success: false, error: smsError.message };
            }
        }
        
        // Send email invitation
        let emailResult = null;
        try {
            const emailInfo = await emailTransporter.sendMail({
                from: '"MarketPace Team" <bb.music93@gmail.com>',
                to: email,
                subject: `Welcome to MarketPace, ${name}! Your Employee Dashboard is Ready`,
                html: emailHtml,
                text: `Welcome to MarketPace, ${name}!

You've been added as a ${role} with ${paymentInfo} pay.

Your Employee Dashboard: ${dashboardUrl}

Features:
- View your work schedule
- Check in/out with Geo QR codes  
- Track your earnings
- Receive shift notifications

Questions? Reply to this email.`
            });
            
            emailResult = { success: true, messageId: emailInfo.messageId };
            console.log(`✅ Email invitation sent to ${name}: ${emailInfo.messageId}`);
        } catch (emailError) {
            console.error('❌ Email send failed:', emailError);
            emailResult = { success: false, error: emailError.message };
        }
        
        return {
            success: true,
            sms: smsResult,
            email: emailResult,
            dashboardUrl: dashboardUrl
        };
        
    } catch (error) {
        console.error('❌ Failed to send employee invitation:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { sendEmployeeInvitation };