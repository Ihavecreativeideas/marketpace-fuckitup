// Simple SMS test with carrier-friendly message
const twilio = require('twilio');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function testSimpleMessage() {
  try {
    // Test with very simple, non-promotional message
    const message = await client.messages.create({
      body: 'Hi this is a test',  // Simple, non-business message
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+12512826662',
    });
    
    console.log('✅ Message sent successfully!');
    console.log('SID:', message.sid);
    console.log('Status:', message.status);
    console.log('From:', message.from);
    console.log('To:', message.to);
    
    // Get message details
    setTimeout(async () => {
      try {
        const messageStatus = await client.messages(message.sid).fetch();
        console.log('\n📊 Message Status Update:');
        console.log('Status:', messageStatus.status);
        console.log('Error Code:', messageStatus.errorCode);
        console.log('Error Message:', messageStatus.errorMessage);
        console.log('Price:', messageStatus.price);
      } catch (err) {
        console.error('Status check error:', err);
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ SMS Error:', error);
  }
}

testSimpleMessage();