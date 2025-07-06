import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { v4 as uuidv4 } from 'uuid';

interface BehaviorEvent {
  eventType: string;
  page?: string;
  element?: string;
  data?: any;
  timestamp: Date;
}

interface SessionData {
  sessionId: string;
  deviceType: string;
  browser: string;
  location?: any;
  startTime: Date;
}

interface SearchEvent {
  query: string;
  category?: string;
  resultsShown?: number;
  timeSpent?: number;
}

interface PurchaseEvent {
  orderId: number;
  category?: string;
  subcategory?: string;
  priceRange?: string;
}

class DataCollectionClient {
  private sessionId: string;
  private sessionStartTime: Date;
  private pageStartTime: Date | null = null;
  private currentPage: string | null = null;
  private eventQueue: BehaviorEvent[] = [];
  private isTrackingEnabled: boolean = true;
  private userId: string | null = null;

  constructor() {
    this.sessionId = uuidv4();
    this.sessionStartTime = new Date();
    this.initializeSession();
  }

  // Initialize session tracking
  private async initializeSession() {
    try {
      const sessionData: SessionData = {
        sessionId: this.sessionId,
        deviceType: Platform.OS,
        browser: Platform.OS === 'web' ? navigator?.userAgent || 'unknown' : 'mobile-app',
        startTime: this.sessionStartTime,
      };

      // Get location if permissions allow
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          sessionData.location = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
          };
        }
      } catch (error) {
        console.log('Location tracking not available');
      }

      // Send session data to server
      await this.sendToServer('/api/track/session', sessionData);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }

  // Set user ID when user logs in
  setUserId(userId: string) {
    this.userId = userId;
  }

  // Enable/disable tracking based on privacy settings
  setTrackingEnabled(enabled: boolean) {
    this.isTrackingEnabled = enabled;
  }

  // Track page views and navigation
  trackPageView(page: string, metadata?: any) {
    if (!this.isTrackingEnabled) return;

    // End previous page session
    if (this.currentPage && this.pageStartTime) {
      const timeSpent = Date.now() - this.pageStartTime.getTime();
      this.trackEvent('page_exit', this.currentPage, undefined, {
        timeSpent: Math.round(timeSpent / 1000), // seconds
        ...metadata
      });
    }

    // Start new page session
    this.currentPage = page;
    this.pageStartTime = new Date();
    
    this.trackEvent('page_view', page, undefined, metadata);
  }

  // Track user interactions (clicks, taps, etc.)
  trackInteraction(element: string, page?: string, data?: any) {
    if (!this.isTrackingEnabled) return;

    this.trackEvent('interaction', page || this.currentPage, element, {
      ...data,
      timestamp: new Date().toISOString()
    });
  }

  // Track scroll behavior
  trackScroll(page: string, scrollPosition: number, maxScroll: number) {
    if (!this.isTrackingEnabled) return;

    const scrollPercentage = Math.round((scrollPosition / maxScroll) * 100);
    
    this.trackEvent('scroll', page, undefined, {
      scrollPosition,
      scrollPercentage,
      maxScroll
    });
  }

  // Track search behavior
  async trackSearch(searchData: SearchEvent) {
    if (!this.isTrackingEnabled) return;

    try {
      await this.sendToServer('/api/track/search', {
        ...searchData,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }

  // Track purchase behavior
  async trackPurchase(purchaseData: PurchaseEvent) {
    if (!this.isTrackingEnabled) return;

    try {
      await this.sendToServer('/api/track/purchase', {
        ...purchaseData,
        dayOfWeek: new Date().getDay(),
        hourOfDay: new Date().getHours(),
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error tracking purchase:', error);
    }
  }

  // Track form interactions
  trackFormEvent(formName: string, fieldName: string, eventType: 'focus' | 'blur' | 'input' | 'submit', value?: any) {
    if (!this.isTrackingEnabled) return;

    this.trackEvent('form_interaction', this.currentPage, `${formName}.${fieldName}`, {
      formName,
      fieldName,
      eventType,
      value: eventType === 'input' ? (value?.length || 0) : value, // Don't track actual input, just length
    });
  }

  // Track device and browser fingerprinting data
  async trackDeviceFingerprint() {
    if (!this.isTrackingEnabled) return;

    try {
      const fingerprint: any = {
        screen: {
          width: Platform.OS === 'web' ? window.screen?.width : undefined,
          height: Platform.OS === 'web' ? window.screen?.height : undefined,
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: Platform.OS === 'web' ? navigator.language : 'en-US',
        platform: Platform.OS,
      };

      if (Platform.OS === 'web') {
        fingerprint.userAgent = navigator.userAgent;
        fingerprint.cookieEnabled = navigator.cookieEnabled;
        fingerprint.onlineStatus = navigator.onLine;
      }

      // Create a simple hash for fingerprinting
      const fingerprintString = JSON.stringify(fingerprint);
      const hash = await this.simpleHash(fingerprintString);

      await this.sendToServer('/api/track/device-fingerprint', {
        fingerprintHash: hash,
        browserData: fingerprint,
        ...fingerprint
      });
    } catch (error) {
      console.error('Error tracking device fingerprint:', error);
    }
  }

  // Track user interests based on time spent on different categories
  trackInterest(category: string, subcategory?: string, timeSpent: number = 0) {
    if (!this.isTrackingEnabled) return;

    this.trackEvent('interest_signal', this.currentPage, category, {
      category,
      subcategory,
      timeSpent,
      strength: this.calculateInterestStrength(timeSpent)
    });
  }

  // Track social connections (when users interact with other users)
  trackSocialConnection(connectedUserId: string, connectionType: 'view' | 'follow' | 'message' | 'purchase') {
    if (!this.isTrackingEnabled) return;

    this.trackEvent('social_interaction', this.currentPage, connectionType, {
      connectedUserId,
      connectionType,
      strength: this.calculateConnectionStrength(connectionType)
    });
  }

  // Track ad interactions
  trackAdInteraction(adId: string, campaignId: string, interactionType: 'impression' | 'click' | 'conversion', value?: number) {
    if (!this.isTrackingEnabled) return;

    const apiEndpoint = `/api/advertising/${interactionType}`;
    const data: any = {
      campaignId: parseInt(campaignId),
      creativeId: parseInt(adId),
      userId: this.userId,
      timestamp: new Date()
    };

    if (interactionType === 'impression') {
      data.placement = this.currentPage;
      data.cost = 0.001; // Default CPM cost
    } else if (interactionType === 'click') {
      data.clickType = 'link_click';
      data.cost = 0.25; // Default CPC cost
    } else if (interactionType === 'conversion') {
      data.conversionType = 'purchase';
      data.value = value || 0;
    }

    this.sendToServer(apiEndpoint, data);
  }

  // Core event tracking method
  private trackEvent(eventType: string, page?: string, element?: string, data?: any) {
    if (!this.isTrackingEnabled) return;

    const event: BehaviorEvent = {
      eventType,
      page: page || this.currentPage || undefined,
      element,
      data,
      timestamp: new Date()
    };

    this.eventQueue.push(event);

    // Send events in batches to reduce server load
    if (this.eventQueue.length >= 10) {
      this.flushEventQueue();
    }
  }

  // Send queued events to server
  private async flushEventQueue() {
    if (this.eventQueue.length === 0) return;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      for (const event of events) {
        await this.sendToServer('/api/track/behavior', {
          sessionId: this.sessionId,
          ...event
        });
      }
    } catch (error) {
      console.error('Error flushing event queue:', error);
      // Re-add events to queue if sending failed
      this.eventQueue.unshift(...this.eventQueue);
    }
  }

  // Send data to server
  private async sendToServer(endpoint: string, data: any) {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Error sending data to ${endpoint}:`, error);
    }
  }

  // Calculate interest strength based on engagement
  private calculateInterestStrength(timeSpent: number): number {
    if (timeSpent < 30) return 0.1;
    if (timeSpent < 120) return 0.3;
    if (timeSpent < 300) return 0.5;
    if (timeSpent < 600) return 0.7;
    return 1.0;
  }

  // Calculate social connection strength
  private calculateConnectionStrength(connectionType: string): number {
    switch (connectionType) {
      case 'view': return 0.1;
      case 'follow': return 0.5;
      case 'message': return 0.7;
      case 'purchase': return 1.0;
      default: return 0.1;
    }
  }

  // Simple hash function for fingerprinting
  private async simpleHash(str: string): Promise<string> {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // End session when app is closed
  endSession() {
    if (this.pageStartTime && this.currentPage) {
      const timeSpent = Date.now() - this.pageStartTime.getTime();
      this.trackEvent('page_exit', this.currentPage, undefined, {
        timeSpent: Math.round(timeSpent / 1000)
      });
    }

    this.trackEvent('session_end', undefined, undefined, {
      sessionDuration: Date.now() - this.sessionStartTime.getTime(),
      totalEvents: this.eventQueue.length
    });

    this.flushEventQueue();
  }

  // GDPR compliance - allow users to request their data
  async requestDataExport(): Promise<any> {
    try {
      const response = await fetch('/api/privacy/export', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        return await response.blob(); // Download file
      }
    } catch (error) {
      console.error('Error requesting data export:', error);
    }
  }

  // Update privacy settings
  async updatePrivacySettings(settings: any) {
    try {
      const response = await fetch('/api/privacy/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        this.setTrackingEnabled(settings.allowBehaviorTracking !== false);
      }
    } catch (error) {
      console.error('Error updating privacy settings:', error);
    }
  }
}

// Global instance
export const dataCollector = new DataCollectionClient();

// React Hook for easy integration
export const useDataCollection = () => {
  return {
    trackPageView: dataCollector.trackPageView.bind(dataCollector),
    trackInteraction: dataCollector.trackInteraction.bind(dataCollector),
    trackScroll: dataCollector.trackScroll.bind(dataCollector),
    trackSearch: dataCollector.trackSearch.bind(dataCollector),
    trackPurchase: dataCollector.trackPurchase.bind(dataCollector),
    trackFormEvent: dataCollector.trackFormEvent.bind(dataCollector),
    trackInterest: dataCollector.trackInterest.bind(dataCollector),
    trackSocialConnection: dataCollector.trackSocialConnection.bind(dataCollector),
    trackAdInteraction: dataCollector.trackAdInteraction.bind(dataCollector),
    setUserId: dataCollector.setUserId.bind(dataCollector),
    setTrackingEnabled: dataCollector.setTrackingEnabled.bind(dataCollector),
    requestDataExport: dataCollector.requestDataExport.bind(dataCollector),
    updatePrivacySettings: dataCollector.updatePrivacySettings.bind(dataCollector),
  };
};

export default dataCollector;