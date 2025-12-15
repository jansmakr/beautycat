-- ====================================
-- 피부 사진 업로드 컬럼 추가 (v2.8.12)
-- ====================================
-- 날짜: 2025-12-15
-- 목적: consultations 테이블에 피부 사진 필드 추가

-- 1. skin_photos 컬럼 추가 (주 필드)
ALTER TABLE consultations 
ADD COLUMN skin_photos TEXT;

-- 2. image_urls 컬럼 추가 (호환성 필드)
ALTER TABLE consultations 
ADD COLUMN image_urls TEXT;

-- ====================================
-- 설명:
-- - skin_photos: JSON 배열 형태의 Base64 Data URL 저장
-- - image_urls: 레거시 호환성을 위한 동일 데이터 저장
-- - TEXT 타입: 큰 Base64 데이터를 저장하기 위해
--
-- 예시 데이터:
-- skin_photos: '["data:image/jpeg;base64,/9j/4AA...", "data:image/png;base64,iVBO..."]'
-- image_urls: '["data:image/jpeg;base64,/9j/4AA...", "data:image/png;base64,iVBO..."]'
-- ====================================

-- 검증 쿼리
SELECT 
    id,
    customer_name,
    skin_photos,
    image_urls,
    created_at
FROM consultations
WHERE skin_photos IS NOT NULL
LIMIT 10;
