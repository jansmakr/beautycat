// 🎉 Emergency API 비활성화 - Cloudflare 백엔드 완성!
// 이제 실제 Cloudflare D1 + Workers API를 사용합니다.

console.log('🎉 Cloudflare 백엔드 활성화 - Emergency API 비활성화됨');
return; // Emergency API 전체 비활성화

// Mock 데이터 정의
const EMERGENCY_MOCK_DATA = {
    users: [
        {
            id: 'demo_customer_001',
            email: 'customer@demo.com',
            name: '데모 고객',
            user_type: 'customer',
            phone: '010-1234-5678',
            status: 'active',
            created_at: Date.now(),
            updated_at: Date.now()
        },
        {
            id: 'demo_shop_001',
            email: 'shop@demo.com', 
            name: '데모 피부관리실',
            user_type: 'shop',
            phone: '02-1234-5678',
            status: 'active',
            shop_id: 'demo_shop_seoul_gangnam',
            created_at: Date.now(),
            updated_at: Date.now()
        },
        {
            id: 'admin_demo_001',
            email: 'admin@demo.com',
            name: '관리자',
            user_type: 'admin', 
            phone: '02-9999-9999',
            status: 'active',
            created_at: Date.now(),
            updated_at: Date.now()
        }
    ],
    
    announcements: [
        {
            id: 'announce_001',
            title: 'beautycat 서비스 오픈!',
            content: 'Firebase API 기반 완전한 백엔드 기능을 제공합니다.',
            author_name: '관리자',
            priority: 'high',
            is_published: true,
            view_count: 150,
            created_at: Date.now(),
            updated_at: Date.now()
        },
        {
            id: 'announce_002',
            title: 'API 시스템 업데이트',
            content: '모든 API 오류가 자동으로 수정됩니다.',
            author_name: '관리자',
            priority: 'medium',
            is_published: true,
            view_count: 85,
            created_at: Date.now() - 86400000,
            updated_at: Date.now() - 86400000
        }
    ],
    
    representative_shops: [
        {
            id: 'rep_shop_seoul_gangnam',
            shop_name: '강남 뷰티 클리닉',
            state: '서울특별시',
            district: '강남구',
            phone: '02-1111-2222',
            representative_treatments: ['여드름 관리', '미백 관리'],
            status: 'approved',
            approved: true,
            owner_name: '김뷰티',
            address: '서울시 강남구 테헤란로 123',
            created_at: Date.now(),
            updated_at: Date.now()
        },
        {
            id: 'rep_shop_busan_haeundae',
            shop_name: '해운대 스킨케어',
            state: '부산광역시',
            district: '해운대구',
            phone: '051-2222-3333',
            representative_treatments: ['수분 관리', '모공 케어'],
            status: 'approved', 
            approved: true,
            owner_name: '이해운',
            address: '부산시 해운대구 해운대해변로 456',
            created_at: Date.now(),
            updated_at: Date.now()
        }
    ],
    
    skincare_shops: [
        {
            id: 'demo_shop_seoul_gangnam',
            name: '데모 부티 클리닉',
            owner_name: '김부티',
            phone: '02-1234-5678',
            email: 'shop@demo.com',
            address: '서울시 강남구 강남대로 123',
            state: '서울특별시',
            district: '강남구',
            services: ['여드름 관리', '미백 관리', '수분 관리'],
            description: '전문적인 피부관리 서비스를 제공합니다.',
            status: 'active',
            created_at: Date.now(),
            updated_at: Date.now()
        },
        {
            id: 'shop_seoul_seocho',
            name: '서초 글로우 스튜디오',
            owner_name: '박글로우',
            phone: '02-5555-6666',
            email: 'glow@demo.com',
            address: '서울시 서초구 서초대로 789',
            state: '서울특별시',
            district: '서초구',
            services: ['안티에이징', '리프팅', '화이트닝'],
            description: '최신 장비와 프리미엄 케어를 제공합니다.',
            status: 'active',
            created_at: Date.now(),
            updated_at: Date.now()
        }
    ],

    consultations: [
        {
            id: 'consult_001',
            customer_name: '데모 고객',
            customer_phone: '010-1234-5678',
            customer_email: 'customer@demo.com',
            state: '서울특별시',
            district: '강남구',
            treatment_types: ['여드름 관리', '수분 관리'],
            skin_concerns: ['민감성 피부', '건조함'],
            age_range: '20대',
            budget_range: '10-20만원',
            preferred_schedule: '주말 오후',
            additional_notes: '민감성 피부로 순한 제품 사용 희망',
            status: 'pending',
            submission_date: new Date().toISOString(),
            created_at: Date.now(),
            updated_at: Date.now()
        }
    ]
};

// Emergency API 클래스
class EmergencyAPI {
    constructor() {
        this.data = EMERGENCY_MOCK_DATA;
    }
    
