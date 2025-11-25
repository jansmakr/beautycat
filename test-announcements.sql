-- 테스트용 공지사항 추가 (Cloudflare D1 Console에서 실행)
-- 기존 샘플 공지사항 확인 후, 없으면 아래 SQL 실행

-- 1. 긴급 공지 (고객용)
INSERT OR IGNORE INTO announcements (
    id, title, content, author_id, author_name, priority, 
    target_audience, is_pinned, is_published, publish_date, view_count,
    created_at, updated_at
) VALUES (
    'announce_urgent_001',
    '🔥 신규 회원 가입 이벤트 진행 중!',
    '2025년 12월 31일까지 신규 회원 가입 시 첫 상담 20% 할인 혜택을 드립니다. 지금 바로 가입하고 혜택을 받으세요!',
    'admin_beautycat_001',
    '뷰티캣 관리자',
    'urgent',
    'customers',
    1,
    1,
    datetime('now'),
    0,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);

-- 2. 중요 공지 (전체)
INSERT OR IGNORE INTO announcements (
    id, title, content, author_id, author_name, priority, 
    target_audience, is_pinned, is_published, publish_date, view_count,
    created_at, updated_at
) VALUES (
    'announce_important_001',
    '⭐ 지역별 대표샵 전화상담 서비스 오픈!',
    '이제 우리 동네 대표 피부관리실과 바로 전화 상담이 가능합니다. 메인 페이지에서 지역을 선택하고 전화 상담을 받아보세요!',
    'admin_beautycat_001',
    '뷰티캣 관리자',
    'important',
    'all',
    0,
    1,
    datetime('now'),
    0,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);

-- 3. 일반 공지 (고객용)
INSERT OR IGNORE INTO announcements (
    id, title, content, author_id, author_name, priority, 
    target_audience, is_pinned, is_published, publish_date, view_count,
    created_at, updated_at
) VALUES (
    'announce_normal_001',
    '📢 업체 공지사항 기능 추가',
    '이제 각 업체가 직접 프로모션 및 이벤트 소식을 공지사항 게시판에 등록할 수 있습니다. 우리 동네 업체의 최신 소식을 확인해보세요!',
    'admin_beautycat_001',
    '뷰티캣 관리자',
    'normal',
    'customers',
    0,
    1,
    datetime('now'),
    0,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);

-- 4. 업체용 공지
INSERT OR IGNORE INTO announcements (
    id, title, content, author_id, author_name, priority, 
    target_audience, is_pinned, is_published, publish_date, view_count,
    created_at, updated_at
) VALUES (
    'announce_shop_001',
    '📝 업체 대시보드 공지사항 작성 가이드',
    '업체 대시보드에서 공지사항을 작성하여 고객들에게 프로모션과 이벤트를 홍보할 수 있습니다. 공지사항 메뉴를 확인해주세요!',
    'admin_beautycat_001',
    '뷰티캣 관리자',
    'important',
    'shops',
    0,
    1,
    datetime('now'),
    0,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);

-- 확인용 쿼리
SELECT 
    id, 
    title, 
    priority, 
    target_audience, 
    is_published,
    created_at
FROM announcements 
ORDER BY created_at DESC;
