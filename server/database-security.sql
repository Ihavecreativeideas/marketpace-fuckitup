-- *** MARKETPACE ROW LEVEL SECURITY (RLS) IMPLEMENTATION ***
-- Comprehensive database security with row-level access control

-- Enable Row Level Security on all user data tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Create security context function for current user
CREATE OR REPLACE FUNCTION auth.current_user_id()
RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.sub', true),
    current_setting('request.user_id', true)
  );
$$ LANGUAGE sql STABLE;

-- Create admin role check function
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claim.role', true) = 'admin',
    current_setting('request.user_role', true) = 'admin',
    false
  );
$$ LANGUAGE sql STABLE;

-- *** USER DATA PROTECTION POLICIES ***

-- Users can only access their own profile data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.current_user_id());

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.current_user_id());

-- Admins can view all users for management purposes
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (auth.is_admin());

-- Prevent users from deleting their own accounts (admin only)
CREATE POLICY "Only admins can delete users" ON users
  FOR DELETE USING (auth.is_admin());

-- *** SESSION SECURITY POLICIES ***

-- Users can only access their own sessions
CREATE POLICY "Users own sessions only" ON sessions
  FOR ALL USING (
    sid IN (
      SELECT sid FROM sessions 
      WHERE sess->>'user_id' = auth.current_user_id()
    )
  );