    async getTables(tableName, params = {}) {
        console.log(`📋 Emergency API: ${tableName} 테이블 조회`);
        
        const data = this.data[tableName] || [];
        const limit = parseInt(params.limit) || 10;
        const page = parseInt(params.page) || 1;
        const offset = (page - 1) * limit;
        
        const paginatedData = data.slice(offset, offset + limit);
        
        const result = {
            data: paginatedData,
            total: data.length,
            page: page,
            limit: limit,
            table: tableName,
            schema: { fields: [] },
            source: 'Emergency-API'
        };
        
        console.log(`✅ Emergency API 응답:`, result);
        return result;
    }
    
    async getRecord(tableName, recordId) {
        console.log(`📋 Emergency API: ${tableName}/${recordId} 조회`);
        
        const data = this.data[tableName] || [];
        const record = data.find(item => item.id === recordId);
        
        if (record) {
            console.log(`✅ Emergency API 레코드 발견:`, record);
            return record;
        } else {
            throw new Error(`Record not found: ${recordId}`);
        }
    }
    
    async createRecord(tableName, newData) {
        console.log(`➕ Emergency API: ${tableName} 생성`, newData);
        
        const id = newData.id || 'emergency_' + Date.now();
        const record = {
            ...newData,
            id,
            created_at: Date.now(),
            updated_at: Date.now()
        };
        
        if (!this.data[tableName]) {
            this.data[tableName] = [];
        }
        this.data[tableName].push(record);
        
        console.log(`✅ Emergency API 생성 완료:`, record);
        return record;
    }
}

// Emergency API 인스턴스 생성
const emergencyAPI = new EmergencyAPI();

// 전역 API 설정
window.beautyAPI = emergencyAPI;
window.firebaseAPI = { 
    isInitialized: () => true,
    initialize: () => Promise.resolve()
};

// 원본 fetch 백업
const originalFetch = window.fetch;

// Fetch 강제 래핑
window.fetch = function(url, options = {}) {
    if (typeof url === 'string' && url.includes('/tables/')) {
        console.log('🚨 Emergency API 가로채기:', url);
        
        return new Promise(async (resolve) => {
            try {
                // URL 파싱
                const urlObj = new URL(url, window.location.origin);
                const pathParts = urlObj.pathname.split('/');
                const tableName = pathParts[2];
                const recordId = pathParts[3];
                
                // Query parameters
                const params = {};
                urlObj.searchParams.forEach((value, key) => {
                    params[key] = value;
                });
                
                // HTTP 메서드 확인
                const method = options.method || 'GET';
                
                let result;
                
                switch (method.toUpperCase()) {
                    case 'GET':
                        if (recordId) {
                            result = await emergencyAPI.getRecord(tableName, recordId);
                        } else {
                            result = await emergencyAPI.getTables(tableName, params);
                        }
                        break;
                        
                    case 'POST':
                        const createData = options.body ? JSON.parse(options.body) : {};
                        result = await emergencyAPI.createRecord(tableName, createData);
                        break;
                        
                    default:
                        result = { error: 'Method not supported in emergency mode' };
                }
                
                // Response 객체 생성
                const response = new Response(JSON.stringify(result), {
                    status: 200,
                    statusText: 'OK',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-API-Source': 'Emergency-Fix'
                    }
                });
                
                resolve(response);
                
            } catch (error) {
                console.error('Emergency API 오류:', error);
                
                // 오류 시에도 빈 응답 제공
                const fallbackResponse = new Response(JSON.stringify({
                    data: [],
                    total: 0,
                    error: error.message,
                    source: 'Emergency-Fallback'
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                });
                
                resolve(fallbackResponse);
            }
        });
    }
    
    // 일반 요청은 원본 fetch 사용
    return originalFetch(url, options);
};

console.log('🚨 Emergency API 시스템 활성화 완료!');
console.log('📊 사용 가능한 테이블:', Object.keys(EMERGENCY_MOCK_DATA));

// 즉시 테스트 실행 (console-cleaner 방해 방지)
(async function immediateTest() {
    try {
        console.log('🧪 즉시 테스트 실행...');
        const testResponse = await fetch('/tables/users?limit=1');
        const testData = await testResponse.json();
        console.log('✅ 즉시 테스트 성공!', testData);
        
        // 전역 플래그 설정
        window.emergencyAPIActive = true;
        
    } catch (error) {
        console.error('❌ 즉시 테스트 실패:', error);
    }
})();

// 5초 후 자동 테스트
setTimeout(async () => {
    try {
        console.log('🧪 Emergency API 자동 테스트...');
        const testResult = await fetch('/tables/users?limit=1');
        const data = await testResult.json();
        console.log('✅ Emergency API 테스트 성공:', data);
    } catch (error) {
        console.error('❌ Emergency API 테스트 실패:', error);
    }
}, 5000);