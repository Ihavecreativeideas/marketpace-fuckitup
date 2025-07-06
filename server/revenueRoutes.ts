import { Router } from 'express';
import { db } from './db.js';
import { 
  userWallets, 
  walletTransactions, 
  subscriptions, 
  transactionFees, 
  promotions,
  sponsorships,
  localPartners,
  driverPayments,
  revenueMetrics,
  returns,
  orders,
  listings,
  users
} from '../shared/schema.js';
import { 
  WalletManager, 
  PromotionManager, 
  SponsorshipManager,
  calculateProductSaleFee,
  calculateRentalOrServiceFee,
  calculateDriverPayout,
  calculateDeliveryPlatformFee,
  handleReturnOnDelivery,
  isUserSubscribed,
  SUBSCRIPTION_TIERS,
  FEE_STRUCTURE,
  PROMOTION_PRICING
} from './revenue.js';
import { isAuthenticated } from './replitAuth.js';
import { eq, desc, and, sum, count } from 'drizzle-orm';
import { RequestHandler } from 'express';

const router = Router();

// ============ WALLET ENDPOINTS ============

// Get user wallet balance
router.get('/wallet/balance', isAuthenticated, (async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const wallet = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    
    if (wallet.length === 0) {
      // Create wallet if it doesn't exist
      const newWallet = await db.insert(userWallets).values({
        userId,
        balance: "0.00"
      }).returning();
      
      return res.json({
        balance: 0,
        totalLoaded: 0,
        totalSpent: 0,
        bonusEarned: 0
      });
    }

    const userWallet = wallet[0];
    res.json({
      balance: parseFloat(userWallet.balance || "0"),
      totalLoaded: parseFloat(userWallet.totalLoaded || "0"),
      totalSpent: parseFloat(userWallet.totalSpent || "0"),
      bonusEarned: parseFloat(userWallet.bonusEarned || "0")
    });
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    res.status(500).json({ error: 'Failed to fetch wallet balance' });
  }
}) as RequestHandler);

// Load credits to wallet
router.post('/wallet/load', isAuthenticated, (async (req, res) => {
  try {
    const userId = req.user?.id;
    const { amount, stripePaymentIntentId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Calculate bonus (10% extra)
    const bonusAmount = amount * FEE_STRUCTURE.WALLET_BONUS_PERCENT;
    const totalToAdd = amount + bonusAmount;

    // Get or create wallet
    let wallet = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    
    if (wallet.length === 0) {
      await db.insert(userWallets).values({
        userId,
        balance: "0.00"
      });
      wallet = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    }

    const currentBalance = parseFloat(wallet[0].balance || "0");
    const newBalance = currentBalance + totalToAdd;

    // Update wallet
    await db.update(userWallets)
      .set({
        balance: newBalance.toFixed(2),
        totalLoaded: (parseFloat(wallet[0].totalLoaded || "0") + amount).toFixed(2),
        bonusEarned: (parseFloat(wallet[0].bonusEarned || "0") + bonusAmount).toFixed(2),
        lastTransaction: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userWallets.userId, userId));

    // Record transaction
    await db.insert(walletTransactions).values({
      walletId: wallet[0].id,
      userId,
      type: 'load',
      amount: amount.toFixed(2),
      description: `Loaded $${amount.toFixed(2)} + $${bonusAmount.toFixed(2)} bonus`,
      stripePaymentIntentId,
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      status: 'completed'
    });

    // Record bonus transaction
    if (bonusAmount > 0) {
      await db.insert(walletTransactions).values({
        walletId: wallet[0].id,
        userId,
        type: 'bonus',
        amount: bonusAmount.toFixed(2),
        description: `10% bonus for loading $${amount.toFixed(2)}`,
        balanceBefore: (currentBalance + amount).toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        status: 'completed'
      });
    }

    res.json({
      success: true,
      newBalance: newBalance,
      bonusEarned: bonusAmount,
      message: `Successfully loaded $${amount.toFixed(2)} + $${bonusAmount.toFixed(2)} bonus`
    });

  } catch (error) {
    console.error('Error loading wallet credits:', error);
    res.status(500).json({ error: 'Failed to load credits' });
  }
}) as RequestHandler);

// Get wallet transaction history
router.get('/wallet/transactions', isAuthenticated, (async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 20, offset = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const transactions = await db.select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, userId))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(Number(limit))
      .offset(Number(offset));

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
}) as RequestHandler);

