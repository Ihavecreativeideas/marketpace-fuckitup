// Revenue logic for MarketPlace app
// Implementation of comprehensive revenue system

export interface SubscriptionTier {
  type: 'basic' | 'pro';
  monthlyFee: number;
  features: string[];
}

export interface WalletBalance {
  userId: string;
  balance: number;
  lastUpdated: Date;
}

export interface TransactionFee {
  type: 'product_sale' | 'service_rental' | 'damage_insurance' | 'verification' | 'custom_delivery';
  amount: number;
  percentage?: number;
  deliveryMethod?: 'marketpace' | 'existing_carrier' | 'pickup' | 'custom';
}

export interface Sponsorship {
  businessName: string;
  amount: number;
  message: string;
  date: Date;
  isActive: boolean;
}

export interface LocalPartner {
  id: string;
  name: string;
  website: string;
  logoUrl: string;
  contactEmail?: string;
}

// Subscription Plans
export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  basic: {
    type: 'basic',
    monthlyFee: 0,
    features: [
      'Buy/sell basic functionality',
      'Browse community',
      'One profile',
      'Rentals access',
      'MarketPlace delivery only'
    ]
  },
  pro: {
    type: 'pro',
    monthlyFee: 3.99,
    features: [
      'Dual profiles (personal + business)',
      'Business tools and analytics',
      'Livestream capabilities',
      'Product sync and S&H',
      'Website integration',
      'AI assistant for content',
      'Priority customer support'
    ]
  }
};

// Fee Structure
export const FEE_STRUCTURE = {
  PRODUCT_SALE_PERCENT: 0.05, // 5% fee from each product sold
  SERVICE_RENTAL_PERCENT: 0.05, // 5% fee from service/rental
  DAMAGE_INSURANCE_FEE: 2.00, // Optional damage insurance
  VERIFICATION_FEE: 1.00, // Optional verification fee
  LARGE_ITEM_FEE: 25.00, // $25 fee for large items requiring truck/trailer
  WALLET_BONUS_PERCENT: 0.10, // 10% bonus when loading wallet ($10 = $11 in app)
  DELIVERY_PLATFORM_PERCENT: 0.05 // 5% of delivery/order total (except tips)
};

// Driver Payment Structure
export const DRIVER_PAYMENTS = {
  PICKUP_FEE: 4.00,
  DROPOFF_FEE: 2.00,
  MILEAGE_RATE: 0.50,
  LARGE_DELIVERY_BONUS: 25.00,
  TIP_PERCENTAGE: 1.00 // 100% of tips go to drivers
};

// Promotion Pricing
export const PROMOTION_PRICING = {
  BOOST_LISTING_MIN: 2.00,
  BOOST_LISTING_MAX: 10.00,
  PIN_TO_TOP_DAILY: 1.00,
  SPONSOR_SPOTLIGHT_WEEKLY: 25.00
};

// In-App Currency Logic
class WalletManager {
  private static wallets: Map<string, number> = new Map();

  static addCredits(userId: string, amount: number): void {
    const currentBalance = this.wallets.get(userId) || 0;
    const bonusAmount = amount * FEE_STRUCTURE.WALLET_BONUS_PERCENT;
    const totalToAdd = amount + bonusAmount;
    this.wallets.set(userId, currentBalance + totalToAdd);
  }

  static deductCredits(userId: string, amount: number): boolean {
    const currentBalance = this.wallets.get(userId) || 0;
    if (currentBalance < amount) {
      throw new Error(`Insufficient balance. Current: $${currentBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`);
    }
    this.wallets.set(userId, currentBalance - amount);
    return true;
  }

  static getBalance(userId: string): number {
    return this.wallets.get(userId) || 0;
  }

  static transferCredits(fromUserId: string, toUserId: string, amount: number): boolean {
    if (this.deductCredits(fromUserId, amount)) {
      const currentToBalance = this.wallets.get(toUserId) || 0;
      this.wallets.set(toUserId, currentToBalance + amount);
      return true;
    }
    return false;
  }
}

// Fee Calculation Functions
export function calculateProductSaleFee(price: number): number {
  return price * FEE_STRUCTURE.PRODUCT_SALE_PERCENT;
}

export function calculateRentalOrServiceFee(
  price: number, 
  includeInsurance: boolean = false, 
  includeVerification: boolean = false
): number {
  let baseFee = price * FEE_STRUCTURE.SERVICE_RENTAL_PERCENT;
  
  if (includeInsurance) {
    baseFee += FEE_STRUCTURE.DAMAGE_INSURANCE_FEE;
  }
  
  if (includeVerification) {
    baseFee += FEE_STRUCTURE.VERIFICATION_FEE;
  }
  
  return baseFee;
}

