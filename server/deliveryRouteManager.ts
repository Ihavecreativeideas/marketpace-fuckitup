import { Twilio } from 'twilio';

// Twilio setup for SMS notifications
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient: Twilio | null = null;
if (accountSid && authToken) {
  twilioClient = new Twilio(accountSid, authToken);
}

export interface DeliveryItem {
  id: string;
  orderId: string;
  sellerId: string;
  buyerId: string;
  buyerPhone: string;
  sellerPhone: string;
  itemName: string;
  itemSize: 'small' | 'medium' | 'large';
  pickupAddress: string;
  deliveryAddress: string;
  estimatedWeight: number;
  isFragile: boolean;
  specialInstructions?: string;
  price: number;
  deliveryFee: number;
}

export interface DriverProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: 'car' | 'suv' | 'truck' | 'van' | 'motorcycle' | 'bicycle';
  hasTrailer: boolean;
  itemSizePreferences: {
    small: boolean;
    medium: boolean;
    large: boolean;
  };
  isActive: boolean;
  currentRouteId?: string;
}

export interface DeliveryRoute {
  id: string;
  driverId: string;
  timeSlot: '9am-12pm' | '12pm-3pm' | '3pm-6pm' | '6pm-9pm';
  items: DeliveryItem[];
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  totalEarnings: number;
  hasLargeItem: boolean;
  estimatedMileage: number;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
}

class DeliveryRouteManager {
  private static routes: Map<string, DeliveryRoute> = new Map();
  private static drivers: Map<string, DriverProfile> = new Map();
  private static pendingItems: DeliveryItem[] = [];

  /**
   * Register a new driver profile
   */
  static registerDriver(driverData: Omit<DriverProfile, 'id' | 'isActive'>): string {
    const driverId = 'DRIVER-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    const driver: DriverProfile = {
      id: driverId,
      ...driverData,
      isActive: true
    };

    this.drivers.set(driverId, driver);
    
    console.log('Driver registered:', {
      id: driverId,
      name: driver.name,
      vehicle: driver.vehicleType,
      hasTrailer: driver.hasTrailer,
      preferences: driver.itemSizePreferences
    });

