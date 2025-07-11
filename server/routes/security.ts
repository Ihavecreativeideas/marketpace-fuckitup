import { Router } from 'express';
import { SecurityMonitor } from '../security/environment';
import { SessionManager, TwoFactorAuth, AccountLockout } from '../security/auth';
import { 
  requireAuth, 
  requireAdmin, 
  rateLimit,
  validateAndSanitize 
} from '../security/validation';
import { body } from 'express-validator';

const router = Router();

// Security dashboard (admin only)
router.get('/dashboard', requireAuth, requireAdmin, (req, res) => {
  const stats = SecurityMonitor.getSecurityStats();
  const recentEvents = SecurityMonitor.getSecurityEvents(50);
  
  res.json({
    success: true,
    data: {
      stats,
      recentEvents,
      timestamp: new Date()
    }
  });
});

// Get security events (admin only)
router.get('/events', requireAuth, requireAdmin, (req, res) => {
  const limit = parseInt(req.query.limit as string) || 100;
  const events = SecurityMonitor.getSecurityEvents(limit);
  
  res.json({
    success: true,
    data: events
  });
});

// Endpoint for checking account lockout status
router.post('/check-lockout', [
  body('identifier').isEmail().normalizeEmail(),
  validateAndSanitize,
  rateLimit(60000, 10) // 10 requests per minute
], (req, res) => {
  const { identifier } = req.body;
  
  const isLocked = AccountLockout.isLocked(identifier);
  const failedAttempts = AccountLockout.getFailedAttempts(identifier);
  
  res.json({
    success: true,
    data: {
      isLocked,
      failedAttempts,
      maxAttempts: 5
    }
  });
});

// Generate 2FA code
router.post('/2fa/generate', [
  body('userId').isAlphanumeric().isLength({ min: 3, max: 50 }),
  validateAndSanitize,
  rateLimit(60000, 3) // 3 requests per minute
], requireAuth, (req, res) => {
  const { userId } = req.body;
  
  // Verify user can generate 2FA code
  if (req.user.userId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  
  const code = TwoFactorAuth.createVerification(userId);
  
  // In production, send via SMS/email instead of returning
  res.json({
    success: true,
    message: 'Verification code generated',
    // Remove this in production
    code: process.env.NODE_ENV === 'development' ? code : undefined
  });
});

// Verify 2FA code
router.post('/2fa/verify', [
  body('userId').isAlphanumeric().isLength({ min: 3, max: 50 }),
  body('code').isNumeric().isLength({ min: 6, max: 6 }),
  validateAndSanitize,
  rateLimit(60000, 5) // 5 requests per minute
], requireAuth, (req, res) => {
  const { userId, code } = req.body;
  
  // Verify user can verify 2FA code
  if (req.user.userId !== userId && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized'
    });
  }
  
  const isValid = TwoFactorAuth.verifyCode(userId, code);
  
  if (!isValid) {
    SecurityMonitor.logSecurityEvent('2fa_verification_failed', { 
      userId,
      ip: req.ip 
    });
  }
  
  res.json({
    success: isValid,
    message: isValid ? 'Code verified successfully' : 'Invalid or expired code'
  });
});

// Get active sessions (user's own sessions)
router.get('/sessions', requireAuth, (req, res) => {
  // In a real implementation, you'd query from database
  res.json({
    success: true,
    data: {
      message: 'Session management not fully implemented',
      currentSession: req.user
    }
  });
});

// Revoke all sessions for user
router.post('/sessions/revoke-all', requireAuth, (req, res) => {
  const userId = req.user.userId;
  const count = SessionManager.destroyUserSessions(userId);
  
  res.json({
    success: true,
    message: `${count} sessions revoked`,
    data: { revokedSessions: count }
  });
});

// Report security incident
router.post('/report', [
  body('type').isIn(['suspicious_activity', 'phishing', 'spam', 'fraud', 'abuse']),
  body('description').isLength({ min: 10, max: 1000 }),
  body('targetUserId').optional().isAlphanumeric(),
  validateAndSanitize,
  rateLimit(3600000, 5) // 5 reports per hour
], (req, res) => {
  const { type, description, targetUserId } = req.body;
  
  SecurityMonitor.logSecurityEvent('security_report', {
    reportType: type,
    description,
    targetUserId,
    reportedBy: req.user?.userId || 'anonymous',
    ip: req.ip
  });
  
  res.json({
    success: true,
    message: 'Security report submitted successfully'
  });
});

// Health check endpoint
router.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.json({
    success: true,
    data: {
      uptime: Math.floor(uptime),
      memory: {
        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024)
      },
      timestamp: new Date()
    }
  });
});

export default router;