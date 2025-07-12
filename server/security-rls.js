// *** MARKETPACE ROW LEVEL SECURITY (RLS) MIDDLEWARE ***
// Comprehensive database security with user context and access control

const { Pool } = require('pg');

// Database connection with RLS support
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Security context middleware - sets user context for RLS
function setSecurityContext(req, res, next) {
  // Extract user ID from session or JWT token
  const userId = req.user?.id || req.session?.userId || req.headers['x-user-id'];
  const userRole = req.user?.role || req.session?.userRole || 'user';
  
  if (userId) {
    // Set PostgreSQL session variables for RLS
    req.dbContext = {
      userId: userId,
      userRole: userRole,
      isAdmin: userRole === 'admin'
    };
    
    console.log('🔒 RLS Context Set:', {
      userId: userId.substring(0, 8) + '...',
      userRole: userRole,
      endpoint: req.originalUrl
    });
  } else {
    // Anonymous user context
    req.dbContext = {
      userId: null,
      userRole: 'anonymous',
      isAdmin: false
    };
    
    console.log('🔓 Anonymous Access:', req.originalUrl);
  }
  
  next();
}

// Execute query with security context
async function executeSecureQuery(query, params = [], userContext = null) {
  const client = await pool.connect();
  
  try {
    // Set security context for this session
    if (userContext) {
      await client.query('SET request.user_id = $1', [userContext.userId || '']);
      await client.query('SET request.user_role = $1', [userContext.userRole || 'anonymous']);
      
      console.log('🛡️ RLS Query Context:', {
        userId: userContext.userId?.substring(0, 8) + '...' || 'anonymous',
        role: userContext.userRole,
        query: query.substring(0, 50) + '...'
      });
    }
    
    // Execute the query with RLS active
    const result = await client.query(query, params);
    
    // Log successful data access
    if (userContext?.userId && (query.toLowerCase().includes('select') || query.toLowerCase().includes('insert'))) {
      await logSecurityEvent(
        userContext.userId,
        query.toLowerCase().includes('select') ? 'DATA_ACCESS' : 'DATA_MODIFY',
        'database_query',
        null,
        null,
        null,
        true,
        { query_type: query.split(' ')[0].toUpperCase(), row_count: result.rowCount }
      );
    }
    
    return result;
  } catch (error) {
    // Log failed data access
    if (userContext?.userId) {
      await logSecurityEvent(
        userContext.userId,
        'DATA_ACCESS_FAILED',
        'database_query',
        null,
        null,
        null,
        false,
        { error_message: error.message, query_type: query.split(' ')[0].toUpperCase() }
      );
    }
    
    console.error('🚨 RLS Query Failed:', {
      error: error.message,
      userId: userContext?.userId?.substring(0, 8) + '...' || 'anonymous',
      query: query.substring(0, 100) + '...'
    });
    
    throw error;
  } finally {
    // Reset session variables
    try {
      await client.query('RESET request.user_id');
      await client.query('RESET request.user_role');
    } catch (resetError) {
      console.warn('Failed to reset session variables:', resetError.message);
    }
    
    client.release();
  }
}