    return driverId;
  }

  /**
   * Add item to delivery queue and attempt route assignment
   */
  static addDeliveryItem(item: DeliveryItem): void {
    this.pendingItems.push(item);
    console.log(`Added ${item.itemSize} item "${item.itemName}" to delivery queue`);
    
    // Try to assign to existing route or create new one
    this.assignItemToRoute(item);
  }

  /**
   * Create optimized delivery route with item size constraints
   */
  private static assignItemToRoute(item: DeliveryItem): void {
    // Find suitable drivers for this item size
    const suitableDrivers = Array.from(this.drivers.values()).filter(driver => {
      return driver.isActive && 
             !driver.currentRouteId && 
             driver.itemSizePreferences[item.itemSize] &&
             (item.itemSize !== 'large' || (driver.hasTrailer && (driver.vehicleType === 'truck' || driver.vehicleType === 'suv')));
    });

    if (suitableDrivers.length === 0) {
      console.log(`No suitable drivers available for ${item.itemSize} item: ${item.itemName}`);
      return;
    }

    // Check if item can fit in existing routes
    let assignedToExistingRoute = false;
    
    for (const route of this.routes.values()) {
      if (route.status === 'pending' && this.canAddItemToRoute(route, item)) {
        route.items.push(item);
        route.totalEarnings += this.calculateItemEarnings(item);
        
        if (item.itemSize === 'large') {
          route.hasLargeItem = true;
        }
        
        console.log(`Added ${item.itemSize} item to existing route ${route.id}`);
        assignedToExistingRoute = true;
        break;
      }
    }

    // Create new route if couldn't add to existing
    if (!assignedToExistingRoute) {
      this.createNewRoute(suitableDrivers[0], item);
    }
  }

  /**
   * Check if item can be added to existing route
   */
  private static canAddItemToRoute(route: DeliveryRoute, item: DeliveryItem): boolean {
    // Maximum 6 items per route
    if (route.items.length >= 6) {
      return false;
    }

    // Only one large item per route
    if (item.itemSize === 'large' && route.hasLargeItem) {
      return false;
    }

    if (route.hasLargeItem && item.itemSize === 'large') {
      return false;
    }

    // Check driver can handle this item size
    const driver = this.drivers.get(route.driverId);
    if (!driver || !driver.itemSizePreferences[item.itemSize]) {
      return false;
    }

    // Large items require truck + trailer
    if (item.itemSize === 'large' && (!driver.hasTrailer || (driver.vehicleType !== 'truck' && driver.vehicleType !== 'suv'))) {
      return false;
    }

    return true;
  }

  /**
   * Create new delivery route
   */
  private static createNewRoute(driver: DriverProfile, firstItem: DeliveryItem): string {
    const routeId = 'ROUTE-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
    
    const route: DeliveryRoute = {
      id: routeId,
      driverId: driver.id,
      timeSlot: this.getNextAvailableTimeSlot(),
      items: [firstItem],
      status: 'pending',
      totalEarnings: this.calculateItemEarnings(firstItem),
      hasLargeItem: firstItem.itemSize === 'large',
      estimatedMileage: 10, // Base estimate, would be calculated with actual addresses
      createdAt: new Date()
    };

    this.routes.set(routeId, route);
    driver.currentRouteId = routeId;

    console.log(`Created new route ${routeId} for driver ${driver.name} with ${firstItem.itemSize} item`);
    
    return routeId;
  }

  /**
   * Driver removes item from route due to space constraints
   */
  static async removeItemFromRoute(routeId: string, itemId: string, reason: string): Promise<boolean> {
    const route = this.routes.get(routeId);
    if (!route) {
      return false;
    }

    const itemIndex = route.items.findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return false;
    }

    const removedItem = route.items[itemIndex];
    route.items.splice(itemIndex, 1);
    route.totalEarnings -= this.calculateItemEarnings(removedItem);

    if (removedItem.itemSize === 'large') {
      route.hasLargeItem = false;
    }

    // Send SMS notification to buyer and seller
    await this.sendItemRemovalNotification(removedItem, reason);

    // Add item back to pending queue for next available route
    this.pendingItems.push(removedItem);

    console.log(`Removed item ${removedItem.itemName} from route ${routeId}: ${reason}`);
    
    return true;
  }

  /**
   * Send SMS notification when item is removed from route
   */
  private static async sendItemRemovalNotification(item: DeliveryItem, reason: string): Promise<void> {
    if (!twilioClient || !twilioPhone) {
      console.log('Twilio not configured - would send SMS notification');
      return;
    }

    const buyerMessage = `MarketPace Update: Your order "${item.itemName}" couldn't fit in the delivery vehicle (${reason}). It has been automatically moved to the next available delivery route. You'll receive an updated delivery time soon. Questions? Reply HELP`;

    const sellerMessage = `MarketPace Update: Your sold item "${item.itemName}" was moved to the next delivery route due to vehicle space constraints (${reason}). The buyer has been notified. New pickup time coming soon.`;

    try {
      // Send to buyer
      await twilioClient.messages.create({
        body: buyerMessage,
        from: twilioPhone,
        to: item.buyerPhone
      });

      // Send to seller
      await twilioClient.messages.create({
        body: sellerMessage,
        from: twilioPhone,
        to: item.sellerPhone
      });

      console.log(`SMS notifications sent for removed item: ${item.itemName}`);
    } catch (error) {
      console.error('Error sending SMS notifications:', error);
    }
  }

  /**
   * Calculate driver earnings for specific item
   */
  private static calculateItemEarnings(item: DeliveryItem): number {
    let earnings = 4; // Base pickup fee
    earnings += 2; // Base dropoff fee
    earnings += 0.5 * 2; // Estimated mileage (would be calculated with real addresses)

    // Large item bonus
    if (item.itemSize === 'large') {
      earnings += 25;
    }

    return earnings;
  }

  /**
   * Get next available time slot
   */
  private static getNextAvailableTimeSlot(): '9am-12pm' | '12pm-3pm' | '3pm-6pm' | '6pm-9pm' {
    const timeSlots: Array<'9am-12pm' | '12pm-3pm' | '3pm-6pm' | '6pm-9pm'> = 
      ['9am-12pm', '12pm-3pm', '3pm-6pm', '6pm-9pm'];
    
    const currentHour = new Date().getHours();
    
    if (currentHour < 9) return '9am-12pm';
    if (currentHour < 12) return '12pm-3pm';
    if (currentHour < 15) return '3pm-6pm';
    if (currentHour < 18) return '6pm-9pm';
    
    // After 6pm, schedule for next day starting at 9am
    return '9am-12pm';
  }

  /**
   * Get route information
   */
  static getRoute(routeId: string): DeliveryRoute | undefined {
    return this.routes.get(routeId);
  }

  /**
   * Get all routes for a driver
   */
  static getDriverRoutes(driverId: string): DeliveryRoute[] {
    return Array.from(this.routes.values()).filter(route => route.driverId === driverId);
  }

  /**
   * Get route statistics
   */
  static getRouteStats() {
    const routes = Array.from(this.routes.values());
    const drivers = Array.from(this.drivers.values());
    
    return {
      totalRoutes: routes.length,
      pendingRoutes: routes.filter(r => r.status === 'pending').length,
      activeRoutes: routes.filter(r => r.status === 'in_progress').length,
      completedRoutes: routes.filter(r => r.status === 'completed').length,
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.isActive).length,
      largeItemCapableDrivers: drivers.filter(d => d.hasTrailer && d.itemSizePreferences.large).length,
      pendingItems: this.pendingItems.length,
      totalEarningsPaid: routes
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + r.totalEarnings, 0)
    };
  }

  /**
   * Demo: Create sample delivery items and drivers
   */
  static createDemoData(): void {
    // Register demo drivers
    this.registerDriver({
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      vehicleType: 'truck',
      hasTrailer: true,
      itemSizePreferences: { small: true, medium: true, large: true }
    });

    this.registerDriver({
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1234567891',
      vehicleType: 'car',
      hasTrailer: false,
      itemSizePreferences: { small: true, medium: true, large: false }
    });

    // Add demo delivery items
    const demoItems: Omit<DeliveryItem, 'id'>[] = [
      {
        orderId: 'ORDER-001',
        sellerId: 'SELLER-001',
        buyerId: 'BUYER-001',
        buyerPhone: '+1555000001',
        sellerPhone: '+1555000002',
        itemName: 'Large Sectional Sofa',
        itemSize: 'large',
        pickupAddress: '123 Seller St, Seattle, WA',
        deliveryAddress: '456 Buyer Ave, Seattle, WA',
        estimatedWeight: 150,
        isFragile: false,
        price: 800,
        deliveryFee: 50
      },
      {
        orderId: 'ORDER-002',
        sellerId: 'SELLER-002',
        buyerId: 'BUYER-002',
        buyerPhone: '+1555000003',
        sellerPhone: '+1555000004',
        itemName: 'iPhone 14',
        itemSize: 'small',
        pickupAddress: '789 Tech Rd, Seattle, WA',
        deliveryAddress: '321 Mobile Ln, Seattle, WA',
        estimatedWeight: 1,
        isFragile: true,
        price: 600,
        deliveryFee: 8
      },
      {
        orderId: 'ORDER-003',
        sellerId: 'SELLER-003',
        buyerId: 'BUYER-003',
        buyerPhone: '+1555000005',
        sellerPhone: '+1555000006',
        itemName: 'Grocery Box',
        itemSize: 'medium',
        pickupAddress: '555 Market St, Seattle, WA',
        deliveryAddress: '777 Food Ave, Seattle, WA',
        estimatedWeight: 25,
        isFragile: false,
        price: 45,
        deliveryFee: 12
      }
    ];

    demoItems.forEach((itemData, index) => {
      const item: DeliveryItem = {
        id: `ITEM-${String(index + 1).padStart(3, '0')}`,
        ...itemData
      };
      this.addDeliveryItem(item);
    });

    console.log('Demo delivery data created successfully');
  }
}

export default DeliveryRouteManager;