import { Request, Response } from 'express';
import { db } from './db';
import { users, suspiciousActivity, bannedUsers } from '../shared/schema';
import { eq, and, gte, count } from 'drizzle-orm';

// Anti-Bot Scammer Protection System
// Ensures only real humans become members

interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
  riskScore: number;
}

interface HumanVerificationData {
  email: string;
  phoneNumber: string;
  ipAddress: string;
  userAgent: string;
  signupBehavior: any;
  deviceFingerprint: string;
}

export class AntiScammerProtection {
  private static readonly SUSPICIOUS_PATTERNS = {
    // Email patterns that indicate bots
    emailPatterns: [
      /^[a-z0-9]+\d{4,}@/i, // Generic email with many numbers
      /^test\d+@/i,
      /^user\d+@/i,
      /^bot\d+@/i,
      /^fake\d+@/i,
      /^temp\d+@/i,
      /^\w{1,3}\d{5,}@/i // Very short name with many numbers
    ],
    
    // Phone patterns that indicate fake numbers
    phonePatterns: [
      /^(\+1)?555\d{7}$/, // 555 numbers (fake)
      /^(\+1)?111\d{7}$/, // 111 numbers (fake)
      /^(\+1)?000\d{7}$/, // 000 numbers (fake)
      /^(\+1)?123456789\d?$/, // Sequential numbers
    ],
    
    // User agent patterns indicating bots
    botUserAgents: [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /headless/i,
      /phantom/i,
      /selenium/i,
      /automation/i,
      /puppeteer/i,
      /playwright/i
    ]
  };

  // Analyze signup behavior for bot characteristics
  static analyzeBotBehavior(data: HumanVerificationData): BotDetectionResult {
    const reasons: string[] = [];
    let riskScore = 0;

    // Email analysis
    const emailRisk = this.analyzeEmail(data.email);
    if (emailRisk.isBot) {
      reasons.push(...emailRisk.reasons);
      riskScore += emailRisk.score;
    }

    // Phone analysis
    const phoneRisk = this.analyzePhone(data.phoneNumber);
    if (phoneRisk.isBot) {
      reasons.push(...phoneRisk.reasons);
      riskScore += phoneRisk.score;
    }

    // User agent analysis
    const userAgentRisk = this.analyzeUserAgent(data.userAgent);
    if (userAgentRisk.isBot) {
      reasons.push(...userAgentRisk.reasons);
      riskScore += userAgentRisk.score;
    }

    // Behavior timing analysis
    const timingRisk = this.analyzeSignupTiming(data.signupBehavior);
    if (timingRisk.isBot) {
      reasons.push(...timingRisk.reasons);
      riskScore += timingRisk.score;
    }

    // Device fingerprint analysis
    const deviceRisk = this.analyzeDeviceFingerprint(data.deviceFingerprint);
    if (deviceRisk.isBot) {
      reasons.push(...deviceRisk.reasons);
      riskScore += deviceRisk.score;
    }

    const confidence = Math.min(riskScore / 100, 1.0);
    const isBot = riskScore >= 70; // 70% threshold for bot detection

    return {
      isBot,
      confidence,
      reasons,
      riskScore
    };
  }

  // Analyze email for bot patterns
  private static analyzeEmail(email: string): { isBot: boolean; reasons: string[]; score: number } {
    const reasons: string[] = [];
    let score = 0;

    // Check against suspicious email patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS.emailPatterns) {
      if (pattern.test(email)) {
        reasons.push('Email follows bot-like pattern');
        score += 40;
        break;
      }
    }

