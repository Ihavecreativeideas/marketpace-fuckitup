-- MarketPace Database Indexes for Thousands of Members
-- These indexes are CRITICAL for performance at scale

-- ========== USER AND PROFILE INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_pro ON users(is_pro) WHERE is_pro = true;
CREATE INDEX IF NOT EXISTS idx_users_location ON users(business_address) WHERE business_address IS NOT NULL;

-- ========== MYPACE CHECK-INS INDEXES ==========
-- Most critical - check-ins will be queried constantly
CREATE INDEX IF NOT EXISTS idx_mypace_checkins_user_created ON mypace_checkins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mypace_checkins_created ON mypace_checkins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mypace_checkins_location ON mypace_checkins(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_mypace_checkins_event ON mypace_checkins(event_id) WHERE event_id IS NOT NULL;

-- ========== EVENT CHECK-INS INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_event_checkins_event_created ON event_checkins(event_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_checkins_user ON event_checkins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_event_checkins_qr ON event_checkins(qr_code_id) WHERE qr_code_id IS NOT NULL;

-- ========== EVENTS INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_location ON events(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_public ON events(is_public, start_date DESC) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category, start_date DESC);

-- ========== COMMUNITY POSTS INDEXES ==========
-- If community posts table exists (not found in current schema but likely needed)
-- CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_community_posts_user ON community_posts(user_id, created_at DESC);

-- ========== BUSINESS & EMPLOYEE INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_type ON businesses(type);
CREATE INDEX IF NOT EXISTS idx_employees_business_created ON employees(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_user ON employees(user_id) WHERE user_id IS NOT NULL;

-- ========== SOCIAL INTERACTION INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_mypace_likes_checkin ON mypace_checkin_likes(checkin_id);
CREATE INDEX IF NOT EXISTS idx_mypace_likes_user ON mypace_checkin_likes(user_id, created_at DESC);

-- ========== LOYALTY SYSTEM INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_loyalty_programs_business ON loyalty_programs(business_id);
CREATE INDEX IF NOT EXISTS idx_supporter_tiers_user ON supporter_tiers(user_id);
CREATE INDEX IF NOT EXISTS idx_supporter_tiers_business ON supporter_tiers(business_id);

-- ========== SCHEDULING INDEXES ==========
CREATE INDEX IF NOT EXISTS idx_schedules_business_start ON schedules(business_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_employee ON schedules(employee_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_schedules_status ON schedules(status, start_time DESC);

-- ========== SEARCH OPTIMIZATION INDEXES ==========
-- Full-text search indexes for business/event discovery
CREATE INDEX IF NOT EXISTS idx_businesses_name_search ON businesses USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_events_title_search ON events USING gin(to_tsvector('english', title));

-- ========== PERFORMANCE MONITORING ==========
-- Run this query to check index usage:
-- SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- ORDER BY idx_tup_read DESC;