/**
 * beautycat.kr Firebase API 연동
 * RESTful Table API 대체 구현
 */

// Firebase 설정 (실제 프로젝트에서는 환경변수 사용)
const FIREBASE_CONFIG = {
    apiKey: "demo-api-key",
    authDomain: "beautycat-demo.firebaseapp.com", 
    projectId: "beautycat-demo",
    databaseURL: "https://beautycat-demo-default-rtdb.firebaseio.com/",
    storageBucket: "beautycat-demo.appspot.com",
    messagingSenderId: "123456789",
    appId: "demo-app-id"
};

/**
 * Firebase API 클래스
 * 기존 RESTful Table API와 동일한 인터페이스 제공
 */
class FirebaseAPI {
    constructor() {
        this.baseURL = 'https://beautycat-api.firebase-demo.com';
        this.initialized = false;
        this.mockData = this.initMockData();
    }

    /**
     * 임시 Mock 데이터 초기화
     * 실제 Firebase 연결 전까지 사용
     */
    initMockData() {
        return {
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
                    created_at: Date.now(),
                    updated_at: Date.now()
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
                    created_at: Date.now(),
                    updated_at: Date.now()
                }
            ],
            consultations: [
                {
                    id: 'demo_consultation_001',
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
                }
            ]
        };
    }

    /**
     * 테이블 데이터 조회 (GET /tables/{table})
     */
    async getTables(tableName, params = {}) {
        try {
            console.log(`🔍 Firebase API: ${tableName} 테이블 조회 시도...`);
            
            // Mock 데이터에서 조회
            const data = this.mockData[tableName] || [];
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
                schema: this.getTableSchema(tableName)
            };
            
            console.log(`✅ ${tableName} 조회 성공:`, result);
            return result;
            
        } catch (error) {
            console.error(`❌ ${tableName} 조회 실패:`, error);
            throw error;
        }
    }

    /**
     * 단일 레코드 조회 (GET /tables/{table}/{id})
     */
    async getRecord(tableName, recordId) {
        try {
            console.log(`🔍 Firebase API: ${tableName}/${recordId} 조회 시도...`);
            
            const data = this.mockData[tableName] || [];
            const record = data.find(item => item.id === recordId);
            
            if (!record) {
                throw new Error(`Record not found: ${recordId}`);
            }
            
            console.log(`✅ ${tableName}/${recordId} 조회 성공:`, record);
            return record;
            
        } catch (error) {
            console.error(`❌ ${tableName}/${recordId} 조회 실패:`, error);
            throw error;
        }
    }

    /**
     * 새 레코드 생성 (POST /tables/{table})
     */
    async createRecord(tableName, data) {
        try {
            console.log(`🔍 Firebase API: ${tableName} 레코드 생성 시도...`, data);
            
            // ID 생성
            const id = data.id || this.generateId();
            const timestamp = Date.now();
            
            const newRecord = {
                ...data,
                id,
                created_at: timestamp,
                updated_at: timestamp
            };
            
            // Mock 데이터에 추가
            if (!this.mockData[tableName]) {
                this.mockData[tableName] = [];
            }
            this.mockData[tableName].push(newRecord);
            
            console.log(`✅ ${tableName} 레코드 생성 성공:`, newRecord);
            return newRecord;
            
        } catch (error) {
            console.error(`❌ ${tableName} 레코드 생성 실패:`, error);
            throw error;
        }
    }

    /**
     * 레코드 업데이트 (PUT /tables/{table}/{id})
     */
    async updateRecord(tableName, recordId, data) {
        try {
            console.log(`🔍 Firebase API: ${tableName}/${recordId} 업데이트 시도...`, data);
            
            const records = this.mockData[tableName] || [];
            const index = records.findIndex(item => item.id === recordId);
            
            if (index === -1) {
                throw new Error(`Record not found: ${recordId}`);
            }
            
            // 업데이트
            const updatedRecord = {
                ...records[index],
                ...data,
                id: recordId, // ID는 변경 불가
                updated_at: Date.now()
            };
            
            this.mockData[tableName][index] = updatedRecord;
            
            console.log(`✅ ${tableName}/${recordId} 업데이트 성공:`, updatedRecord);
            return updatedRecord;
            
        } catch (error) {
            console.error(`❌ ${tableName}/${recordId} 업데이트 실패:`, error);
            throw error;
        }
    }

    /**
     * 레코드 삭제 (DELETE /tables/{table}/{id})
     */
    async deleteRecord(tableName, recordId) {
        try {
            console.log(`🔍 Firebase API: ${tableName}/${recordId} 삭제 시도...`);
            
            const records = this.mockData[tableName] || [];
            const index = records.findIndex(item => item.id === recordId);
            
            if (index === -1) {
                throw new Error(`Record not found: ${recordId}`);
            }
            
            // 소프트 삭제 (deleted 플래그 추가)
            this.mockData[tableName][index] = {
                ...records[index],
                deleted: true,
                updated_at: Date.now()
            };
            
            console.log(`✅ ${tableName}/${recordId} 삭제 성공`);
            return { success: true };
            
        } catch (error) {
            console.error(`❌ ${tableName}/${recordId} 삭제 실패:`, error);
            throw error;
        }
    }

    /**
     * 테이블 스키마 정보 반환
     */
    getTableSchema(tableName) {
        const schemas = {
            users: {
                fields: ['id', 'email', 'name', 'user_type', 'phone', 'status', 'shop_id', 'created_at', 'updated_at']
            },
            consultations: {
                fields: ['id', 'customer_name', 'customer_phone', 'customer_email', 'state', 'district', 'treatment_types', 'status', 'created_at']
            },
            skincare_shops: {
                fields: ['id', 'name', 'owner_name', 'phone', 'email', 'state', 'district', 'services', 'status', 'created_at']
            }
        };
        
        return schemas[tableName] || { fields: [] };
    }

    /**
     * 유니크 ID 생성
     */
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * 초기화 상태 확인
     */
    isInitialized() {
        return this.initialized;
    }

    /**
     * Firebase 초기화
     */
    async initialize() {
        try {
            console.log('🔥 Firebase API 초기화 중...');
            
            // 실제 Firebase 연결 코드는 여기에 추가
            // await firebase.initializeApp(FIREBASE_CONFIG);
            
            this.initialized = true;
            console.log('✅ Firebase API 초기화 완료!');
            
        } catch (error) {
            console.error('❌ Firebase API 초기화 실패:', error);
            throw error;
        }
    }
}