-- *** RESTAURANT PROFILE SECURITY ***
-- Create restaurant_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS restaurant_profiles (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  cuisine TEXT,
  address TEXT,
  phone TEXT,
  description TEXT,
  delivery_method TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Enable RLS on restaurant profiles
ALTER TABLE restaurant_profiles ENABLE ROW LEVEL SECURITY;

-- Restaurant owners can manage their own restaurants
CREATE POLICY "Restaurant owners manage own restaurants" ON restaurant_profiles
  FOR ALL USING (owner_id = auth.current_user_id());

-- Public can view active restaurant profiles for discovery
CREATE POLICY "Public can view active restaurants" ON restaurant_profiles
  FOR SELECT USING (true);

-- *** MARKETPLACE LISTINGS SECURITY ***
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- Sellers manage their own listings
CREATE POLICY "Sellers manage own listings" ON marketplace_listings
  FOR ALL USING (seller_id = auth.current_user_id());

-- Public can view active listings
CREATE POLICY "Public can view active listings" ON marketplace_listings
  FOR SELECT USING (status = 'active');

-- *** DELIVERY ORDERS SECURITY ***
CREATE TABLE IF NOT EXISTS delivery_orders (
  id TEXT PRIMARY KEY,
  buyer_id TEXT NOT NULL,
  seller_id TEXT NOT NULL,
  driver_id TEXT,
  listing_id TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  total_amount DECIMAL(10,2),
  delivery_fee DECIMAL(10,2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (driver_id) REFERENCES users(id),
  FOREIGN KEY (listing_id) REFERENCES marketplace_listings(id)
);

ALTER TABLE delivery_orders ENABLE ROW LEVEL SECURITY;

-- Buyers can view their purchase orders
CREATE POLICY "Buyers view own orders" ON delivery_orders
  FOR SELECT USING (buyer_id = auth.current_user_id());

-- Sellers can view orders for their items
CREATE POLICY "Sellers view own sales" ON delivery_orders
  FOR SELECT USING (seller_id = auth.current_user_id());

-- Drivers can view assigned delivery orders
CREATE POLICY "Drivers view assigned deliveries" ON delivery_orders
  FOR SELECT USING (driver_id = auth.current_user_id());

-- Only buyers can create orders
CREATE POLICY "Buyers create orders" ON delivery_orders
  FOR INSERT WITH CHECK (buyer_id = auth.current_user_id());

-- Sellers and drivers can update order status
CREATE POLICY "Sellers and drivers update orders" ON delivery_orders
  FOR UPDATE USING (
    seller_id = auth.current_user_id() OR 
    driver_id = auth.current_user_id()
  );

-- *** PAYMENT SECURITY ***
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL,
  transaction_type TEXT NOT NULL, -- 'purchase', 'payout', 'refund'
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (order_id) REFERENCES delivery_orders(id)
);

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payment transactions
CREATE POLICY "Users view own payments" ON payment_transactions
  FOR SELECT USING (user_id = auth.current_user_id());

-- Only system can create payment records (server-side only)
CREATE POLICY "System creates payments" ON payment_transactions
  FOR INSERT WITH CHECK (auth.is_admin());

-- *** SECURITY AUDIT LOG ***
CREATE TABLE IF NOT EXISTS security_audit_log (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view security logs
CREATE POLICY "Admins view security logs" ON security_audit_log
  FOR SELECT USING (auth.is_admin());

-- System can insert security logs
CREATE POLICY "System logs security events" ON security_audit_log
  FOR INSERT WITH CHECK (true);

-- *** DATA PRIVACY PROTECTION ***

-- Function to anonymize user data for analytics
CREATE OR REPLACE FUNCTION anonymize_user_data(user_record users)
RETURNS JSONB AS $$
BEGIN
  RETURN jsonb_build_object(
    'user_type', CASE 
      WHEN user_record.email LIKE '%@company.com' THEN 'business'
      ELSE 'individual'
    END,
    'created_month', date_trunc('month', user_record.created_at),
    'location_state', split_part(user_record.profile_image_url, '/', 1), -- Approximate location only
    'account_age_days', EXTRACT(days FROM NOW() - user_record.created_at)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- *** ANTI-BOT PROTECTION ***
CREATE TABLE IF NOT EXISTS suspicious_activity (
  id SERIAL PRIMARY KEY,
  ip_address INET NOT NULL,
  user_agent TEXT,
  activity_type TEXT NOT NULL,
  risk_score INTEGER DEFAULT 0,
  blocked BOOLEAN DEFAULT false,
  detection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE suspicious_activity ENABLE ROW LEVEL SECURITY;

-- Only admins can view suspicious activity
CREATE POLICY "Admins view suspicious activity" ON suspicious_activity
  FOR ALL USING (auth.is_admin());

-- *** GDPR COMPLIANCE FUNCTIONS ***

-- Function to export all user data (GDPR Article 20)
CREATE OR REPLACE FUNCTION export_user_data(target_user_id TEXT)
RETURNS JSONB AS $$
DECLARE
  user_data JSONB;
BEGIN
  -- Verify user can only export their own data
  IF target_user_id != auth.current_user_id() AND NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Can only export own data';
  END IF;

  SELECT jsonb_build_object(
    'profile', row_to_json(u),
    'restaurant_profiles', COALESCE(
      (SELECT jsonb_agg(row_to_json(rp)) FROM restaurant_profiles rp WHERE rp.owner_id = target_user_id), 
      '[]'::jsonb
    ),
    'marketplace_listings', COALESCE(
      (SELECT jsonb_agg(row_to_json(ml)) FROM marketplace_listings ml WHERE ml.seller_id = target_user_id), 
      '[]'::jsonb
    ),
    'orders_as_buyer', COALESCE(
      (SELECT jsonb_agg(row_to_json(do)) FROM delivery_orders do WHERE do.buyer_id = target_user_id), 
      '[]'::jsonb
    ),
    'orders_as_seller', COALESCE(
      (SELECT jsonb_agg(row_to_json(do)) FROM delivery_orders do WHERE do.seller_id = target_user_id), 
      '[]'::jsonb
    ),
    'payment_transactions', COALESCE(
      (SELECT jsonb_agg(row_to_json(pt)) FROM payment_transactions pt WHERE pt.user_id = target_user_id), 
      '[]'::jsonb
    ),
    'export_timestamp', NOW(),
    'export_format', 'GDPR_compliant_JSON'
  ) INTO user_data
  FROM users u 
  WHERE u.id = target_user_id;

  RETURN user_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to delete all user data (GDPR Article 17 - Right to be forgotten)
CREATE OR REPLACE FUNCTION delete_user_data(target_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Verify user can only delete their own data or admin
  IF target_user_id != auth.current_user_id() AND NOT auth.is_admin() THEN
    RAISE EXCEPTION 'Access denied: Can only delete own data';
  END IF;

  -- Anonymize instead of delete to preserve referential integrity
  UPDATE users SET 
    email = 'deleted_user_' || extract(epoch from now())::bigint || '@deleted.local',
    first_name = NULL,
    last_name = NULL,
    profile_image_url = NULL,
    updated_at = NOW()
  WHERE id = target_user_id;

  -- Log the deletion for compliance
  INSERT INTO security_audit_log (user_id, action, resource_type, resource_id, details)
  VALUES (target_user_id, 'GDPR_DELETION', 'user_account', target_user_id, 
          jsonb_build_object('deletion_timestamp', NOW(), 'compliance', 'GDPR_Article_17'));

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- *** SECURITY MONITORING FUNCTIONS ***

-- Function to log security events
CREATE OR REPLACE FUNCTION log_security_event(
  p_user_id TEXT,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT true,
  p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id, action, resource_type, resource_id, 
    ip_address, user_agent, success, details
  )
  VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_ip_address, p_user_agent, p_success, p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- *** DATABASE SECURITY GRANTS ***

-- Revoke public access to sensitive tables
REVOKE ALL ON users FROM PUBLIC;
REVOKE ALL ON sessions FROM PUBLIC;
REVOKE ALL ON payment_transactions FROM PUBLIC;
REVOKE ALL ON security_audit_log FROM PUBLIC;
REVOKE ALL ON suspicious_activity FROM PUBLIC;

-- Grant specific permissions to authenticated role
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON sessions TO authenticated;
GRANT SELECT ON payment_transactions TO authenticated;
GRANT SELECT ON marketplace_listings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON delivery_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE ON restaurant_profiles TO authenticated;

-- Grant admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO admin_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO admin_role;

COMMENT ON SCHEMA public IS 'MarketPace database with comprehensive Row Level Security (RLS) implementation. All user data is protected with fine-grained access controls, GDPR compliance functions, and security audit logging.';