    // Check for disposable email domains
    const disposableDomains = [
      '10minutemail.com', 'guerrillamail.com', 'mailinator.com',
      'tempmail.org', 'throwaway.email', 'temp-mail.org'
    ];
    
    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && disposableDomains.includes(domain)) {
      reasons.push('Disposable email domain detected');
      score += 60;
    }

    // Check for very new domains (potential red flag)
    if (domain && this.isNewDomain(domain)) {
      reasons.push('Email from newly registered domain');
      score += 20;
    }

    return { isBot: score >= 40, reasons, score };
  }

  // Analyze phone number for fake patterns
  private static analyzePhone(phoneNumber: string): { isBot: boolean; reasons: string[]; score: number } {
    const reasons: string[] = [];
    let score = 0;

    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // Check against fake phone patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS.phonePatterns) {
      if (pattern.test(phoneNumber)) {
        reasons.push('Phone number follows fake pattern');
        score += 80;
        break;
      }
    }

    // Check for repeated digits
    if (/(\d)\1{6,}/.test(cleanPhone)) {
      reasons.push('Phone contains excessive repeated digits');
      score += 50;
    }

    // Check for sequential numbers
    if (this.hasSequentialDigits(cleanPhone)) {
      reasons.push('Phone contains sequential digits');
      score += 30;
    }

    return { isBot: score >= 50, reasons, score };
  }

  // Analyze user agent for bot signatures
  private static analyzeUserAgent(userAgent: string): { isBot: boolean; reasons: string[]; score: number } {
    const reasons: string[] = [];
    let score = 0;

    if (!userAgent || userAgent.length < 10) {
      reasons.push('Missing or suspicious user agent');
      score += 70;
      return { isBot: true, reasons, score };
    }

    // Check against bot user agent patterns
    for (const pattern of this.SUSPICIOUS_PATTERNS.botUserAgents) {
      if (pattern.test(userAgent)) {
        reasons.push('User agent indicates automated browser');
        score += 90;
        break;
      }
    }

    // Check for headless browser indicators
    if (userAgent.includes('HeadlessChrome') || userAgent.includes('PhantomJS')) {
      reasons.push('Headless browser detected');
      score += 85;
    }

    return { isBot: score >= 70, reasons, score };
  }

  // Analyze signup timing for bot-like behavior
  private static analyzeSignupTiming(behavior: any): { isBot: boolean; reasons: string[]; score: number } {
    const reasons: string[] = [];
    let score = 0;

    if (!behavior) return { isBot: false, reasons, score };

    // Check form completion time (too fast = bot)
    if (behavior.formCompletionTime && behavior.formCompletionTime < 5000) { // Less than 5 seconds
      reasons.push('Form completed suspiciously fast');
      score += 60;
    }

    // Check for lack of mouse movement
    if (behavior.mouseMovements === 0) {
      reasons.push('No mouse movement detected');
      score += 40;
    }

    // Check for identical keystroke timing
    if (behavior.keystrokeTiming && this.hasIdenticalTimings(behavior.keystrokeTiming)) {
      reasons.push('Identical keystroke timing indicates automation');
      score += 70;
    }

    return { isBot: score >= 50, reasons, score };
  }

  // Analyze device fingerprint for suspicious characteristics
  private static analyzeDeviceFingerprint(fingerprint: string): { isBot: boolean; reasons: string[]; score: number } {
    const reasons: string[] = [];
    let score = 0;

    if (!fingerprint) {
      reasons.push('Missing device fingerprint');
      score += 30;
      return { isBot: false, reasons, score };
    }

    try {
      const fp = JSON.parse(fingerprint);
      
      // Check for headless browser characteristics
      if (fp.webdriver === true) {
        reasons.push('WebDriver detected');
        score += 90;
      }

      // Check for missing plugins
      if (fp.plugins && fp.plugins.length === 0) {
        reasons.push('No browser plugins detected');
        score += 40;
      }

      // Check for suspicious screen resolution
      if (fp.screenResolution === '1920x1080' && fp.timezone === 'UTC') {
        reasons.push('Default headless browser configuration');
        score += 60;
      }

    } catch (e) {
      reasons.push('Invalid device fingerprint format');
      score += 20;
    }

    return { isBot: score >= 60, reasons, score };
  }

  // Helper method to check for sequential digits
  private static hasSequentialDigits(phone: string): boolean {
    for (let i = 0; i < phone.length - 3; i++) {
      const seq = phone.substring(i, i + 4);
      if (/\d{4}/.test(seq)) {
        const digits = seq.split('').map(Number);
        if (digits[1] === digits[0] + 1 && digits[2] === digits[1] + 1 && digits[3] === digits[2] + 1) {
          return true;
        }
      }
    }
    return false;
  }

  // Helper method to check for identical keystroke timings
  private static hasIdenticalTimings(timings: number[]): boolean {
    if (timings.length < 3) return false;
    const firstTiming = timings[0];
    return timings.slice(1, 4).every(timing => Math.abs(timing - firstTiming) < 10);
  }

  // Helper method to check if domain is newly registered (simplified)
  private static isNewDomain(domain: string): boolean {
    // In production, this would check against a domain age API
    // For now, flag domains with suspicious TLDs
    const suspiciousTlds = ['.tk', '.ml', '.ga', '.cf', '.pw', '.xyz'];
    return suspiciousTlds.some(tld => domain.endsWith(tld));
  }

  // Log suspicious activity
  static async logSuspiciousActivity(
    email: string,
    activityType: string,
    details: any,
    ipAddress: string
  ): Promise<void> {
    try {
      await db.insert(suspiciousActivity).values({
        email,
        activityType,
        details: JSON.stringify(details),
        ipAddress,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to log suspicious activity:', error);
    }
  }

  // Ban user permanently
  static async banUser(
    email: string,
    reason: string,
    evidence: any,
    ipAddress: string
  ): Promise<void> {
    try {
      await db.insert(bannedUsers).values({
        email,
        reason,
        evidence: JSON.stringify(evidence),
        ipAddress,
        bannedAt: new Date()
      });

      console.log(`User banned: ${email} - Reason: ${reason}`);
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  }

  // Check if user is already banned
  static async isUserBanned(email: string, ipAddress: string): Promise<boolean> {
    try {
      const [bannedByEmail] = await db.select()
        .from(bannedUsers)
        .where(eq(bannedUsers.email, email))
        .limit(1);

      const [bannedByIP] = await db.select()
        .from(bannedUsers)
        .where(eq(bannedUsers.ipAddress, ipAddress))
        .limit(1);

      return !!(bannedByEmail || bannedByIP);
    } catch (error) {
      console.error('Failed to check ban status:', error);
      return false;
    }
  }

  // Rate limiting for signup attempts
  static async checkSignupRateLimit(ipAddress: string): Promise<boolean> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const [result] = await db.select({ count: count() })
        .from(suspiciousActivity)
        .where(
          and(
            eq(suspiciousActivity.ipAddress, ipAddress),
            eq(suspiciousActivity.activityType, 'signup_attempt'),
            gte(suspiciousActivity.timestamp, oneHourAgo)
          )
        );

      // Allow maximum 3 signup attempts per hour per IP
      return (result?.count || 0) < 3;
    } catch (error) {
      console.error('Failed to check signup rate limit:', error);
      return true; // Allow signup if check fails
    }
  }
}

