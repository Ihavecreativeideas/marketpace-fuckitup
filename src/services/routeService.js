// Route Service for driver dashboard functionality
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

class RouteService {
  
  // Get driver's current location
  async getDriverLocation() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/location`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch driver location');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching driver location:', error);
      throw error;
    }
  }

  // Get nearby routes ordered by distance
  async getNearbyRoutes(latitude, longitude) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/drivers/routes/nearby?lat=${latitude}&lng=${longitude}`,
        {
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch nearby routes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching nearby routes:', error);
      throw error;
    }
  }

  // Get available routes for the driver
  async getAvailableRoutes() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/available-routes`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available routes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching available routes:', error);
      throw error;
    }
  }

  // Accept a route
  async acceptRoute(routeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/accept-route/${routeId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to accept route');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error accepting route:', error);
      throw error;
    }
  }

  // Send message to customer about earlier delivery
  async messageCustomer(customerId, message, feeAdjustment = 0) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/messages/customer`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          message,
          feeAdjustment
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending customer message:', error);
      throw error;
    }
  }

  // Update driver status (online/offline)
  async updateDriverStatus(status) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/status`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating driver status:', error);
      throw error;
    }
  }

  // Get driver stats and earnings
  async getDriverStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/stats`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch driver stats');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      throw error;
    }
  }

  // Mark delivery as complete
  async completeDelivery(deliveryId, isLate = false) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/drivers/deliveries/${deliveryId}/complete`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            isLate,
            completedAt: new Date().toISOString()
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to mark delivery complete');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error completing delivery:', error);
      throw error;
    }
  }

  // Calculate estimated time for route
  calculateEstimatedTime(route) {
    if (!route) return 0;
    
    // Formula: 5 min buffer + 2 min per mile + 3 min per stop
    const bufferTime = (route.pickups + route.dropoffs) * 5; // 5 min per stop
    const drivingTime = route.mileage * 2; // 2 min per mile
    const stopTime = (route.pickups + route.dropoffs) * 3; // 3 min per stop
    
    return bufferTime + drivingTime + stopTime;
  }

  // Check if driver can start pickup (15 minutes early allowed)
  canStartPickup(route) {
    if (!route || !route.startTime) return false;
    
    const now = new Date();
    const routeStart = new Date(route.startTime);
    const earliestStart = new Date(routeStart.getTime() - 15 * 60 * 1000); // 15 minutes early
    
    return now >= earliestStart;
  }

  // Check if route is still accepting orders (20 minutes before start)
  isAcceptingOrders(route) {
    if (!route || !route.startTime) return false;
    
    const now = new Date();
    const routeStart = new Date(route.startTime);
    const deadline = new Date(routeStart.getTime() - 20 * 60 * 1000); // 20 minutes before
    
    return now < deadline;
  }

  // Format earnings display
  formatEarnings(amount) {
    return `$${(amount || 0).toFixed(2)}`;
  }

  // Format time display
  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }

  // Generate customer message templates
  getMessageTemplates() {
    return {
      earlyDelivery: {
        title: "Earlier Delivery Available",
        message: "Hi! I'm in your area and can deliver your order earlier than scheduled. Would you like delivery now for a $2 discount?",
        feeAdjustment: -2.00
      },
      routeChange: {
        title: "Route Optimization",
        message: "I can optimize my route to deliver to you first. This would save time and I can offer a $1 delivery discount.",
        feeAdjustment: -1.00
      },
      timeUpdate: {
        title: "Delivery Time Update",
        message: "Your delivery is running slightly ahead of schedule. I can deliver in the next 30 minutes if convenient.",
        feeAdjustment: 0.00
      }
    };
  }

  // Enhanced Shipt-style driver functions

  // Update delivery status with customer notifications
  async updateDeliveryStatus(deliveryId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update delivery status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating delivery status:', error);
      throw error;
    }
  }

  // Send pickup photo to buyer for confirmation
  async sendPickupPhoto(deliveryId, imageUri) {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'pickup_photo.jpg',
      });
      formData.append('deliveryId', deliveryId);

      const response = await fetch(`${API_BASE_URL}/api/drivers/deliveries/${deliveryId}/photo`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to send pickup photo');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending pickup photo:', error);
      throw error;
    }
  }

  // Handle buyer rejection and return to seller
  async returnToSeller(deliveryId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/deliveries/${deliveryId}/return`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'buyer_rejection',
          chargeBuyer: true // Buyer pays their delivery fee portion
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to return to seller');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error returning to seller:', error);
      throw error;
    }
  }

  // Bail on route and return to job board
  async bailRoute(routeId, reason) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/routes/${routeId}/bail`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to bail on route');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error bailing on route:', error);
      throw error;
    }
  }

  // Pause route functionality
  async pauseRoute(routeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/routes/${routeId}/pause`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to pause route');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error pausing route:', error);
      throw error;
    }
  }

  // Resume route functionality
  async resumeRoute(routeId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/routes/${routeId}/resume`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to resume route');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error resuming route:', error);
      throw error;
    }
  }

  // Calculate real-time ETA updates
  calculateUpdatedETA(delivery, currentTime) {
    const baseTime = 15; // Base time per delivery in minutes
    const distance = delivery.distance || 5; // Default 5 miles if unknown
    const driveTime = distance * 3; // 3 minutes per mile
    
    return new Date(currentTime.getTime() + (baseTime + driveTime) * 60 * 1000);
  }

  // Handle tipping from both buyer and seller
  async submitTip(deliveryId, tipAmount, tipperType) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/deliveries/${deliveryId}/tip`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: tipAmount,
          tipperType: tipperType // 'buyer' or 'seller'
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit tip');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error submitting tip:', error);
      throw error;
    }
  }

  // Update delivery method
  async updateDeliveryMethod(deliveryId, methodId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/drivers/deliveries/${deliveryId}/method`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ methodId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update delivery method');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating delivery method:', error);
      throw error;
    }
  }
}

export default new RouteService();