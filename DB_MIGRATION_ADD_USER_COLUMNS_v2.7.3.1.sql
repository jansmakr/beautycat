-- ============================================================
-- DB Migration v2.7.3.1
-- beautycat.kr Cloudflare D1 Database
-- 날짜: 2025-12-13
-- 목적: users 테이블에 누락된 컬럼 추가
-- ============================================================

-- 문제: users 테이블에 state, district, detail_address 등 필수 컬럼 누락
-- 원인: cloudflare-d1-schema.sql에 컬럼 정의 누락
-- 해결: ALTER TABLE로 컬럼 추가

-- ============================================================
-- STEP 1: users 테이블에 컬럼 추가
-- ============================================================

-- 지역 정보 (고객, 업체 공통)
ALTER TABLE users ADD COLUMN state TEXT;
ALTER TABLE users ADD COLUMN district TEXT;
ALTER TABLE users ADD COLUMN detail_address TEXT;

-- 인증 정보
ALTER TABLE users ADD COLUMN is_verified INTEGER DEFAULT 0;

-- 제휴 카페 정보 (업체 전용)
ALTER TABLE users ADD COLUMN cafe_platform TEXT;  -- 'naver' 등
ALTER TABLE users ADD COLUMN cafe_id TEXT;        -- 카페 회원 ID

-- ============================================================
-- STEP 2: 인덱스 추가 (성능 최적화)
-- ============================================================

-- 지역별 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_users_location ON users(state, district);

-- 제휴 카페 검색 인덱스
CREATE INDEX IF NOT EXISTS idx_users_cafe ON users(cafe_platform, cafe_id);

-- ============================================================
-- STEP 3: 데이터 검증 (Optional)
-- ============================================================

-- users 테이블 구조 확인
-- PRAGMA table_info(users);

-- 샘플 데이터 확인
-- SELECT id, email, name, user_type, state, district, cafe_platform 
-- FROM users 
-- LIMIT 5;

-- ============================================================
-- 실행 방법 (Cloudflare D1)
-- ============================================================
-- wrangler d1 execute beautycat-db --file=DB_MIGRATION_ADD_USER_COLUMNS_v2.7.3.1.sql
-- 
-- 또는 Cloudflare Dashboard에서:
-- 1. Workers & Pages → D1 → beautycat-db 선택
-- 2. Console 탭 클릭
-- 3. 위 SQL 명령어 복사/붙여넣기
-- 4. "Run Query" 클릭

-- ============================================================
-- 롤백 방법 (필요 시)
-- ============================================================
-- SQLite는 ALTER TABLE DROP COLUMN을 직접 지원하지 않음
-- 롤백이 필요한 경우, 테이블을 재생성해야 함 (권장하지 않음)
-- 
-- CREATE TABLE users_new AS SELECT 
--   id, email, password, name, user_type, phone, status, shop_id,
--   email_verified, phone_verified, last_login_at, 
--   created_at, updated_at, deleted
-- FROM users;
-- DROP TABLE users;
-- ALTER TABLE users_new RENAME TO users;

-- ============================================================
-- 마이그레이션 후 확인 사항
-- ============================================================
-- 1. ✅ users 테이블에 state, district, detail_address 컬럼 존재 확인
-- 2. ✅ 인덱스 생성 확인 (idx_users_location, idx_users_cafe)
-- 3. ✅ https://beautycat.kr/register 테스트
--    - 업체 회원가입 → 성공 (500 에러 해결)
-- 4. ✅ auth.js 로그 확인 (콘솔에서 "✅ 사용자 정보 저장 성공" 메시지)

-- ============================================================
-- 예상 결과
-- ============================================================
-- Before (v2.7.3):
--   ❌ D1_ERROR: table users has no column named state: SQLITE_ERROR
--   ❌ 회원가입 실패 (500 에러)
--
-- After (v2.7.3.1):
--   ✅ 회원가입 성공
--   ✅ users 테이블에 데이터 저장
--   ✅ shop-dashboard.html로 리다이렉트

-- ============================================================
-- 마이그레이션 상태
-- ============================================================
-- Status: ✅ READY FOR EXECUTION
-- Risk Level: 🟢 LOW (ADD COLUMN only, no data loss)
-- Downtime: 0 seconds
-- Execution Time: < 1 second
