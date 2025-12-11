-- ============================================
-- BeautyCat - shop_announcements 테이블 컬럼 추가
-- v2.6.4.9.2 - Phase 1: 빈자리 알림 시스템
-- ============================================

-- 1. category 컬럼 추가 (공지 카테고리)
ALTER TABLE shop_announcements 
ADD COLUMN category TEXT DEFAULT '일반공지';

-- 2. event_type 컬럼 추가 (긴급도)
ALTER TABLE shop_announcements 
ADD COLUMN event_type TEXT DEFAULT 'normal';

-- 3. slots_info 컬럼 추가 (빈 시간 정보)
ALTER TABLE shop_announcements 
ADD COLUMN slots_info TEXT DEFAULT '';

-- 4. discount_rate 컬럼 추가 (할인율 %)
ALTER TABLE shop_announcements 
ADD COLUMN discount_rate INTEGER DEFAULT 0;

-- ============================================
-- 검증 쿼리
-- ============================================

-- 테이블 구조 확인
PRAGMA table_info(shop_announcements);

-- 기존 데이터 확인 (새 컬럼이 기본값으로 채워졌는지)
SELECT id, shop_name, title, category, event_type, slots_info, discount_rate 
FROM shop_announcements 
LIMIT 5;
