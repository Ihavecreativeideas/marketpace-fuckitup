// 📦 Replit-ready script to create Stripe products and prices for MarketPace
// 🧠 Make sure to add your Stripe Secret Key in the environment variable STRIPE_SECRET_KEY

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// List of MarketPace products and plans
const products = [
  {
    name: 'MarketPace Pro',
    description: 'Unlock advanced tools, analytics, and priority placement.',
    type: 'service',
    recurring: { interval: 'month' },
    unit_amount: 399,
    currency: 'usd'
  },
  {
    name: 'Dual Profile Upgrade',
    description: 'Add a business profile alongside your personal account.',
    type: 'service',
    recurring: { interval: 'month' },
    unit_amount: 399,
    currency: 'usd'
  },
  {
    name: 'Business Pro Tools',
    description: 'Set S&H, web integration, analytics, and more.',
    type: 'service',
    recurring: { interval: 'month' },
    unit_amount: 1499,
    currency: 'usd'
  },
  {
    name: 'Supporter Sponsor Tier',
    description: 'Community donor – shows your support for local economy.',
    type: 'good',
    unit_amount: 2500,
    currency: 'usd'
  },
  {
    name: 'Starter Sponsor Tier',
    description: 'Shout-out, vinyl sticker, Pro for Life.',
    type: 'good',
    unit_amount: 10000,
    currency: 'usd'
  },
  {
    name: 'Community Sponsor Tier',
    description: 'Gift bags, badge, no delivery fees for 1 year.',
    type: 'good',
    unit_amount: 50000,
    currency: 'usd'
  },
  {
    name: 'Ambassador Sponsor Tier',
    description: 'Featured business, video shout-out, promo.',
    type: 'good',
    unit_amount: 100000,
    currency: 'usd'
  },
  {
    name: 'Legacy Sponsor Tier',
    description: 'Founding partner, lifetime promo, app badge.',
    type: 'good',
    unit_amount: 250000,
    currency: 'usd'
  },
  {
    name: 'Product Listing Boost',
    description: 'Feature product on homepage & "For You".',
    type: 'service',
    unit_amount: 500,
    currency: 'usd'
  },
  {
    name: 'Rental Insurance Add-on',
    description: 'Protect high-value rentals (opt-in).',
    type: 'service',
    unit_amount: 500,
    currency: 'usd'
  },
  {
    name: 'Route Sponsorship',
    description: 'Sponsor a delivery route, get brand shoutout.',
    type: 'service',
    recurring: { interval: 'month' },
    unit_amount: 3000,
    currency: 'usd'
  }
];

// Add logic for 5% commission and delivery fee splitting
function calculateFees(orderAmount, memberType, isRentalOrBusiness) {
  const commission = orderAmount * 0.05;
  const deliveryFee = 5.00; // example fixed delivery fee
  const deliverySplit = memberType === 'basic' && !isRentalOrBusiness ? deliveryFee / 2 : deliveryFee;
  return {
    commission,
    deliveryFee: deliverySplit
  };
}

(async () => {
  try {
    for (const item of products) {
      const product = await stripe.products.create({
        name: item.name,
        description: item.description
      });

      await stripe.prices.create({
        product: product.id,
        unit_amount: item.unit_amount,
        currency: item.currency,
        ...(item.recurring && { recurring: item.recurring })
      });

      console.log(`✅ Created: ${item.name}`);
    }
    console.log('\n🎉 All products and prices created successfully!');

    // Example fee calculation:
    const sample = calculateFees(10000, 'basic', false);
    console.log(`\n💰 Example Fee Calculation:`);
    console.log(`5% Commission: $${(sample.commission / 100).toFixed(2)}`);
    console.log(`Delivery Split Fee: $${(sample.deliveryFee).toFixed(2)}`);

  } catch (err) {
    console.error('❌ Error creating products:', err);
  }
})();