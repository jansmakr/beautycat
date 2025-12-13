-- beautycat.kr Cloudflare D1 데이터베이스 스키마
-- 완전한 상용 서비스를 위한 테이블 구조

-- 1. 사용자 테이블
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'shop', 'admin')),
    phone TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    shop_id TEXT,
    state TEXT,                  -- 시/도 (예: 서울특별시)
    district TEXT,               -- 구/군 (예: 강남구)
    detail_address TEXT,         -- 상세 주소
    is_verified INTEGER DEFAULT 0,  -- 이메일 인증 여부 (0: 미인증, 1: 인증완료)
    cafe_platform TEXT,          -- 제휴 카페 플랫폼 (예: 'naver')
    cafe_id TEXT,                -- 제휴 카페 회원 ID
    email_verified INTEGER DEFAULT 0,
    phone_verified INTEGER DEFAULT 0,
    last_login_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0
);

-- 2. 피부관리실 테이블
CREATE TABLE skincare_shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    services TEXT, -- JSON array
    description TEXT,
    business_number TEXT,
    business_license TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
    representative_treatments TEXT, -- JSON array
    price_range TEXT,
    operating_hours TEXT, -- JSON object
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0
);

-- 3. 상담 신청 테이블
CREATE TABLE consultations (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    treatment_types TEXT, -- JSON array
    skin_concerns TEXT, -- JSON array
    age_range TEXT,
    budget_range TEXT,
    preferred_schedule TEXT,
    additional_notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'matched', 'completed', 'cancelled')),
    submission_date TEXT NOT NULL,
    matched_shops TEXT, -- JSON array of shop IDs
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- 4. 견적서 테이블
CREATE TABLE quotes (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    shop_id TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    treatment_details TEXT NOT NULL, -- JSON object
    price INTEGER NOT NULL,
    duration INTEGER, -- minutes
    available_dates TEXT, -- JSON array
    additional_notes TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'rejected', 'expired')),
    valid_until TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id),
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id)
);

-- 5. 메시지/채팅 테이블
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'shop', 'system')),
    sender_id TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    attachment_url TEXT,
    is_read INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id)
);

-- 6. 대표업체 테이블
CREATE TABLE representative_shops (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    phone TEXT NOT NULL,
    representative_treatments TEXT, -- JSON array
    approved INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revoked')),
    owner_name TEXT,
    business_number TEXT,
    address TEXT,
    application_reason TEXT,
    approved_at INTEGER,
    rejected_at INTEGER,
    revoked_at INTEGER,
    rejection_reason TEXT,
    application_date INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id)
);

-- 7. 전화상담 통계 테이블
CREATE TABLE call_statistics (
    id TEXT PRIMARY KEY,
    action TEXT NOT NULL,
    shop_id TEXT,
    shop_name TEXT,
    phone_number TEXT,
    customer_region TEXT, -- state + district
    user_agent TEXT,
    user_id TEXT,
    session_id TEXT,
    success INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (shop_id) REFERENCES representative_shops(id)
);

-- 8. 공지사항 테이블 (운영팀)
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author_id TEXT NOT NULL,
    author_name TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'customers', 'shops', 'admins')),
    is_pinned INTEGER DEFAULT 0,
    is_published INTEGER DEFAULT 0,
    publish_date TEXT,
    expire_date TEXT,
    view_count INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 8-1. 업체 공지사항 테이블
CREATE TABLE shop_announcements (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    shop_name TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'important', 'normal')),
    is_published INTEGER DEFAULT 1,
    publish_date TEXT,
    expire_date TEXT,
    view_count INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id)
);

-- 9. 리뷰 테이블
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    shop_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    treatment_received TEXT, -- JSON array
    service_quality INTEGER CHECK (service_quality >= 1 AND service_quality <= 5),
    price_satisfaction INTEGER CHECK (price_satisfaction >= 1 AND price_satisfaction <= 5),
    facility_cleanliness INTEGER CHECK (facility_cleanliness >= 1 AND facility_cleanliness <= 5),
    staff_kindness INTEGER CHECK (staff_kindness >= 1 AND staff_kindness <= 5),
    recommend_yn INTEGER DEFAULT 1,
    is_verified INTEGER DEFAULT 0,
    admin_response TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id),
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id),
    FOREIGN KEY (customer_id) REFERENCES users(id)
);

-- 10. 사용자 세션 테이블
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at INTEGER NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_location ON users(state, district);
CREATE INDEX idx_users_cafe ON users(cafe_platform, cafe_id);
CREATE INDEX idx_shops_location ON skincare_shops(state, district);
CREATE INDEX idx_shops_status ON skincare_shops(status);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_location ON consultations(state, district);
CREATE INDEX idx_consultations_date ON consultations(created_at);
CREATE INDEX idx_quotes_consultation ON quotes(consultation_id);
CREATE INDEX idx_quotes_shop ON quotes(shop_id);
CREATE INDEX idx_messages_consultation ON messages(consultation_id);
CREATE INDEX idx_messages_timestamp ON messages(created_at);
CREATE INDEX idx_rep_shops_location ON representative_shops(state, district);
CREATE INDEX idx_rep_shops_status ON representative_shops(status);
CREATE INDEX idx_announcements_published ON announcements(is_published, created_at);
CREATE INDEX idx_shop_announcements_shop ON shop_announcements(shop_id);
CREATE INDEX idx_shop_announcements_published ON shop_announcements(is_published, created_at);
CREATE INDEX idx_reviews_shop ON reviews(shop_id);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);

-- 초기 관리자 계정 생성
INSERT INTO users (
    id, email, password, name, user_type, phone, status, 
    email_verified, created_at, updated_at
) VALUES (
    'admin_beautycat_001',
    'admin@beautycat.kr',
    'beautycat2024!', -- 실제로는 해시화 필요
    '뷰티캣 관리자',
    'admin',
    '02-1234-5678',
    'active',
    1,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);

-- 샘플 공지사항
INSERT INTO announcements (
    id, title, content, author_id, author_name, priority, 
    target_audience, is_pinned, is_published, publish_date,
    created_at, updated_at
) VALUES (
    'announce_welcome_001',
    'beautycat 서비스 정식 오픈!',
    'Cloudflare 기반의 완전한 백엔드 시스템으로 모든 기능이 정상 작동합니다.',
    'admin_beautycat_001',
    '뷰티캣 관리자',
    'high',
    'all',
    1,
    1,
    datetime('now'),
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);