export function calculateDriverPayout(
  pickups: number,
  dropoffs: number,
  miles: number, 
  tips: number
): number {
  const pickupPay = pickups * DRIVER_PAYMENTS.PICKUP_FEE;
  const dropoffPay = dropoffs * DRIVER_PAYMENTS.DROPOFF_FEE;
  const mileagePay = miles * DRIVER_PAYMENTS.MILEAGE_RATE;
  const tipPay = tips * DRIVER_PAYMENTS.TIP_PERCENTAGE;
  
  return pickupPay + dropoffPay + mileagePay + tipPay;
}

export function calculateDeliveryPlatformFee(orderTotal: number): number {
  return orderTotal * FEE_STRUCTURE.DELIVERY_PLATFORM_PERCENT;
}

export function calculateCustomDeliveryFee(
  salePrice: number, 
  deliveryMethod: 'marketpace' | 'existing_carrier' | 'pickup' | 'custom',
  shippingCost: number = 0
): { platformFee: number; totalCost: number; details: string } {
  const platformFeeRate = 0.05; // 5% commission regardless of delivery method
  const platformFee = salePrice * platformFeeRate;
  
  let totalCost = salePrice + platformFee;
  let details = '';
  
  switch (deliveryMethod) {
    case 'marketpace':
      // Standard MarketPace delivery - customer and seller split delivery cost
      const deliveryFee = calculateDeliveryPlatformFee(salePrice);
      totalCost += deliveryFee;
      details = `MarketPace delivery: $${deliveryFee.toFixed(2)} (split between buyer/seller)`;
      break;
      
    case 'existing_carrier':
      // Business uses FedEx/UPS - MarketPace still gets 5% commission
      totalCost += shippingCost;
      details = `Existing carrier shipping: $${shippingCost.toFixed(2)}. MarketPace commission: $${platformFee.toFixed(2)}`;
      break;
      
    case 'pickup':
      // Customer pickup - no additional delivery fees
      details = `Customer pickup. MarketPace commission: $${platformFee.toFixed(2)}`;
      break;
      
    case 'custom':
      // Custom shipping rates set by business
      totalCost += shippingCost;
      details = `Custom shipping: $${shippingCost.toFixed(2)}. MarketPace commission: $${platformFee.toFixed(2)}`;
      break;
  }
  
  return {
    platformFee,
    totalCost,
    details
  };
}

// Subscription Management
export function isUserSubscribed(userType: string, hasPaidSubscription: boolean): boolean {
  if (userType === 'basic') return true; // Free tier
  if (userType === 'pro') return hasPaidSubscription; // Must pay
  return false;
}

export function getSubscriptionFeatures(userType: string): string[] {
  return SUBSCRIPTION_TIERS[userType]?.features || [];
}

// Promotion System
class PromotionManager {
  static promoteListingWithCredits(userId: string, boostAmount: number): string {
    if (boostAmount < PROMOTION_PRICING.BOOST_LISTING_MIN || 
        boostAmount > PROMOTION_PRICING.BOOST_LISTING_MAX) {
      throw new Error(`Boost amount must be between $${PROMOTION_PRICING.BOOST_LISTING_MIN} and $${PROMOTION_PRICING.BOOST_LISTING_MAX}`);
    }
    
    WalletManager.deductCredits(userId, boostAmount);
    return `Listing promoted with $${boostAmount.toFixed(2)} boost`;
  }

  static pinToTop(userId: string, days: number = 1): string {
    const totalCost = PROMOTION_PRICING.PIN_TO_TOP_DAILY * days;
    WalletManager.deductCredits(userId, totalCost);
    return `Content pinned to top for ${days} day(s) - $${totalCost.toFixed(2)}`;
  }
}

// Sponsorship System
class SponsorshipManager {
  private static sponsorships: Sponsorship[] = [];
  private static partners: LocalPartner[] = [];

  static addSponsorship(businessName: string, amount: number, message: string = ''): void {
    this.sponsorships.push({
      businessName,
      amount,
      message,
      date: new Date(),
      isActive: true
    });
  }

  static getActiveSponsors(): Sponsorship[] {
    return this.sponsorships.filter(s => s.isActive);
  }

