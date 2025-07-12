import { Request, Response, NextFunction } from 'express';
import { DataPrivacyProtection } from './antiScammerProtection';

// Middleware to enforce data privacy policies
export class DataPrivacyMiddleware {
  
  // Prevent any external data sharing
  static preventDataSharing = (req: Request, res: Response, next: NextFunction) => {
    // Override response methods to monitor data output
    const originalJson = res.json;
    const originalSend = res.send;
    
    res.json = function(data: any) {
      // Log data access for transparency
      if (req.user?.id) {
        DataPrivacyProtection.logDataAccess(
          req.user.id,
          'json_response',
          req.route?.path || req.path,
          'internal_system'
        );
      }
      
      // Check if response contains sensitive data
      DataPrivacyMiddleware.validateDataOutput(data, req.path);
      
      return originalJson.call(this, data);
    };
    
    res.send = function(data: any) {
      // Log data access
      if (req.user?.id) {
        DataPrivacyProtection.logDataAccess(
          req.user.id,
          'send_response',
          req.route?.path || req.path,
          'internal_system'
        );
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };

  // Validate that no sensitive data is being exposed inappropriately
  static validateDataOutput(data: any, endpoint: string): void {
    if (!data) return;
    
    try {
      const dataString = JSON.stringify(data);
      
      // Check for accidental exposure of sensitive fields
      const sensitivePatterns = [
        /password/i,
        /passwordHash/i,
        /secret/i,
        /private/i,
        /ssn/i,
        /creditCard/i,
        /bankAccount/i
      ];
      
      for (const pattern of sensitivePatterns) {
        if (pattern.test(dataString)) {
          console.error(`🚨 PRIVACY VIOLATION: Sensitive data detected in response to ${endpoint}`);
          throw new Error('Sensitive data exposure prevented');
        }
      }
      
      // Ensure no unauthorized external data sharing
      if (endpoint.includes('/api/external/') || endpoint.includes('/api/share/')) {
        console.error(`🚨 DATA SHARING BLOCKED: Attempted external data sharing via ${endpoint}`);
        throw new Error('External data sharing is prohibited');
      }
      
    } catch (error) {
      if (error instanceof Error && error.message.includes('prevented')) {
        throw error; // Re-throw privacy violations
      }
      // Ignore JSON parsing errors for non-JSON responses
    }
  }

  // Add privacy headers to all responses
  static addPrivacyHeaders = (req: Request, res: Response, next: NextFunction) => {
    // Clear privacy policy headers
    res.setHeader('X-Data-Policy', 'NO_SELLING_NO_SHARING');
    res.setHeader('X-User-Data-Owner', 'USER');
    res.setHeader('X-Privacy-Compliance', 'GDPR_CCPA_COMPLIANT');
    res.setHeader('X-Bot-Protection', 'ACTIVE');
    
    // Prevent data mining and scraping
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, nosnippet, noarchive');
    
    next();
  };

  // Monitor for unauthorized data access attempts
  static monitorDataAccess = (req: Request, res: Response, next: NextFunction) => {
    // Flag suspicious data access patterns
    const suspiciousPatterns = [
      /\/api\/users\/bulk/,
      /\/api\/users\/export/,
      /\/api\/data\/dump/,
      /\/api\/analytics\/users/,
      /limit=\d{3,}/, // Large data requests
      /batch=\d{2,}/, // Batch requests
    ];
    
    const requestUrl = req.originalUrl || req.url;
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(requestUrl)) {
        console.warn(`🔍 SUSPICIOUS DATA ACCESS: ${requestUrl} from IP ${req.ip}`);
        
        // Log for investigation
        if (req.user?.id) {
          DataPrivacyProtection.logDataAccess(
            req.user.id,
            'suspicious_bulk_access',
            requestUrl,
            'unknown_accessor'
          );
        }
        
        // Block if clearly malicious
        if (requestUrl.includes('dump') || requestUrl.includes('export')) {
          return res.status(403).json({
            error: 'Access denied. Bulk data export is not permitted.'
          });
        }
      }
    }
    
    next();
  };

  // Enforce data retention limits
  static enforceDataRetention = (req: Request, res: Response, next: NextFunction) => {
    // Add data retention information to responses
    res.setHeader('X-Data-Retention-Policy', '7_YEARS_MAX');
    res.setHeader('X-Data-Deletion-Rights', 'USER_CAN_DELETE_ANYTIME');
    
    next();
  };

  // Block known data harvesting user agents
  static blockDataHarvesters = (req: Request, res: Response, next: NextFunction) => {
    const userAgent = req.get('User-Agent') || '';
    
    const harvestingPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /harvester/i,
      /extractor/i,
      /data.*collector/i,
      /automated/i
    ];
    
    for (const pattern of harvestingPatterns) {
      if (pattern.test(userAgent)) {
        console.log(`🚫 DATA HARVESTER BLOCKED: ${userAgent} from IP ${req.ip}`);
        return res.status(403).json({
          error: 'Automated data collection is not permitted on this platform.'
        });
      }
    }
    
    next();
  };

  // Comprehensive privacy protection middleware stack
  static fullPrivacyProtection = [
    DataPrivacyMiddleware.addPrivacyHeaders,
    DataPrivacyMiddleware.blockDataHarvesters,
    DataPrivacyMiddleware.monitorDataAccess,
    DataPrivacyMiddleware.preventDataSharing,
    DataPrivacyMiddleware.enforceDataRetention
  ];
}

// Express middleware to ensure NEVER SELL DATA policy
export function enforceNeverSellDataPolicy(req: Request, res: Response, next: NextFunction) {
  // Add legally binding headers
  res.setHeader('X-Never-Sell-Data', 'LEGALLY_BINDING_COMMITMENT');
  res.setHeader('X-Data-Ownership', 'USER_OWNS_ALL_DATA');
  res.setHeader('X-Revenue-Model', 'FEES_ONLY_NO_DATA_SALES');
  
  // Block any endpoints that might be used for data selling
  const prohibitedPaths = [
    '/api/sell-data',
    '/api/share-data',
    '/api/export-for-partners',
    '/api/marketing-data',
    '/api/user-insights',
    '/api/analytics-export'
  ];
  
  if (prohibitedPaths.some(path => req.path.includes(path))) {
    console.error(`🚨 ILLEGAL DATA SALE ATTEMPT BLOCKED: ${req.path} from IP ${req.ip}`);
    return res.status(403).json({
      error: 'Data selling is permanently prohibited by MarketPace policy.',
      policy: 'NEVER_SELL_USER_DATA'
    });
  }
  
  next();
}

// Log all user data access for transparency
export function logUserDataAccess(req: Request, res: Response, next: NextFunction) {
  if (req.user?.id && req.path.includes('/api/user')) {
    DataPrivacyProtection.logDataAccess(
      req.user.id,
      'user_data_access',
      req.path,
      req.user.id // User accessing their own data
    );
  }
  
  next();
}