// ============ SUBSCRIPTION ENDPOINTS ============

// Get user subscription info
router.get('/subscription', isAuthenticated, (async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const subscription = await db.select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    if (subscription.length === 0) {
      // Create basic subscription
      const newSub = await db.insert(subscriptions).values({
        userId,
        tier: 'basic',
        status: 'active',
        monthlyFee: "0.00"
      }).returning();

      return res.json({
        ...newSub[0],
        features: SUBSCRIPTION_TIERS.basic.features
      });
    }

    const userSub = subscription[0];
    res.json({
      ...userSub,
      features: SUBSCRIPTION_TIERS[userSub.tier as keyof typeof SUBSCRIPTION_TIERS]?.features || []
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}) as RequestHandler);

// Upgrade to Pro subscription
router.post('/subscription/upgrade', isAuthenticated, (async (req, res) => {
  try {
    const userId = req.user?.id;
    const { stripeSubscriptionId, stripeCustomerId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Update or create Pro subscription
    await db.insert(subscriptions).values({
      userId,
      tier: 'pro',
      status: 'active',
      stripeSubscriptionId,
      stripeCustomerId,
      monthlyFee: SUBSCRIPTION_TIERS.pro.monthlyFee.toFixed(2),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }).onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        tier: 'pro',
        status: 'active',
        stripeSubscriptionId,
        stripeCustomerId,
        monthlyFee: SUBSCRIPTION_TIERS.pro.monthlyFee.toFixed(2),
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    });

    // Update user isPro status
    await db.update(users)
      .set({ isPro: true })
      .where(eq(users.id, userId));

    res.json({
      success: true,
      tier: 'pro',
      features: SUBSCRIPTION_TIERS.pro.features,
      message: 'Successfully upgraded to Pro!'
    });

  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
}) as RequestHandler);

// ============ PROMOTION ENDPOINTS ============

// Boost a listing
router.post('/promotions/boost-listing', isAuthenticated, (async (req, res) => {
  try {
    const userId = req.user?.id;
    const { listingId, amount, duration = 1 } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    if (amount < PROMOTION_PRICING.BOOST_LISTING_MIN || amount > PROMOTION_PRICING.BOOST_LISTING_MAX) {
      return res.status(400).json({ 
        error: `Boost amount must be between $${PROMOTION_PRICING.BOOST_LISTING_MIN} and $${PROMOTION_PRICING.BOOST_LISTING_MAX}` 
      });
    }

    // Check wallet balance
    const wallet = await db.select().from(userWallets).where(eq(userWallets.userId, userId)).limit(1);
    if (wallet.length === 0 || parseFloat(wallet[0].balance || "0") < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    // Deduct from wallet
    const currentBalance = parseFloat(wallet[0].balance || "0");
    const newBalance = currentBalance - amount;

    await db.update(userWallets)
      .set({
        balance: newBalance.toFixed(2),
        totalSpent: (parseFloat(wallet[0].totalSpent || "0") + amount).toFixed(2),
        lastTransaction: new Date(),
        updatedAt: new Date()
      })
      .where(eq(userWallets.userId, userId));

    // Record wallet transaction
    await db.insert(walletTransactions).values({
      walletId: wallet[0].id,
      userId,
      type: 'spend',
      amount: amount.toFixed(2),
      description: `Boosted listing #${listingId} for ${duration} day(s)`,
      relatedListingId: listingId,
      balanceBefore: currentBalance.toFixed(2),
      balanceAfter: newBalance.toFixed(2),
      status: 'completed'
    });

    // Create promotion record
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + duration);

    await db.insert(promotions).values({
      userId,
      listingId,
      type: 'boost_listing',
      amount: amount.toFixed(2),
      duration,
      status: 'active',
      paidWithWallet: true,
      endDate
    });

    res.json({
      success: true,
      newBalance,
      message: `Successfully boosted listing for ${duration} day(s) with $${amount.toFixed(2)}`
    });

  } catch (error) {
    console.error('Error boosting listing:', error);
    res.status(500).json({ error: 'Failed to boost listing' });
  }
}) as RequestHandler);

// ============ FEE CALCULATION ENDPOINTS ============

// Calculate fees for a transaction
router.post('/fees/calculate', (async (req, res) => {
  try {
    const { type, price, includeInsurance = false, includeVerification = false } = req.body;

    if (!type || !price || price <= 0) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    let feeAmount = 0;
    let breakdown = {};

    switch (type) {
      case 'product_sale':
        feeAmount = calculateProductSaleFee(price);
        breakdown = {
          baseFee: `${FEE_STRUCTURE.PRODUCT_SALE_PERCENT * 100}%`,
          feeAmount,
          finalPrice: price - feeAmount
        };
        break;

      case 'service_rental':
        feeAmount = calculateRentalOrServiceFee(price, includeInsurance, includeVerification);
        breakdown = {
          baseFee: price * FEE_STRUCTURE.SERVICE_RENTAL_PERCENT,
          damageInsurance: includeInsurance ? FEE_STRUCTURE.DAMAGE_INSURANCE_FEE : 0,
          verification: includeVerification ? FEE_STRUCTURE.VERIFICATION_FEE : 0,
          totalFee: feeAmount,
          finalPrice: price - feeAmount
        };
        break;

      case 'delivery_platform':
        feeAmount = calculateDeliveryPlatformFee(price);
        breakdown = {
          percentage: `${FEE_STRUCTURE.DELIVERY_PLATFORM_PERCENT * 100}%`,
          feeAmount
        };
        break;

      default:
        return res.status(400).json({ error: 'Invalid fee type' });
    }

    res.json({
      type,
      originalAmount: price,
      feeAmount,
      breakdown
    });

  } catch (error) {
    console.error('Error calculating fees:', error);
    res.status(500).json({ error: 'Failed to calculate fees' });
  }
}) as RequestHandler);

// ============ SPONSORSHIP ENDPOINTS ============

// Get active sponsorships
router.get('/sponsorships/active', (async (req, res) => {
  try {
    const activeSponsors = await db.select()
      .from(sponsorships)
      .where(eq(sponsorships.status, 'active'))
      .orderBy(desc(sponsorships.amount));

    res.json(activeSponsors);
  } catch (error) {
    console.error('Error fetching sponsorships:', error);
    res.status(500).json({ error: 'Failed to fetch sponsorships' });
  }
}) as RequestHandler);

// Get local partners
router.get('/partners', (async (req, res) => {
  try {
    const partners = await db.select()
      .from(localPartners)
      .where(eq(localPartners.isActive, true))
      .orderBy(desc(localPartners.joinedAt));

    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
}) as RequestHandler);

// ============ ANALYTICS ENDPOINTS ============

// Get revenue metrics (admin only)
router.get('/analytics/revenue', isAuthenticated, (async (req, res) => {
  try {
    const userId = req.user?.id;
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user[0] || user[0].userType !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { startDate, endDate } = req.query;
    
    // Get recent revenue metrics
    const metrics = await db.select()
      .from(revenueMetrics)
      .orderBy(desc(revenueMetrics.date))
      .limit(30);

    res.json(metrics);

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}) as RequestHandler);

// ============ RETURN HANDLING ENDPOINTS ============

// Process return on delivery
router.post('/returns/process', isAuthenticated, (async (req, res) => {
  try {
    const userId = req.user?.id;
    const { orderId, reason, refusalTimeMinutes } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Get order details
    const order = await db.select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order[0]) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = order[0];
    const orderValue = parseFloat(orderData.totalAmount);
    const isRefused = reason === 'refused_on_delivery';

    // Calculate return amounts
    const returnDetails = handleReturnOnDelivery(orderValue, isRefused, refusalTimeMinutes || 0);

    // Create return record
    await db.insert(returns).values({
      orderId,
      buyerId: orderData.buyerId,
      sellerId: orderData.sellerId,
      driverId: orderData.driverId,
      reason,
      refusalTimeMinutes,
      refundAmount: returnDetails.refundAmount.toFixed(2),
      returnFee: returnDetails.returnFee.toFixed(2),
      driverCompensation: returnDetails.driverCompensation.toFixed(2),
      status: 'processing'
    });

    // Update order status
    await db.update(orders)
      .set({ 
        status: 'cancelled',
        updatedAt: new Date()
      })
      .where(eq(orders.id, orderId));

    res.json({
      success: true,
      ...returnDetails,
      message: `Return processed. Refund: $${returnDetails.refundAmount.toFixed(2)}`
    });

  } catch (error) {
    console.error('Error processing return:', error);
    res.status(500).json({ error: 'Failed to process return' });
  }
}) as RequestHandler);

export default router;