  static addLocalPartner(partner: Omit<LocalPartner, 'id'>): string {
    const id = `partner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.partners.push({ ...partner, id });
    return id;
  }

  static getLocalPartners(): LocalPartner[] {
    return this.partners;
  }

  static removePartner(partnerId: string): boolean {
    const index = this.partners.findIndex(p => p.id === partnerId);
    if (index > -1) {
      this.partners.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Return Policy Handler
export function handleReturnOnDelivery(
  orderValue: number, 
  isRefused: boolean, 
  timeElapsed: number
): { refundAmount: number; returnFee: number; driverCompensation: number } {
  const REFUSAL_TIME_LIMIT = 5; // 5 minutes
  
  if (!isRefused || timeElapsed > REFUSAL_TIME_LIMIT) {
    return { refundAmount: 0, returnFee: 0, driverCompensation: 0 };
  }
  
  const returnFee = calculateDeliveryPlatformFee(orderValue);
  const driverCompensation = returnFee; // Return fee goes to driver
  const refundAmount = orderValue - returnFee;
  
  return { refundAmount, returnFee, driverCompensation };
}

// Revenue Analytics
export function calculatePlatformRevenue(
  productSales: number,
  serviceSales: number,
  deliveryOrders: number,
  promotionSpend: number,
  subscriptions: number
): {
  productFees: number;
  serviceFees: number;
  deliveryFees: number;
  promotionRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
} {
  const productFees = productSales * FEE_STRUCTURE.PRODUCT_SALE_PERCENT;
  const serviceFees = serviceSales * FEE_STRUCTURE.SERVICE_RENTAL_PERCENT;
  const deliveryFees = deliveryOrders * FEE_STRUCTURE.DELIVERY_PLATFORM_PERCENT;
  const promotionRevenue = promotionSpend;
  const subscriptionRevenue = subscriptions * SUBSCRIPTION_TIERS.pro.monthlyFee;
  
  const totalRevenue = productFees + serviceFees + deliveryFees + promotionRevenue + subscriptionRevenue;
  
  return {
    productFees,
    serviceFees,
    deliveryFees,
    promotionRevenue,
    subscriptionRevenue,
    totalRevenue
  };
}

// Export managers for use in other modules
export { WalletManager, PromotionManager, SponsorshipManager };

// Example usage and testing
export function runRevenueExamples(): void {
  console.log('=== MarketPlace Revenue System Examples ===');
  
  // Add credits with bonus
  WalletManager.addCredits('user123', 10);
  console.log(`User balance after $10 load: $${WalletManager.getBalance('user123').toFixed(2)}`); // Should be $11
  
  // Calculate fees
  console.log(`Product sale fee for $100 item: $${calculateProductSaleFee(100).toFixed(2)}`); // $5
  console.log(`Service fee with insurance and verification: $${calculateRentalOrServiceFee(200, true, true).toFixed(2)}`); // $13
  
  // Driver payment example
  const driverPay = calculateDriverPayout(3, 3, 15, 10); // 3 pickups, 3 dropoffs, 15 miles, $10 tips
  console.log(`Driver payment: $${driverPay.toFixed(2)}`); // $35.50
  
  // Custom delivery examples
  console.log('\n=== Custom Delivery Integration Examples ===');
  
  const salePrice = 150;
  
  // Standard MarketPace delivery
  const marketpaceDelivery = calculateCustomDeliveryFee(salePrice, 'marketpace');
  console.log(`MarketPace delivery for $${salePrice} item:`);
  console.log(`  Platform fee: $${marketpaceDelivery.platformFee.toFixed(2)}`);
  console.log(`  Total cost: $${marketpaceDelivery.totalCost.toFixed(2)}`);
  console.log(`  Details: ${marketpaceDelivery.details}`);
  
  // Existing carrier (FedEx/UPS) integration
  const fedexDelivery = calculateCustomDeliveryFee(salePrice, 'existing_carrier', 12.50);
  console.log(`\nFedEx integration for $${salePrice} item:`);
  console.log(`  Platform fee: $${fedexDelivery.platformFee.toFixed(2)}`);
  console.log(`  Total cost: $${fedexDelivery.totalCost.toFixed(2)}`);
  console.log(`  Details: ${fedexDelivery.details}`);
  
  // Customer pickup
  const pickupOption = calculateCustomDeliveryFee(salePrice, 'pickup');
  console.log(`\nCustomer pickup for $${salePrice} item:`);
  console.log(`  Platform fee: $${pickupOption.platformFee.toFixed(2)}`);
  console.log(`  Total cost: $${pickupOption.totalCost.toFixed(2)}`);
  console.log(`  Details: ${pickupOption.details}`);
  
  // Custom shipping rates
  const customShipping = calculateCustomDeliveryFee(salePrice, 'custom', 8.00);
  console.log(`\nCustom shipping for $${salePrice} item:`);
  console.log(`  Platform fee: $${customShipping.platformFee.toFixed(2)}`);
  console.log(`  Total cost: $${customShipping.totalCost.toFixed(2)}`);
  console.log(`  Details: ${customShipping.details}`);
  
  // Sponsorship
  SponsorshipManager.addSponsorship('Joe\'s Auto', 50, 'Proud to support local delivery!');
  SponsorshipManager.addLocalPartner({
    name: 'Main St. Coffee',
    website: 'https://mainstcoffee.com',
    logoUrl: 'logo.png'
  });
  
  console.log('Active sponsors:', SponsorshipManager.getActiveSponsors().length);
  console.log('Local partners:', SponsorshipManager.getLocalPartners().length);
}

// Enhanced delivery fee calculation with vehicle types and item sizes
export function calculateEnhancedDeliveryFee(
  itemSize: 'small' | 'medium' | 'large',
  driverVehicleType: 'car' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'bicycle',
  distance: number = 5,
  tip: number = 0
): {
  baseFee: number;
  largeItemFee: number;
  platformCommission: number;
  driverPayout: number;
  buyerShare: number;
  sellerShare: number;
  totalDeliveryFee: number;
  details: string;
} {
  // Base delivery calculation
  const baseFee = DRIVER_PAYMENTS.PICKUP_FEE + DRIVER_PAYMENTS.DROPOFF_FEE + (DRIVER_PAYMENTS.MILEAGE_RATE * distance);
  
  // Large delivery bonus (only for large items requiring truck/van)
  const largeDeliveryBonus = (itemSize === 'large' && (driverVehicleType === 'truck' || driverVehicleType === 'van')) ? DRIVER_PAYMENTS.LARGE_DELIVERY_BONUS : 0;
  
  // Total delivery fee before tips
  const totalDeliveryFee = baseFee + largeDeliveryBonus;
  
  // Platform commission (5% of delivery fee, excluding tips)
  const platformCommission = totalDeliveryFee * FEE_STRUCTURE.DELIVERY_PLATFORM_PERCENT;
  
  // Driver payout (delivery fee minus platform commission + 100% of tips)
  const driverPayout = totalDeliveryFee - platformCommission + tip;
  
  // Split delivery fee between buyer and seller (50/50)
  const buyerShare = totalDeliveryFee / 2;
  const sellerShare = totalDeliveryFee / 2;
  
  // Validate vehicle can handle item size
  const canHandle = validateVehicleItemCompatibility(driverVehicleType, itemSize);
  
  const details = `
Item Size: ${itemSize.charAt(0).toUpperCase() + itemSize.slice(1)}
Vehicle: ${driverVehicleType.charAt(0).toUpperCase() + driverVehicleType.slice(1)}
Compatible: ${canHandle ? 'Yes' : 'No'}

Base Delivery: $${baseFee.toFixed(2)} ($${DRIVER_PAYMENTS.PICKUP_FEE} pickup + $${DRIVER_PAYMENTS.DROPOFF_FEE} dropoff + $${(DRIVER_PAYMENTS.MILEAGE_RATE * distance).toFixed(2)} mileage)
Large Delivery Bonus: $${largeDeliveryBonus.toFixed(2)}
Total Delivery Fee: $${totalDeliveryFee.toFixed(2)}

Fee Split:
- Buyer pays: $${buyerShare.toFixed(2)}
- Seller pays: $${sellerShare.toFixed(2)}
- Platform commission: $${platformCommission.toFixed(2)} (5%)
- Driver receives: $${driverPayout.toFixed(2)} (includes $${tip.toFixed(2)} tip)
  `.trim();
  
  return {
    baseFee,
    largeItemFee: largeDeliveryBonus,
    platformCommission,
    driverPayout,
    buyerShare,
    sellerShare,
    totalDeliveryFee,
    details
  };
}

// Vehicle and item size compatibility checker
export function validateVehicleItemCompatibility(
  vehicleType: 'car' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'bicycle',
  itemSize: 'small' | 'medium' | 'large'
): boolean {
  const compatibility = {
    bicycle: ['small'],
    motorcycle: ['small'],
    car: ['small', 'medium'],
    suv: ['small', 'medium', 'large'],
    van: ['small', 'medium', 'large'],
    truck: ['small', 'medium', 'large']
  };
  
  return compatibility[vehicleType]?.includes(itemSize) || false;
}

// Delivery route management with large item restriction
export interface DeliveryItem {
  id: string;
  size: 'small' | 'medium' | 'large';
  pickupAddress: string;
  dropoffAddress: string;
  weight?: number;
  description?: string;
}

export interface DeliveryRoute {
  id: string;
  driverId: string;
  items: DeliveryItem[];
  pickups: number;
  totalDistance: number;
  hasLargeItem: boolean;
  maxCapacityReached: boolean;
}

export class DeliveryRouteManager {
  private static routes: Map<string, DeliveryRoute> = new Map();
  
  static createRoute(driverId: string, pickups: number = 1): string {
    const routeId = `ROUTE_${Date.now()}`;
    const route: DeliveryRoute = {
      id: routeId,
      driverId,
      items: [],
      pickups: pickups, // For shop deliveries, usually 1 pickup with multiple dropoffs
      totalDistance: 0,
      hasLargeItem: false,
      maxCapacityReached: false
    };
    
    this.routes.set(routeId, route);
    return routeId;
  }
  
  static addItemToRoute(routeId: string, item: DeliveryItem): { 
    success: boolean; 
    message: string; 
    route?: DeliveryRoute 
  } {
    const route = this.routes.get(routeId);
    if (!route) {
      return { success: false, message: 'Route not found' };
    }
    
    // Check if route already has 6 items (max capacity)
    if (route.items.length >= 6) {
      return { success: false, message: 'Route at maximum capacity (6 items)' };
    }
    
    // Check large item restriction - only one large item per route
    if (item.size === 'large') {
      if (route.hasLargeItem) {
        return { success: false, message: 'Route already contains a large item. Only one large item per route allowed.' };
      }
      route.hasLargeItem = true;
    }
    
    // Add item to route
    route.items.push(item);
    
    // Update capacity status
    route.maxCapacityReached = route.items.length >= 6;
    
    this.routes.set(routeId, route);
    
    return { 
      success: true, 
      message: `Item added successfully. Route now has ${route.items.length}/6 items.`,
      route 
    };
  }
  
  static getRouteInfo(routeId: string): DeliveryRoute | undefined {
    return this.routes.get(routeId);
  }
  
  static calculateRouteEarnings(routeId: string, tip: number = 0): {
    totalEarnings: number;
    breakdown: {
      pickupPay: number;
      dropoffPay: number;
      mileage: number;
      largeDeliveryBonus: number;
      tips: number;
    };
    details: string;
  } {
    const route = this.routes.get(routeId);
    if (!route) {
      throw new Error('Route not found');
    }
    
    // For shop deliveries: 1 pickup can have multiple dropoffs
    const pickupPay = route.pickups * DRIVER_PAYMENTS.PICKUP_FEE;
    const dropoffPay = route.items.length * DRIVER_PAYMENTS.DROPOFF_FEE; // Each item is one dropoff
    const mileageFees = route.totalDistance * DRIVER_PAYMENTS.MILEAGE_RATE;
    const largeDeliveryBonus = route.hasLargeItem ? DRIVER_PAYMENTS.LARGE_DELIVERY_BONUS : 0;
    
    const totalBeforeTip = pickupPay + dropoffPay + mileageFees + largeDeliveryBonus;
    const platformCommission = (totalBeforeTip - largeDeliveryBonus) * FEE_STRUCTURE.DELIVERY_PLATFORM_PERCENT;
    const driverEarnings = totalBeforeTip - platformCommission + tip;
    
    const breakdown = {
      pickupPay: pickupPay,
      dropoffPay: dropoffPay,
      mileage: mileageFees,
      largeDeliveryBonus: largeDeliveryBonus,
      tips: tip
    };
    
    const details = `
Route ${routeId} Earnings:
- ${route.pickups} pickups × $4: $${pickupPay.toFixed(2)}
- ${route.items.length} dropoffs × $2: $${dropoffPay.toFixed(2)}
- ${route.totalDistance} miles × $0.50: $${mileageFees.toFixed(2)}
- Large delivery bonus: $${largeDeliveryBonus.toFixed(2)}
- Tips: $${tip.toFixed(2)}
- Platform commission: -$${platformCommission.toFixed(2)}
Total Driver Earnings: $${driverEarnings.toFixed(2)}
    `.trim();
    
    return {
      totalEarnings: driverEarnings,
      breakdown,
      details
    };
  }
}

// Get compatible drivers for specific item size
export function getCompatibleDrivers(
  itemSize: 'small' | 'medium' | 'large',
  allDrivers: { vehicleType: string; itemSizePreferences: any }[]
): any[] {
  return allDrivers.filter(driver => 
    validateVehicleItemCompatibility(driver.vehicleType as any, itemSize) &&
    driver.itemSizePreferences[itemSize]
  );
}