// ═══════════════════════════════════════════════════════════
// 🛡️ Beautyket Fallback Data (젠스파크 API 장애 대비)
// ═══════════════════════════════════════════════════════════
// 
// 목적: 젠스파크 RESTful API가 다운되거나 응답하지 않을 때
//       정적 백업 데이터를 사용하여 웹사이트가 계속 작동하도록 함
//
// 마지막 업데이트: 2026-01-21
// 데이터 버전: v2.8.8.1.75
// ═══════════════════════════════════════════════════════════

const FALLBACK_SHOPS = [
    {
        id: "shop-001",
        shop_name: "강남 베스트 피부관리실",
        address: "서울시 강남구 역삼동 123-45",
        region: "강남",
        phone: "02-1234-5678",
        image_url: "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=400",
        rating: 4.8,
        review_count: 128,
        description: "강남 역삼동에 위치한 10년 경력의 전문 피부관리실입니다. 여드름, 모공, 미백 관리 전문.",
        tags: ["여드름", "모공", "미백"],
        business_hours: "월-금 10:00-20:00, 토 10:00-18:00",
        price_range: "10-30만원",
        is_representative: true
    },
    {
        id: "shop-002",
        shop_name: "홍대 클린 스킨케어",
        address: "서울시 마포구 홍대입구 234-56",
        region: "홍대",
        phone: "02-2345-6789",
        image_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
        rating: 4.9,
        review_count: 95,
        description: "홍대 젊음의 거리에 위치한 트렌디한 피부관리실. 20-30대 고객 맞춤 관리.",
        tags: ["모공", "각질", "미백"],
        business_hours: "매일 11:00-21:00",
        price_range: "10-30만원",
        is_representative: true
    },
    {
        id: "shop-003",
        shop_name: "잠실 프리미엄 스킨",
        address: "서울시 송파구 잠실동 345-67",
        region: "잠실",
        phone: "02-3456-7890",
        image_url: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400",
        rating: 4.7,
        review_count: 112,
        description: "잠실 롯데월드타워 인근 프리미엄 피부관리실. 고급 장비와 전문 관리사.",
        tags: ["주름", "리프팅", "미백"],
        business_hours: "월-토 09:00-19:00",
        price_range: "30-50만원",
        is_representative: true
    },
    {
        id: "shop-004",
        shop_name: "선릉 에스테틱",
        address: "서울시 강남구 선릉역 456-78",
        region: "선릉",
        phone: "02-4567-8901",
        image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400",
        rating: 4.6,
        review_count: 87,
        description: "선릉역 도보 3분 거리의 편리한 피부관리실. 직장인 고객 맞춤 시간 운영.",
        tags: ["여드름", "트러블", "진정"],
        business_hours: "월-금 08:00-22:00, 토 10:00-18:00",
        price_range: "10-30만원",
        is_representative: true
    },
    {
        id: "shop-005",
        shop_name: "분당 뷰티랩",
        address: "경기도 성남시 분당구 정자동 567-89",
        region: "분당",
        phone: "031-5678-9012",
        image_url: "https://images.unsplash.com/photo-1595878715977-5e2e5e0b1e61?w=400",
        rating: 4.9,
        review_count: 143,
        description: "분당 정자동 최고급 피부관리실. 독일 최신 장비 보유.",
        tags: ["미백", "보습", "리프팅"],
        business_hours: "월-토 10:00-20:00",
        price_range: "30-50만원",
        is_representative: true
    },
    {
        id: "shop-006",
        shop_name: "판교 스킨클리닉",
        address: "경기도 성남시 분당구 판교역 678-90",
        region: "판교",
        phone: "031-6789-0123",
        image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400",
        rating: 4.8,
        review_count: 76,
        description: "판교 테크노밸리 인근 모던한 피부관리실. IT 직장인 선호 1위.",
        tags: ["여드름", "모공", "각질"],
        business_hours: "월-금 09:00-21:00, 토 10:00-17:00",
        price_range: "10-30만원",
        is_representative: true
    },
    {
        id: "shop-007",
        shop_name: "일산 힐링케어",
        address: "경기도 고양시 일산동구 789-01",
        region: "일산",
        phone: "031-7890-1234",
        image_url: "https://images.unsplash.com/photo-1598624534823-2dae8e6b5f4e?w=400",
        rating: 4.7,
        review_count: 92,
        description: "일산 킨텍스 인근 대형 피부관리실. 넓은 공간과 프라이빗 룸 보유.",
        tags: ["진정", "보습", "민감성"],
        business_hours: "매일 10:00-20:00",
        price_range: "10-30만원",
        is_representative: true
    },
    {
        id: "shop-008",
        shop_name: "수원 로열스킨",
        address: "경기도 수원시 영통구 890-12",
        region: "수원",
        phone: "031-8901-2345",
        image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400",
        rating: 4.6,
        review_count: 68,
        description: "수원 영통구 프리미엄 피부관리실. 15년 경력 원장님 직접 관리.",
        tags: ["주름", "탄력", "리프팅"],
        business_hours: "월-토 09:30-19:30",
        price_range: "30-50만원",
        is_representative: true
    },
    {
        id: "shop-009",
        shop_name: "부천 퓨어뷰티",
        address: "경기도 부천시 중동 901-23",
        region: "부천",
        phone: "032-9012-3456",
        image_url: "https://images.unsplash.com/photo-1591343395902-bce56b7eafa0?w=400",
        rating: 4.8,
        review_count: 104,
        description: "부천 중동역 맞은편 접근성 좋은 피부관리실. 20-40대 여성 고객 만족도 높음.",
        tags: ["여드름", "미백", "보습"],
        business_hours: "월-금 10:00-20:00, 토-일 10:00-18:00",
        price_range: "10-30만원",
        is_representative: true
    },
    {
        id: "shop-010",
        shop_name: "인천 오션스파",
        address: "인천시 연수구 송도동 012-34",
        region: "인천",
        phone: "032-0123-4567",
        image_url: "https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=400",
        rating: 4.9,
        review_count: 156,
        description: "송도 센트럴파크 뷰의 힐링 피부관리실. 스파 시설 완비.",
        tags: ["스파", "힐링", "보습"],
        business_hours: "매일 09:00-21:00",
        price_range: "30-50만원",
        is_representative: true
    }
];

