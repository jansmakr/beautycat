// beautycat 프로덕션 배포용 설정

const CONFIG = {
    // 기본 설정
    ENVIRONMENT: 'production',
    DOMAIN: 'beautycat.kr',
    // Cloudflare Workers API (상용화 준비 완료!)
    API_BASE_URL: 'https://beautycat-api.jansmakr.workers.dev/api',
    
    // GitHub Pages 설정
    GITHUB_PAGES: {
        enabled: true,
        base_path: '/',
        custom_domain: 'beautycat.kr'
    },
    
    // SSL 설정
    SSL: {
        enforce: true,
        redirect_http: true
    },
    
    // 서비스 워커 설정 (프로덕션용)
    SERVICE_WORKER: {
        enabled: true,
        cache_version: 'beautycat-v1.0.0',
        offline_support: true
    },
    
    // API 엔드포인트 (Cloudflare D1 연동 완료!)
    API_ENDPOINTS: {
        // ✅ 실제 D1 데이터베이스 사용
        USE_LOCAL_STORAGE: false,
        
        // Cloudflare Workers API 엔드포인트
        consultations: 'https://beautycat-api.jansmakr.workers.dev/api/tables/consultations',
        shops: 'https://beautycat-api.jansmakr.workers.dev/api/tables/skincare_shops',
        users: 'https://beautycat-api.jansmakr.workers.dev/api/tables/users',
        quotes: 'https://beautycat-api.jansmakr.workers.dev/api/tables/quotes',
        messages: 'https://beautycat-api.jansmakr.workers.dev/api/tables/messages',
        representative_shops: 'https://beautycat-api.jansmakr.workers.dev/api/tables/representative_shops',
        announcements: 'https://beautycat-api.jansmakr.workers.dev/api/tables/announcements',
        reviews: 'https://beautycat-api.jansmakr.workers.dev/api/tables/reviews',
        sessions: 'https://beautycat-api.jansmakr.workers.dev/api/tables/user_sessions',
        call_stats: 'https://beautycat-api.jansmakr.workers.dev/api/tables/call_statistics'
    },
    
    // 외부 서비스 연동
    INTEGRATIONS: {
        // 구글 애널리틱스 (나중에 실제 ID로 변경)
        google_analytics: 'G-XXXXXXXXXX',
        
        // 카카오톡 상담 (실제 링크로 변경 필요)
        kakao_chat: 'https://open.kakao.com/o/sXXnTISh',
        
        // 결제 시스템 (나중에 실제 연동)
        payment_gateway: {
            test_mode: true,
            provider: 'inicis' // 이니시스 등
        }
    },
    
    // SEO 설정
    SEO: {
        title: 'beautycat (뷰티+에티켓) - 피부관리실 견적 플랫폼',
        description: '상담신청만 남기면, 우리 동네 피부관리실 정보와 견적을 한번에 받아볼 수 있어요',
        keywords: '피부관리, 피부관리실, 견적, 상담, 뷰티, 에스테틱',
        og_image: 'https://beautycat.kr/images/og-image.jpg'
    }
};

// 환경별 설정 적용
if (typeof window !== 'undefined') {
    window.BEAUTYCAT_CONFIG = CONFIG;
}

// Node.js 환경 지원  
if (typeof module !== 'undefined') {
    module.exports = CONFIG;
}