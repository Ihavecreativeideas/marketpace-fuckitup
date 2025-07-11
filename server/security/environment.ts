import { config } from 'dotenv';

// Load environment variables
config();

// Security configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  AUTH_RATE_LIMIT_MAX: 5, // Lower limit for auth endpoints
  
  // Session configuration
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
  SESSION_MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
  
  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
  JWT_EXPIRES_IN: '24h',
  
  // Password requirements
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIRE_UPPERCASE: true,
  PASSWORD_REQUIRE_LOWERCASE: true,
  PASSWORD_REQUIRE_NUMBERS: true,
  PASSWORD_REQUIRE_SYMBOLS: true,
  
  // File upload limits
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  // API security
  API_KEY_LENGTH: 32,
  API_KEY_EXPIRY: 30 * 24 * 60 * 60 * 1000, // 30 days
};

// Validate required environment variables
export function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = [
    'DATABASE_URL',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'STRIPE_SECRET_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'FACEBOOK_APP_ID',
    'FACEBOOK_APP_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

// Mask sensitive values in logs
export function maskSensitiveData(data: any): any {
  if (typeof data === 'string') {
    // Mask common sensitive patterns
    return data
      .replace(/password[^&]*/gi, 'password=***')
      .replace(/token[^&]*/gi, 'token=***')
      .replace(/key[^&]*/gi, 'key=***')
      .replace(/secret[^&]*/gi, 'secret=***');
  }
  
  if (typeof data === 'object' && data !== null) {
    const masked: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (['password', 'token', 'key', 'secret', 'apiKey', 'accessToken'].some(sensitive => 
        key.toLowerCase().includes(sensitive))) {
        masked[key] = '***';
      } else {
        masked[key] = maskSensitiveData(value);
      }
    }
    return masked;
  }
  
  return data;
}

// Generate secure random strings
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Secure credential storage (for production, use proper secret management)
export class SecureCredentials {
  private static credentials = new Map<string, string>();
  
  static store(key: string, value: string): void {
    this.credentials.set(key, value);
  }
  
  static retrieve(key: string): string | undefined {
    return this.credentials.get(key);
  }
  
  static delete(key: string): boolean {
    return this.credentials.delete(key);
  }
  
  static rotate(key: string): string {
    const newValue = generateSecureToken();
    this.credentials.set(key, newValue);
    return newValue;
  }
}

// Environment variable getters with fallbacks
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value || defaultValue!;
}

export function getEnvVarBoolean(key: string, defaultValue: boolean = false): boolean {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

export function getEnvVarNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  const parsed = parseInt(value || '0', 10);
  return isNaN(parsed) ? (defaultValue || 0) : parsed;
}

// Security monitoring
export class SecurityMonitor {
  private static events: Array<{ type: string; timestamp: Date; details: any }> = [];
  
  static logSecurityEvent(type: string, details: any): void {
    this.events.push({
      type,
      timestamp: new Date(),
      details: maskSensitiveData(details)
    });
    
    // Keep only last 1000 events
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }
    
    // Log critical events
    if (['failed_auth', 'rate_limit_exceeded', 'csrf_attack', 'xss_attempt'].includes(type)) {
      console.warn(`[SECURITY] ${type}:`, maskSensitiveData(details));
    }
  }
  
  static getSecurityEvents(limit: number = 100): any[] {
    return this.events.slice(-limit);
  }
  
  static getSecurityStats(): any {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp > last24h);
    
    const stats: any = {};
    recentEvents.forEach(event => {
      stats[event.type] = (stats[event.type] || 0) + 1;
    });
    
    return {
      totalEvents: recentEvents.length,
      eventTypes: stats,
      lastUpdated: new Date()
    };
  }
}