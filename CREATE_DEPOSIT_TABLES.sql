-- BeautyCat 예약금 관리 시스템 테이블 생성 SQL
-- 버전: v2.7.0
-- 날짜: 2025-12-11
-- 데이터베이스: Cloudflare D1 (beautycat-db)

-- =========================================
-- 1. shop_payment_methods (원장님 결제 정보)
-- =========================================
CREATE TABLE IF NOT EXISTS shop_payment_methods (
    -- 기본 필드
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL,
    shop_name TEXT,
    
    -- 결제 정보
    payment_type TEXT CHECK(payment_type IN ('간편결제링크', '계좌번호')),
    payment_provider TEXT,  -- 토스, 카카오페이, 네이버페이 등
    payment_link TEXT,      -- 간편결제 링크 URL
    
    -- 계좌번호 정보
    bank_name TEXT,         -- 은행명
    account_number TEXT,    -- 계좌번호
    account_holder TEXT,    -- 예금주
    
    -- 상태
    is_active BOOLEAN DEFAULT 1,
    
    -- 시스템 필드
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    gs_project_id TEXT,
    gs_table_name TEXT DEFAULT 'shop_payment_methods',
    deleted BOOLEAN DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_shop_payment_methods_shop_id 
ON shop_payment_methods(shop_id);

CREATE INDEX IF NOT EXISTS idx_shop_payment_methods_is_active 
ON shop_payment_methods(is_active);

-- =========================================
-- 2. booking_deposits (예약금 내역)
-- =========================================
CREATE TABLE IF NOT EXISTS booking_deposits (
    -- 기본 필드
    id TEXT PRIMARY KEY,
    booking_id TEXT,
    
    -- 샵 정보
    shop_id TEXT NOT NULL,
    shop_name TEXT,
    
    -- 고객 정보
    customer_id TEXT,
    customer_name TEXT,
    
    -- 예약금 정보
    deposit_amount INTEGER NOT NULL,           -- 예약금 금액
    platform_fee INTEGER DEFAULT 0,            -- 플랫폼 이용료 (0 또는 1000)
    
    -- 결제 상태
    payment_status TEXT DEFAULT '대기중' CHECK(
        payment_status IN ('대기중', '고객입금완료', '원장님확인완료', '예약확정', '취소됨')
    ),
    payment_method TEXT,                       -- 고객이 사용한 결제 방법
    payment_proof_url TEXT,                    -- 입금 증빙 이미지 URL
    
    -- 시간 정보
    customer_paid_at DATETIME,                 -- 고객 입금 완료 시각
    shop_confirmed_at DATETIME,                -- 원장님 확인 시각
    booking_confirmed_at DATETIME,             -- 예약 확정 시각
    booking_date DATETIME,                     -- 예약 날짜
    
    -- 메모
    memo TEXT,
    
    -- 시스템 필드
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    gs_project_id TEXT,
    gs_table_name TEXT DEFAULT 'booking_deposits',
    deleted BOOLEAN DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_booking_deposits_shop_id 
ON booking_deposits(shop_id);

CREATE INDEX IF NOT EXISTS idx_booking_deposits_customer_id 
ON booking_deposits(customer_id);

CREATE INDEX IF NOT EXISTS idx_booking_deposits_payment_status 
ON booking_deposits(payment_status);

CREATE INDEX IF NOT EXISTS idx_booking_deposits_booking_date 
ON booking_deposits(booking_date);

-- =========================================
-- 실행 방법
-- =========================================
-- 
-- Cloudflare Dashboard:
-- 1. https://dash.cloudflare.com 접속
-- 2. Workers & Pages → D1 → beautycat-db → Console
-- 3. 위 SQL을 복사하여 붙여넣기
-- 4. Execute 클릭
--
-- Wrangler CLI:
-- wrangler d1 execute beautycat-db --remote --file=CREATE_DEPOSIT_TABLES.sql
--
-- =========================================
-- 검증 방법
-- =========================================
--
-- 테이블 존재 확인:
-- SELECT name FROM sqlite_master WHERE type='table' 
-- AND name IN ('shop_payment_methods', 'booking_deposits');
--
-- 테이블 구조 확인:
-- PRAGMA table_info(shop_payment_methods);
-- PRAGMA table_info(booking_deposits);
--
-- 인덱스 확인:
-- SELECT name FROM sqlite_master WHERE type='index' 
-- AND tbl_name IN ('shop_payment_methods', 'booking_deposits');
