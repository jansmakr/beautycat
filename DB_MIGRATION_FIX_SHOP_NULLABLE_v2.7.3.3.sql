-- =====================================================
-- BeautyCat DB Migration v2.7.3.3
-- 뷰티샵 회원가입 간소화를 위한 스키마 수정
-- =====================================================
-- 작성일: 2025-12-13
-- 목적: skincare_shops 테이블의 address, state, district를 NULL 허용으로 변경
-- 이유: 간소화된 회원가입에서는 업체 정보를 나중에 입력받음
-- =====================================================

-- 문제: SQLite는 ALTER TABLE ... MODIFY COLUMN을 지원하지 않음
-- 해결: 새 테이블 생성 → 데이터 복사 → 테이블 교체

-- Step 1: 백업 테이블 생성
CREATE TABLE skincare_shops_backup AS SELECT * FROM skincare_shops;

-- Step 2: 기존 테이블 삭제
DROP TABLE skincare_shops;

-- Step 3: 새 테이블 생성 (address, state, district NULL 허용)
CREATE TABLE skincare_shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT,  -- NULL 허용으로 변경
    state TEXT,    -- NULL 허용으로 변경
    district TEXT, -- NULL 허용으로 변경
    services TEXT, -- JSON array
    description TEXT,
    business_number TEXT,
    business_license TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('active', 'inactive', 'pending', 'rejected')),
    representative_treatments TEXT, -- JSON array
    price_range TEXT,
    operating_hours TEXT, -- JSON object
    
    -- 🔥 NEW: 결제 정보 컬럼 추가
    payment_link TEXT,          -- 간편결제 링크 (토스페이, 카카오페이 등)
    bank_name TEXT,             -- 은행명
    account_number TEXT,        -- 계좌번호
    account_holder TEXT,        -- 예금주
    show_payment_info INTEGER DEFAULT 1,  -- 결제정보 표시 여부 (1: 표시, 0: 숨김)
    
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0
);

-- Step 4: 백업 데이터를 새 테이블로 복사
INSERT INTO skincare_shops (
    id, name, owner_name, phone, email, address, state, district,
    services, description, business_number, business_license, status,
    representative_treatments, price_range, operating_hours,
    created_at, updated_at, deleted
)
SELECT 
    id, name, owner_name, phone, email, address, state, district,
    services, description, business_number, business_license, status,
    representative_treatments, price_range, operating_hours,
    created_at, updated_at, deleted
FROM skincare_shops_backup;

-- Step 5: 인덱스 재생성
CREATE INDEX idx_shops_location ON skincare_shops(state, district);
CREATE INDEX idx_shops_status ON skincare_shops(status);

-- Step 6: 백업 테이블 삭제 (선택사항)
-- DROP TABLE skincare_shops_backup;

-- =====================================================
-- 검증 쿼리
-- =====================================================
-- 1. 스키마 확인
-- PRAGMA table_info(skincare_shops);

-- 2. 데이터 개수 확인
-- SELECT COUNT(*) FROM skincare_shops;
-- SELECT COUNT(*) FROM skincare_shops_backup;

-- 3. 새로운 NULL 허용 테스트
-- INSERT INTO skincare_shops (id, name, owner_name, phone, email, created_at, updated_at)
-- VALUES ('test_shop_001', 'Test Shop', 'Test Owner', '010-1234-5678', 'test@test.com', 
--         strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- =====================================================
-- 마이그레이션 완료!
-- =====================================================
