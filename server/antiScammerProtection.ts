import { Express, Request, Response } from 'express';

// In-memory storage (use database in real deployment)
let users: { [key: string]: any } = {};
let reports: { [key: string]: number } = {};
let trustScores: { [key: string]: number } = {};
let messages: { [key: string]: number[] } = {};

// Constants
const MAX_ACTIONS_PER_MINUTE = 60;
const MIN_TIME_BETWEEN_ACTIONS_MS = 500;
const REPORT_THRESHOLD = 3;
const TRUST_SCORE_DEFAULT = 50;

// Utility: Log action with timestamp
function logAction(userId: string) {
  const now = Date.now();
  if (!messages[userId]) messages[userId] = [];
  messages[userId].push(now);
  messages[userId] = messages[userId].filter(ts => now - ts <= 60000); // Keep only last 1 minute
}

// Detect Bot-Like Behavior
function isBot(userId: string): boolean {
  const times = messages[userId] || [];
  const rapidActions = times.filter((t, i, arr) => i > 0 && (t - arr[i - 1]) < MIN_TIME_BETWEEN_ACTIONS_MS);
  return (times.length > MAX_ACTIONS_PER_MINUTE || rapidActions.length > 5);
}

// Trust Score Calculation
function initializeTrustScore(userId: string) {
  trustScores[userId] = TRUST_SCORE_DEFAULT;
}

function adjustTrustScore(userId: string, delta: number) {
  if (!trustScores[userId]) initializeTrustScore(userId);
  trustScores[userId] += delta;
}

function getTrustScore(userId: string): number {
  return trustScores[userId] || TRUST_SCORE_DEFAULT;
}

// Reporting System
function reportUser(reportedId: string) {
  if (!reports[reportedId]) reports[reportedId] = 0;
  reports[reportedId]++;
  adjustTrustScore(reportedId, -10);
  if (reports[reportedId] >= REPORT_THRESHOLD) {
    flagForReview(reportedId);
  }
}

function flagForReview(userId: string) {
  console.warn(`User ${userId} flagged for review.`);
  if (users[userId]) {
    users[userId].status = "under_review";
  }
}

// Phone & Email Verification Flags
function verifyEmail(userId: string) {
  if (!users[userId]) users[userId] = {};
  users[userId].emailVerified = true;
  adjustTrustScore(userId, 5);
}

function verifyPhone(userId: string) {
  if (!users[userId]) users[userId] = {};
  users[userId].phoneVerified = true;
  adjustTrustScore(userId, 10);
}

// Check if User is Allowed to Post
function canPost(userId: string): boolean {
  const trust = getTrustScore(userId);
  const verified = users[userId]?.emailVerified && users[userId]?.phoneVerified;
  return trust > 30 && verified;
}

// Example: Simulate posting
function tryToPost(userId: string): boolean {
  logAction(userId);
  if (isBot(userId)) {
    console.log(`User ${userId} blocked due to bot-like behavior.`);
    return false;
  }
  if (!canPost(userId)) {
    console.log(`User ${userId} can't post. Trust score too low or not verified.`);
    return false;
  }
  console.log(`User ${userId} posted successfully.`);
  return true;
}

// Security Dashboard Data
export interface SecurityStats {
  totalUsers: number;
  flaggedUsers: number;
  averageTrustScore: number;
  recentReports: number;
  botDetections: number;
  verifiedUsers: number;
}

export function getSecurityStats(): SecurityStats {
  const totalUsers = Object.keys(users).length;
  const flaggedUsers = Object.values(users).filter(u => u.status === 'under_review').length;
  const avgTrust = Object.values(trustScores).reduce((a, b) => a + b, 0) / Object.keys(trustScores).length || 0;
  const recentReports = Object.values(reports).reduce((a, b) => a + b, 0);
  const verifiedUsers = Object.values(users).filter(u => u.emailVerified && u.phoneVerified).length;
  
  return {
    totalUsers,
    flaggedUsers,
    averageTrustScore: Math.round(avgTrust),
    recentReports,
    botDetections: Object.keys(messages).filter(userId => isBot(userId)).length,
    verifiedUsers
  };
}

// User Safety Functions
export function getUserSafetyInfo(userId: string) {
  return {
    trustScore: getTrustScore(userId),
    emailVerified: users[userId]?.emailVerified || false,
    phoneVerified: users[userId]?.phoneVerified || false,
    status: users[userId]?.status || 'active',
    reportCount: reports[userId] || 0,
    canPost: canPost(userId),
    isBot: isBot(userId)
  };
}

export function registerScammerProtectionRoutes(app: Express): void {
  // Security dashboard for admins
  app.get('/api/security/stats', (req, res) => {
    res.json(getSecurityStats());
  });

  // User safety information
  app.get('/api/security/user/:userId', (req, res) => {
    const { userId } = req.params;
    res.json(getUserSafetyInfo(userId));
  });

  // Report user endpoint
  app.post('/api/security/report', (req, res) => {
    const { reportedUserId, reason } = req.body;
    if (!reportedUserId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    reportUser(reportedUserId);
    res.json({ 
      message: 'Report submitted successfully',
      reportCount: reports[reportedUserId] || 0
    });
  });

  // Verify email endpoint
  app.post('/api/security/verify-email', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    verifyEmail(userId);
    res.json({ 
      message: 'Email verified successfully',
      trustScore: getTrustScore(userId)
    });
  });

  // Verify phone endpoint
  app.post('/api/security/verify-phone', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    verifyPhone(userId);
    res.json({ 
      message: 'Phone verified successfully',
      trustScore: getTrustScore(userId)
    });
  });

  // Check if user can post
  app.post('/api/security/check-post', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const canUserPost = tryToPost(userId);
    res.json({ 
      canPost: canUserPost,
      userInfo: getUserSafetyInfo(userId)
    });
  });

  // Get user trust score
  app.get('/api/security/trust-score/:userId', (req, res) => {
    const { userId } = req.params;
    res.json({ 
      trustScore: getTrustScore(userId),
      canPost: canPost(userId)
    });
  });
}