// 전역 인스턴스 생성
window.firebaseAPI = new FirebaseAPI();

// 기존 fetch API 래퍼 함수들 (호환성 유지)
window.beautyAPI = {
    // GET /tables/{table}
    async getTables(tableName, params = {}) {
        return await window.firebaseAPI.getTables(tableName, params);
    },
    
    // GET /tables/{table}/{id}
    async getRecord(tableName, recordId) {
        return await window.firebaseAPI.getRecord(tableName, recordId);
    },
    
    // POST /tables/{table}
    async createRecord(tableName, data) {
        return await window.firebaseAPI.createRecord(tableName, data);
    },
    
    // PUT /tables/{table}/{id}
    async updateRecord(tableName, recordId, data) {
        return await window.firebaseAPI.updateRecord(tableName, recordId, data);
    },
    
    // DELETE /tables/{table}/{id}
    async deleteRecord(tableName, recordId) {
        return await window.firebaseAPI.deleteRecord(tableName, recordId);
    }
};

// 즉시 자동 초기화 시작
(async function autoInit() {
    console.log('🚀 Firebase API 자동 초기화 시작...');
    
    try {
        await window.firebaseAPI.initialize();
        console.log('✅ Firebase API 자동 초기화 완료!');
        
        // 테스트 데이터 자동 로드
        const users = await window.beautyAPI.getTables('users', { limit: 1 });
        console.log('📊 테스트 데이터 로드:', users.total + '개 사용자');
        
        // 전역 준비 완료 플래그
        window.firebaseAPIReady = true;
        
    } catch (error) {
        console.error('❌ Firebase API 자동 초기화 실패:', error);
    }
})();

console.log('🚀 Firebase API 준비 완료!');