// Data Privacy Protection Middleware
export class DataPrivacyProtection {
  // Ensure no user data is ever sold or shared with third parties
  static readonly PRIVACY_POLICY = {
    NO_DATA_SELLING: true,
    NO_THIRD_PARTY_SHARING: true,
    USER_DATA_OWNERSHIP: 'USER_OWNS_ALL_DATA',
    DATA_DELETION_RIGHT: true,
    TRANSPARENCY_REQUIREMENT: true
  };

  // Log any attempt to access user data
  static logDataAccess(userId: string, dataType: string, purpose: string, accessor: string): void {
    console.log(`DATA ACCESS LOG: User ${userId} - Type: ${dataType} - Purpose: ${purpose} - Accessor: ${accessor}`);
    
    // Alert if purpose is not legitimate
    const legitimatePurposes = [
      'user_authentication',
      'order_processing',
      'customer_support',
      'security_monitoring',
      'legal_compliance'
    ];

    if (!legitimatePurposes.includes(purpose)) {
      console.error(`PRIVACY VIOLATION ALERT: Illegitimate data access attempt - Purpose: ${purpose}`);
    }
  }

  // Prevent any data sharing with external parties
  static validateDataSharing(recipient: string, dataType: string): boolean {
    // NEVER allow data sharing with external parties
    const allowedRecipients = [
      'internal_system',
      'user_themselves',
      'legal_authority_with_warrant'
    ];

    const isAllowed = allowedRecipients.includes(recipient);
    
    if (!isAllowed) {
      console.error(`DATA SHARING BLOCKED: Attempted to share ${dataType} with ${recipient}`);
      throw new Error('Data sharing with external parties is strictly prohibited');
    }

    return isAllowed;
  }