// ═══════════════════════════════════════════════════════════
// 📡 API 호출 래퍼 함수 (Fallback 지원)
// ═══════════════════════════════════════════════════════════

/**
 * shops 테이블 데이터 로드 (Fallback 지원)
 * @param {number} limit - 최대 레코드 수
 * @param {string} sort - 정렬 기준
 * @returns {Promise<Array>} - 샵 데이터 배열
 */
async function loadShopsWithFallback(limit = 100, sort = 'rating') {
    try {
        console.log('📡 API 호출 시도:', `tables/shops?limit=${limit}&sort=${sort}`);
        
        const response = await fetch(`tables/shops?limit=${limit}&sort=${sort}`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            console.log('✅ API에서 데이터 로드 성공:', result.data.length, '개');
            return result.data;
        } else {
            console.warn('⚠️ API 응답이 비어있음, Fallback 데이터 사용');
            return FALLBACK_SHOPS;
        }
    } catch (error) {
        console.error('❌ API 호출 실패:', error.message);
        console.log('🛡️ Fallback 데이터로 전환:', FALLBACK_SHOPS.length, '개');
        return FALLBACK_SHOPS;
    }
}

/**
 * 지역별 shops 필터링
 * @param {string} region - 지역명
 * @returns {Promise<Array>} - 필터링된 샵 데이터
 */
async function loadShopsByRegion(region) {
    const shops = await loadShopsWithFallback();
    return shops.filter(shop => shop.region === region);
}

/**
 * 대표샵만 로드
 * @returns {Promise<Array>} - 대표샵 데이터
 */
async function loadRepresentativeShopsOnly() {
    const shops = await loadShopsWithFallback();
    return shops.filter(shop => shop.is_representative === true);
}

// ═══════════════════════════════════════════════════════════
// 🌐 전역 변수로 노출
// ═══════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
    window.FALLBACK_SHOPS = FALLBACK_SHOPS;
    window.loadShopsWithFallback = loadShopsWithFallback;
    window.loadShopsByRegion = loadShopsByRegion;
    window.loadRepresentativeShopsOnly = loadRepresentativeShopsOnly;
    
    console.log('🛡️ Fallback 시스템 로드 완료');
    console.log('📊 Fallback 데이터:', FALLBACK_SHOPS.length, '개 샵');
}
