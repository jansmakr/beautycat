// ========================================
// auth.js 수정 부분 (getDemoAccounts 함수)
// ========================================

// 라인 974-1010 교체
function getDemoAccounts() {
    return [
        {
            id: 'demo_customer_1',
            email: 'customer@demo.com',
            password: 'customer123',
            name: '홍길동',
            phone: '010-1234-5678',
            user_type: 'customer',
            status: 'active',
            shop_id: null,
            email_verified: 1,
            phone_verified: 0,
            last_login_at: null
            // 제거: is_active, is_verified, profile_image, last_login, permissions
        },
        {
            id: 'demo_shop_owner_1',
            email: 'shop@demo.com',
            password: 'shop123',
            name: '김사장',
            phone: '010-2345-6789',
            user_type: 'shop',
            status: 'active',
            shop_id: 'shop_001',
            email_verified: 1,
            phone_verified: 1,
            last_login_at: null
            // 제거: is_active, is_verified, profile_image, last_login, permissions
        },
        {
            id: 'demo_admin_1',
            email: 'admin@demo.com',
            password: 'admin123',
            name: '관리자',
            phone: '010-0000-0000',
            user_type: 'admin',
            status: 'active',
            shop_id: null,
            email_verified: 1,
            phone_verified: 1,
            last_login_at: null
            // 제거: is_active, is_verified, profile_image, last_login, permissions
        }
    ];
}

// ========================================
// auth.js 수정 부분 (loadDemoShops 함수)
// ========================================

// 라인 1090-1137 교체
async function loadDemoShops() {
    try {
        const existingShops = await fetch('tables/skincare_shops');
        const shopsData = await existingShops.json();
        
        // 데모 업체가 이미 존재하는지 확인
        const demoShopExists = shopsData.data.some(shop => 
            shop.email === 'demo@shop.com' || 
            (shop.name && shop.name.includes('데모'))
        );
        
        if (!demoShopExists) {
            // D1 스키마에 맞춘 데모 업체 데이터
            const demoShops = [
                {
                    id: 'demo_shop_seoul_geumcheon',
                    name: '데모 피부관리실 (금천구점)',           // ✅ shop_name → name
                    owner_name: '데모 사장님',                    // ✅ name → owner_name
                    email: 'demo@shop.com',
                    phone: '02-1234-5678',
                    address: '서울특별시 금천구 가산동 123-45 데모빌딩 2층',
                    state: '서울특별시',
                    district: '금천구',
                    services: JSON.stringify(['여드름관리', '미백관리', '모공관리']),  // ✅ JSON string
                    description: '금천구 지역 전문 피부관리실입니다.',
                    business_number: '123-45-67890',
                    business_license: null,
                    status: 'active',                             // ✅ approved → active
                    representative_treatments: JSON.stringify(['여드름관리', '미백관리']),
                    price_range: '50000-150000',
                    operating_hours: JSON.stringify({
                        weekday: '10:00-21:00',
                        weekend: '10:00-19:00'
                    })
                    // 제거: password, user_type, shop_state, shop_district, shop_address, 
                    //       is_active, rating, review_count, created_at (자동 생성됨)
                },
                {
                    id: 'demo_shop_seoul_gangnam',
                    name: '데모 피부관리실 (강남구점)',
                    owner_name: '데모 원장님',
                    email: 'demo2@shop.com',
                    phone: '02-2345-6789',
                    address: '서울특별시 강남구 역삼동 456-78 강남타워 5층',
                    state: '서울특별시',
                    district: '강남구',
                    services: JSON.stringify(['안티에이징', '리프팅', '화이트닝']),
                    description: '강남구 최고급 피부관리실입니다.',
                    business_number: '234-56-78901',
                    business_license: null,
                    status: 'active',
                    representative_treatments: JSON.stringify(['안티에이징', '리프팅']),
                    price_range: '100000-300000',
                    operating_hours: JSON.stringify({
                        weekday: '09:00-22:00',
                        weekend: '09:00-20:00'
                    })
                }
            ];
            
            for (const shop of demoShops) {
                await fetch('tables/skincare_shops', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(shop)
                });
            }
            
            console.log('✅ 데모 업체 정보가 생성되었습니다 (지역 정보 포함)');
        }
    } catch (error) {
        console.warn('⚠️ 데모 업체 로드 오류:', error.message);
    }
}