  // Ensure user data is encrypted and secure
  static validateDataSecurity(data: any): boolean {
    // All sensitive data must be encrypted
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'bankAccount'];
    
    for (const field of sensitiveFields) {
      if (data[field] && !this.isEncrypted(data[field])) {
        throw new Error(`Sensitive field ${field} must be encrypted`);
      }
    }

    return true;
  }

  private static isEncrypted(data: string): boolean {
    // Check if data appears to be encrypted (simplified check)
    return data.startsWith('$2b$') || data.length > 50 && !/\s/.test(data);
  }
}

// API routes for scammer protection monitoring
export function registerScammerProtectionRoutes(app: any): void {
  
  // Admin endpoint to view suspicious activity
  app.get('/api/admin/suspicious-activity', async (req: any, res: any) => {
    try {
      const activities = await db.select().from(suspiciousActivity).limit(100);
      res.json({
        success: true,
        activities: activities.map(activity => ({
          ...activity,
          details: JSON.parse(activity.details || '{}')
        }))
      });
    } catch (error) {
      console.error('Failed to fetch suspicious activity:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch data' });
    }
  });

  // Admin endpoint to view banned users
  app.get('/api/admin/banned-users', async (req: any, res: any) => {
    try {
      const banned = await db.select().from(bannedUsers).limit(100);
      res.json({
        success: true,
        bannedUsers: banned.map(user => ({
          ...user,
          evidence: JSON.parse(user.evidence || '{}')
        }))
      });
    } catch (error) {
      console.error('Failed to fetch banned users:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch data' });
    }
  });

  // Endpoint to check if user is human-verified
  app.post('/api/verify-human', async (req: any, res: any) => {
    try {
      const { email, phoneNumber } = req.body;
      const ipAddress = req.ip || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';

      const verificationData = {
        email,
        phoneNumber: phoneNumber || '',
        ipAddress,
        userAgent,
        signupBehavior: req.body.behaviorData || {},
        deviceFingerprint: req.body.deviceFingerprint || ''
      };

      const botAnalysis = AntiScammerProtection.analyzeBotBehavior(verificationData);

      if (botAnalysis.isBot) {
        await AntiScammerProtection.logSuspiciousActivity(
          email,
          'human_verification_failed',
          botAnalysis,
          ipAddress
        );

        return res.status(403).json({
          success: false,
          isHuman: false,
          riskScore: botAnalysis.riskScore,
          message: 'Bot behavior detected. Only real humans can access MarketPace.'
        });
      }

      // Log successful human verification
      await AntiScammerProtection.logSuspiciousActivity(
        email,
        'human_verification_passed',
        { riskScore: botAnalysis.riskScore },
        ipAddress
      );

      res.json({
        success: true,
        isHuman: true,
        riskScore: botAnalysis.riskScore,
        message: 'Human verification successful.'
      });

    } catch (error) {
      console.error('Human verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Verification failed. Please try again.'
      });
    }
  });

  // CAPTCHA verification endpoint
  app.post('/api/verify-captcha', async (req: any, res: any) => {
    try {
      const { email, captchaResponse } = req.body;
      const ipAddress = req.ip || 'unknown';

      // Simple CAPTCHA verification (in production, use real CAPTCHA service)
      if (!captchaResponse || captchaResponse.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'CAPTCHA verification required.'
        });
      }

      // Log CAPTCHA completion
      await AntiScammerProtection.logSuspiciousActivity(
        email,
        'captcha_completed',
        { captchaResponse },
        ipAddress
      );

      res.json({
        success: true,
        message: 'CAPTCHA verified successfully.'
      });

    } catch (error) {
      console.error('CAPTCHA verification error:', error);
      res.status(500).json({
        success: false,
        message: 'CAPTCHA verification failed.'
      });
    }
  });
}