// Security audit logging function
async function logSecurityEvent(userId, action, resourceType, resourceId = null, ipAddress = null, userAgent = null, success = true, details = null) {
  try {
    await executeSecureQuery(
      `INSERT INTO security_audit_log 
       (user_id, action, resource_type, resource_id, ip_address, user_agent, success, details) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, action, resourceType, resourceId, ipAddress, userAgent, success, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    console.error('Failed to log security event:', error.message);
  }
}

// User data access functions with RLS
class SecureUserService {
  // Get user profile (RLS ensures users only see their own data)
  static async getUserProfile(userId, userContext) {
    const result = await executeSecureQuery(
      'SELECT id, email, first_name, last_name, profile_image_url, created_at FROM users WHERE id = $1',
      [userId],
      userContext
    );
    return result.rows[0];
  }
  
  // Create user profile
  static async createUser(userData, userContext) {
    const { id, email, firstName, lastName, profileImageUrl } = userData;
    
    const result = await executeSecureQuery(
      `INSERT INTO users (id, email, first_name, last_name, profile_image_url, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING *`,
      [id, email, firstName, lastName, profileImageUrl],
      userContext
    );
    
    await logSecurityEvent(
      id,
      'USER_CREATED',
      'user_profile',
      id,
      null,
      null,
      true,
      { account_type: 'new_user' }
    );
    
    return result.rows[0];
  }
  
  // Update user profile (RLS ensures users only update their own data)
  static async updateUser(userId, updateData, userContext) {
    const { email, firstName, lastName, profileImageUrl } = updateData;
    
    const result = await executeSecureQuery(
      `UPDATE users 
       SET email = COALESCE($2, email), 
           first_name = COALESCE($3, first_name), 
           last_name = COALESCE($4, last_name), 
           profile_image_url = COALESCE($5, profile_image_url), 
           updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [userId, email, firstName, lastName, profileImageUrl],
      userContext
    );
    
    if (result.rows.length === 0) {
      throw new Error('Unauthorized: Cannot update user profile');
    }
    
    await logSecurityEvent(
      userId,
      'USER_UPDATED',
      'user_profile',
      userId,
      null,
      null,
      true,
      { fields_updated: Object.keys(updateData) }
    );
    
    return result.rows[0];
  }
  
  // GDPR data export
  static async exportUserData(userId, userContext) {
    if (!userContext.isAdmin && userContext.userId !== userId) {
      throw new Error('Unauthorized: Can only export own data');
    }
    
    const result = await executeSecureQuery(
      'SELECT export_user_data($1) as user_data',
      [userId],
      userContext
    );
    
    await logSecurityEvent(
      userId,
      'GDPR_DATA_EXPORT',
      'user_data',
      userId,
      null,
      null,
      true,
      { compliance: 'GDPR_Article_20', export_size: JSON.stringify(result.rows[0].user_data).length }
    );
    
    return result.rows[0].user_data;
  }
  
  // GDPR account deletion
  static async deleteUserData(userId, userContext) {
    if (!userContext.isAdmin && userContext.userId !== userId) {
      throw new Error('Unauthorized: Can only delete own data');
    }
    
    const result = await executeSecureQuery(
      'SELECT delete_user_data($1) as deleted',
      [userId],
      userContext
    );
    
    return result.rows[0].deleted;
  }
}

// Restaurant data access with RLS
class SecureRestaurantService {
  // Create restaurant profile (RLS ensures owner_id matches current user)
  static async createRestaurant(restaurantData, userContext) {
    const { id, name, cuisine, address, phone, description, deliveryMethod } = restaurantData;
    
    const result = await executeSecureQuery(
      `INSERT INTO restaurant_profiles 
       (id, owner_id, name, cuisine, address, phone, description, delivery_method, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()) 
       RETURNING *`,
      [id, userContext.userId, name, cuisine, address, phone, description, deliveryMethod],
      userContext
    );
    
    await logSecurityEvent(
      userContext.userId,
      'RESTAURANT_CREATED',
      'restaurant_profile',
      id,
      null,
      null,
      true,
      { restaurant_name: name, cuisine_type: cuisine }
    );
    
    return result.rows[0];
  }
  
  // Get user's restaurants (RLS ensures users only see their own restaurants)
  static async getUserRestaurants(userContext) {
    const result = await executeSecureQuery(
      'SELECT * FROM restaurant_profiles WHERE owner_id = $1 ORDER BY created_at DESC',
      [userContext.userId],
      userContext
    );
    
    return result.rows;
  }
  
  // Get public restaurant listings (RLS allows public read access)
  static async getPublicRestaurants(location = null, cuisine = null) {
    let query = 'SELECT id, name, cuisine, address, phone, description, delivery_method FROM restaurant_profiles WHERE TRUE';
    let params = [];
    let paramCount = 0;
    
    if (location) {
      paramCount++;
      query += ` AND address ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }
    
    if (cuisine) {
      paramCount++;
      query += ` AND cuisine = $${paramCount}`;
      params.push(cuisine);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 50';
    
    const result = await executeSecureQuery(query, params);
    return result.rows;
  }
}

// Anti-bot protection functions
class SecurityProtection {
  // Detect suspicious activity
  static async detectSuspiciousActivity(req) {
    const userAgent = req.get('User-Agent') || '';
    const ipAddress = req.ip || req.connection.remoteAddress;
    
    let riskScore = 0;
    let detectionReasons = [];
    
    // Bot detection patterns
    if (!userAgent.includes('Mozilla') && !userAgent.includes('Chrome') && !userAgent.includes('Safari')) {
      riskScore += 30;
      detectionReasons.push('suspicious_user_agent');
    }
    
    if (userAgent.toLowerCase().includes('bot') || userAgent.toLowerCase().includes('crawler')) {
      riskScore += 50;
      detectionReasons.push('known_bot_signature');
    }
    
    // Check for rapid requests from same IP
    const recentRequests = await executeSecureQuery(
      `SELECT COUNT(*) as request_count 
       FROM security_audit_log 
       WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
      [ipAddress]
    );
    
    if (recentRequests.rows[0].request_count > 20) {
      riskScore += 40;
      detectionReasons.push('rapid_requests');
    }
    
    // Log suspicious activity
    if (riskScore > 50) {
      await executeSecureQuery(
        `INSERT INTO suspicious_activity 
         (ip_address, user_agent, activity_type, risk_score, blocked, detection_reason) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [ipAddress, userAgent, 'potential_bot', riskScore, riskScore > 80, detectionReasons.join(', ')]
      );
      
      console.warn('🚨 SUSPICIOUS ACTIVITY DETECTED:', {
        ip: ipAddress,
        userAgent: userAgent.substring(0, 50),
        riskScore: riskScore,
        reasons: detectionReasons
      });
    }
    
    return {
      riskScore,
      blocked: riskScore > 80,
      reasons: detectionReasons
    };
  }
  
  // Check if IP is blocked
  static async isBlocked(ipAddress) {
    const result = await executeSecureQuery(
      'SELECT blocked FROM suspicious_activity WHERE ip_address = $1 AND blocked = true ORDER BY created_at DESC LIMIT 1',
      [ipAddress]
    );
    
    return result.rows.length > 0;
  }
}

module.exports = {
  setSecurityContext,
  executeSecureQuery,
  logSecurityEvent,
  SecureUserService,
  SecureRestaurantService,
  SecurityProtection,
  pool
};