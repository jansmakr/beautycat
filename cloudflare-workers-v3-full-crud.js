/**
 * ============================================
 * BeautyCat Cloudflare Workers API v3
 * ============================================
 * 
 * 완전한 CRUD API 구현:
 * ✅ GET - 조회
 * ✅ POST - 생성
 * ✅ PUT - 전체 수정
 * ✅ PATCH - 부분 수정
 * ✅ DELETE - 삭제 (soft delete)
 */

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Max-Age': '86400',
            'Content-Type': 'application/json',
        };
        
        if (method === 'OPTIONS') {
            return new Response(null, {
                status: 204,
                headers: corsHeaders
            });
        }
        
        // ============================================
        // 사용자 데이터
        // ============================================
        const allUsers = [
            {
                id: 'user_jansmakr_001',
                email: 'jansmakr@gmail.com',
                password: 'admin123',
                name: 'jansmakr',
                user_type: 'admin',
                phone: '010-0000-0000',
                status: 'active',
                is_active: true,
                created_at: Date.now() - 86400000,
                updated_at: Date.now(),
                gs_project_id: 'beautycat',
                gs_table_name: 'users'
            },
            {
                id: 'user_customer_001',
                email: 'customer@test.com',
                password: 'test123',
                name: '김지연',
                user_type: 'customer',
                phone: '010-1234-5678',
                status: 'active',
                is_active: true,
                created_at: Date.now() - 172800000,
                updated_at: Date.now(),
                gs_project_id: 'beautycat',
                gs_table_name: 'users'
            },
            {
                id: 'user_shop_001',
                email: 'shop@beautycat.kr',
                password: 'shop123',
                name: '강남 피부관리실',
                user_type: 'shop',
                phone: '02-1234-9999',
                address: '서울시 강남구 테헤란로 123',
                shop_name: '강남 피부관리실',
                business_number: '123-45-67890',
                services: ['페이셜', '바디케어', '제모', '미백관리'],
                price_range: '50000-150000',
                rating: 4.5,
                status: 'active',
                is_active: true,
                shop_id: 'user_shop_001',
                created_at: Date.now() - 345600000,
                updated_at: Date.now(),
                gs_project_id: 'beautycat',
                gs_table_name: 'users'
            },
            {
                id: 'user_shop_002',
                email: 'hongdae@beautycat.kr',
                password: 'shop123',
                name: '홍대 피부관리실',
                user_type: 'shop',
                phone: '02-5678-1234',
                address: '서울시 마포구 양화로 456',
                shop_name: '홍대 피부관리실',
                business_number: '987-65-43210',
                services: ['페이셜', '아로마테라피', '등마사지', '스톤테라피'],
                price_range: '60000-200000',
                rating: 4.8,
                status: 'active',
                is_active: true,
                shop_id: 'user_shop_002',
                created_at: Date.now() - 432000000,
                updated_at: Date.now(),
                gs_project_id: 'beautycat',
                gs_table_name: 'users'
            },
            {
                id: 'user_admin_001',
                email: 'admin@beautycat.com',
                password: 'admin123',
                name: 'BeautyCat 관리자',
                user_type: 'admin',
                phone: '02-1234-5678',
                status: 'active',
                is_active: true,
                created_at: Date.now() - 259200000,
                updated_at: Date.now(),
                gs_project_id: 'beautycat',
                gs_table_name: 'users'
            }
        ];
        
        // ============================================
        // 상담 요청 데이터 (메모리 기반 - 수정 가능)
        // ============================================
        let consultations = [
            {
                id: 'consult_001',
                customer_id: 'user_customer_001',
                customer_name: '김지연',
                customer_phone: '010-1234-5678',
                shop_id: 'user_shop_001',
                shop_name: '강남 피부관리실',
                treatment_type: '여드름 집중 관리',
                skin_type: '복합성',
                concern: '여드름과 홍조가 심합니다',
                description: '최근 스트레스로 인해 여드름이 많이 생겼어요. 관리 받고 싶습니다.',
                preferred_date: '2025-02-05',
                preferred_time: '오후 2시',
                budget: '100000-150000',
                status: 'pending',
                deleted: false,
                created_at: Date.now() - 3600000,
                updated_at: Date.now() - 3600000,
                gs_project_id: 'beautycat',
                gs_table_name: 'consultations'
            },
            {
                id: 'consult_002',
                customer_id: 'user_customer_001',
                customer_name: '김지연',
                customer_phone: '010-1234-5678',
                shop_id: 'user_shop_001',
                shop_name: '강남 피부관리실',
                treatment_type: '미백 관리',
                skin_type: '건성',
                concern: '기미, 잡티',
                description: '겨울철 건조함과 기미가 걱정됩니다.',
                preferred_date: '2025-02-08',
                preferred_time: '오전 10시',
                budget: '150000-200000',
                status: 'in_progress',
                deleted: false,
                created_at: Date.now() - 86400000,
                updated_at: Date.now() - 7200000,
                gs_project_id: 'beautycat',
                gs_table_name: 'consultations'
            },
            {
                id: 'consult_003',
                customer_id: 'user_customer_001',
                customer_name: '김지연',
                customer_phone: '010-1234-5678',
                shop_id: 'user_shop_001',
                shop_name: '강남 피부관리실',
                treatment_type: '보습 관리',
                skin_type: '민감성',
                concern: '건조함, 각질',
                description: '환절기라 피부가 많이 건조해요.',
                preferred_date: '2025-01-28',
                preferred_time: '오후 4시',
                budget: '80000-120000',
                status: 'completed',
                deleted: false,
                created_at: Date.now() - 259200000,
                updated_at: Date.now() - 172800000,
                gs_project_id: 'beautycat',
                gs_table_name: 'consultations'
            },
            {
                id: 'consult_004',
                customer_id: 'user_customer_001',
                customer_name: '김지연',
                customer_phone: '010-1234-5678',
                shop_id: 'user_shop_002',
                shop_name: '홍대 피부관리실',
                treatment_type: '아로마 테라피',
                skin_type: '보통',
                concern: '스트레스, 피로',
                description: '스트레스 해소를 위한 관리를 받고 싶습니다.',
                preferred_date: '2025-02-10',
                preferred_time: '오후 1시',
                budget: '100000-150000',
                status: 'pending',
                deleted: false,
                created_at: Date.now() - 7200000,
                updated_at: Date.now() - 7200000,
                gs_project_id: 'beautycat',
                gs_table_name: 'consultations'
            }
        ];
        
        // ============================================
        // 견적서 데이터 (메모리 기반 - 수정 가능)
        // ============================================
        let quotes = [
            {
                id: 'quote_001',
                consultation_id: 'consult_001',
                customer_id: 'user_customer_001',
                customer_name: '김지연',
                shop_id: 'user_shop_001',
                shop_name: '강남 피부관리실',
                treatment_type: '여드름 집중 관리',
                description: '여드름 압출 + 진정 관리 + LED 테라피 (1회)',
                price: 120000,
                duration: '90분',
                available_dates: '월-금 오전/오후, 주말 오전',
                additional_notes: '신규 고객 10% 할인 적용된 가격입니다.',
                status: 'pending',
                deleted: false,
                created_at: Date.now() - 1800000,
                updated_at: Date.now() - 1800000,
                valid_until: Date.now() + 604800000,
                gs_project_id: 'beautycat',
                gs_table_name: 'quotes'
            },
            {
                id: 'quote_002',
                consultation_id: 'consult_002',
                customer_id: 'user_customer_001',
                customer_name: '김지연',
                shop_id: 'user_shop_001',
                shop_name: '강남 피부관리실',
                treatment_type: '미백 관리',
                description: '비타민 앰플 + 미백팩 + 레이저토닝 (1회)',
                price: 180000,
                duration: '120분',
                available_dates: '월-금 전시간, 토요일 오전',
                additional_notes: '패키지 구매시 추가 할인 가능',
                status: 'accepted',
                deleted: false,
                created_at: Date.now() - 43200000,
                updated_at: Date.now() - 28800000,
                valid_until: Date.now() + 518400000,
                gs_project_id: 'beautycat',
                gs_table_name: 'quotes'
            },
            {
                id: 'quote_003',
                consultation_id: 'consult_003',
                customer_id: 'user_customer_001',
                customer_name: '김지연',
                shop_id: 'user_shop_001',
                shop_name: '강남 피부관리실',
                treatment_type: '보습 관리',
                description: '딥 클렌징 + 수분 앰플 + 보습팩 (1회)',
                price: 100000,
                duration: '60분',
                available_dates: '언제든지 가능',
                additional_notes: '건조한 계절에 추천드립니다.',
                status: 'completed',
                deleted: false,
                created_at: Date.now() - 259200000,
                updated_at: Date.now() - 172800000,
                valid_until: Date.now() - 86400000,
                gs_project_id: 'beautycat',
                gs_table_name: 'quotes'
            },
            {
                id: 'quote_004',
                consultation_id: 'consult_001',
                customer_id: 'user_customer_001',
                customer_name: '김지연',
                shop_id: 'user_shop_001',
                shop_name: '강남 피부관리실',
                treatment_type: '여드름 집중 관리',
                description: '여드름 패키지 (5회) - 압출 + 진정 + 재생관리',
                price: 500000,
                duration: '90분/회',
                available_dates: '주 1-2회 진행 권장',
                additional_notes: '5회 패키지 구매시 1회 무료 (총 6회)',
                status: 'rejected',
                deleted: false,
                created_at: Date.now() - 86400000,
                updated_at: Date.now() - 72000000,
                valid_until: Date.now() + 432000000,
                gs_project_id: 'beautycat',
                gs_table_name: 'quotes'
            }
        ];
        
        // ============================================
        // 헬퍼 함수
        // ============================================
        
        // UUID 생성
        function generateId(prefix) {
            return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        }
        
        // 시스템 필드 추가
        function addSystemFields(data, tableName) {
            const now = Date.now();
            return {
                id: data.id || generateId(tableName === 'consultations' ? 'consult' : 'quote'),
                ...data,
                deleted: false,
                created_at: now,
                updated_at: now,
                gs_project_id: 'beautycat',
                gs_table_name: tableName
            };
        }
        
        // 업데이트 필드 추가
        function addUpdateFields(existingData, updateData) {
            return {
                ...existingData,
                ...updateData,
                updated_at: Date.now()
            };
        }
        
        try {
            // ============================================
            // 루트 경로
            // ============================================
            if (path === '/' || path === '/api' || path === '/api/') {
                return new Response(JSON.stringify({
                    status: 'ready',
                    message: 'BeautyCat API v3 - Full CRUD Support!',
                    version: '3.0',
                    features: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                    endpoints: {
                        users: '/api/tables/users',
                        shops: '/api/tables/skincare_shops',
                        consultations: '/api/tables/consultations',
                        quotes: '/api/tables/quotes'
                    }
                }), {
                    headers: corsHeaders
                });
            }
            
            // ============================================
            // 사용자 API (GET만 지원)
            // ============================================
            if (path.startsWith('/api/tables/users') && method === 'GET') {
                return new Response(JSON.stringify({
                    data: allUsers,
                    total: allUsers.length,
                    page: 1,
                    limit: 100,
                    table: 'users'
                }), {
                    status: 200,
                    headers: corsHeaders
                });
            }
            
            // ============================================
            // 피부관리실 API (GET만 지원)
            // ============================================
            if (path === '/api/tables/skincare_shops' && method === 'GET') {
                const shops = allUsers.filter(u => u.user_type === 'shop');
                
                return new Response(JSON.stringify({
                    data: shops,
                    total: shops.length,
                    page: 1,
                    limit: 100,
                    table: 'skincare_shops'
                }), {
                    status: 200,
                    headers: corsHeaders
                });
            }
            
            if (path.match(/^\/api\/tables\/skincare_shops\/[^\/]+$/) && method === 'GET') {
                const shopId = path.split('/').pop();
                const shop = allUsers.find(u => u.id === shopId && u.user_type === 'shop');
                
                if (shop) {
                    return new Response(JSON.stringify(shop), {
                        status: 200,
                        headers: corsHeaders
                    });
                } else {
                    return new Response(JSON.stringify({ 
                        error: 'Shop not found',
                        id: shopId 
                    }), {
                        status: 404,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 상담 요청 API - GET (목록 조회)
            // ============================================
            if (path === '/api/tables/consultations' && method === 'GET') {
                const shopId = url.searchParams.get('shop_id');
                const status = url.searchParams.get('status');
                
                let filtered = consultations.filter(c => !c.deleted);
                
                if (shopId) {
                    filtered = filtered.filter(c => c.shop_id === shopId);
                }
                
                if (status) {
                    filtered = filtered.filter(c => c.status === status);
                }
                
                filtered.sort((a, b) => b.created_at - a.created_at);
                
                return new Response(JSON.stringify({
                    data: filtered,
                    total: filtered.length,
                    page: 1,
                    limit: 100,
                    table: 'consultations'
                }), {
                    status: 200,
                    headers: corsHeaders
                });
            }
            
            // ============================================
            // 상담 요청 API - POST (신규 생성)
            // ============================================
            if (path === '/api/tables/consultations' && method === 'POST') {
                try {
                    const body = await request.json();
                    
                    // 필수 필드 검증
                    const requiredFields = ['customer_id', 'shop_id', 'treatment_type'];
                    for (const field of requiredFields) {
                        if (!body[field]) {
                            return new Response(JSON.stringify({
                                error: 'Validation Error',
                                message: `Missing required field: ${field}`
                            }), {
                                status: 400,
                                headers: corsHeaders
                            });
                        }
                    }
                    
                    // 새 상담 생성
                    const newConsultation = addSystemFields(body, 'consultations');
                    consultations.push(newConsultation);
                    
                    return new Response(JSON.stringify(newConsultation), {
                        status: 201,
                        headers: corsHeaders
                    });
                    
                } catch (error) {
                    return new Response(JSON.stringify({
                        error: 'Bad Request',
                        message: error.message
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 상담 요청 API - GET (단일 조회)
            // ============================================
            if (path.match(/^\/api\/tables\/consultations\/[^\/]+$/) && method === 'GET') {
                const consultId = path.split('/').pop();
                const consultation = consultations.find(c => c.id === consultId && !c.deleted);
                
                if (consultation) {
                    return new Response(JSON.stringify(consultation), {
                        status: 200,
                        headers: corsHeaders
                    });
                } else {
                    return new Response(JSON.stringify({ 
                        error: 'Consultation not found',
                        id: consultId 
                    }), {
                        status: 404,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 상담 요청 API - PUT (전체 수정)
            // ============================================
            if (path.match(/^\/api\/tables\/consultations\/[^\/]+$/) && method === 'PUT') {
                try {
                    const consultId = path.split('/').pop();
                    const body = await request.json();
                    
                    const index = consultations.findIndex(c => c.id === consultId && !c.deleted);
                    
                    if (index === -1) {
                        return new Response(JSON.stringify({
                            error: 'Consultation not found',
                            id: consultId
                        }), {
                            status: 404,
                            headers: corsHeaders
                        });
                    }
                    
                    // 전체 수정 (시스템 필드 제외)
                    consultations[index] = {
                        ...body,
                        id: consultId,
                        deleted: false,
                        created_at: consultations[index].created_at,
                        updated_at: Date.now(),
                        gs_project_id: 'beautycat',
                        gs_table_name: 'consultations'
                    };
                    
                    return new Response(JSON.stringify(consultations[index]), {
                        status: 200,
                        headers: corsHeaders
                    });
                    
                } catch (error) {
                    return new Response(JSON.stringify({
                        error: 'Bad Request',
                        message: error.message
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 상담 요청 API - PATCH (부분 수정)
            // ============================================
            if (path.match(/^\/api\/tables\/consultations\/[^\/]+$/) && method === 'PATCH') {
                try {
                    const consultId = path.split('/').pop();
                    const body = await request.json();
                    
                    const index = consultations.findIndex(c => c.id === consultId && !c.deleted);
                    
                    if (index === -1) {
                        return new Response(JSON.stringify({
                            error: 'Consultation not found',
                            id: consultId
                        }), {
                            status: 404,
                            headers: corsHeaders
                        });
                    }
                    
                    // 부분 수정
                    consultations[index] = addUpdateFields(consultations[index], body);
                    
                    return new Response(JSON.stringify(consultations[index]), {
                        status: 200,
                        headers: corsHeaders
                    });
                    
                } catch (error) {
                    return new Response(JSON.stringify({
                        error: 'Bad Request',
                        message: error.message
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 상담 요청 API - DELETE (소프트 삭제)
            // ============================================
            if (path.match(/^\/api\/tables\/consultations\/[^\/]+$/) && method === 'DELETE') {
                const consultId = path.split('/').pop();
                const index = consultations.findIndex(c => c.id === consultId && !c.deleted);
                
                if (index === -1) {
                    return new Response(JSON.stringify({
                        error: 'Consultation not found',
                        id: consultId
                    }), {
                        status: 404,
                        headers: corsHeaders
                    });
                }
                
                // 소프트 삭제
                consultations[index].deleted = true;
                consultations[index].updated_at = Date.now();
                
                return new Response(null, {
                    status: 204,
                    headers: corsHeaders
                });
            }
            
            // ============================================
            // 견적서 API - GET (목록 조회)
            // ============================================
            if (path === '/api/tables/quotes' && method === 'GET') {
                const shopId = url.searchParams.get('shop_id');
                const status = url.searchParams.get('status');
                
                let filtered = quotes.filter(q => !q.deleted);
                
                if (shopId) {
                    filtered = filtered.filter(q => q.shop_id === shopId);
                }
                
                if (status) {
                    filtered = filtered.filter(q => q.status === status);
                }
                
                filtered.sort((a, b) => b.created_at - a.created_at);
                
                return new Response(JSON.stringify({
                    data: filtered,
                    total: filtered.length,
                    page: 1,
                    limit: 100,
                    table: 'quotes'
                }), {
                    status: 200,
                    headers: corsHeaders
                });
            }
            
            // ============================================
            // 견적서 API - POST (신규 생성)
            // ============================================
            if (path === '/api/tables/quotes' && method === 'POST') {
                try {
                    const body = await request.json();
                    
                    // 필수 필드 검증
                    const requiredFields = ['consultation_id', 'customer_id', 'shop_id', 'treatment_type', 'price'];
                    for (const field of requiredFields) {
                        if (!body[field]) {
                            return new Response(JSON.stringify({
                                error: 'Validation Error',
                                message: `Missing required field: ${field}`
                            }), {
                                status: 400,
                                headers: corsHeaders
                            });
                        }
                    }
                    
                    // 새 견적서 생성
                    const newQuote = addSystemFields(body, 'quotes');
                    quotes.push(newQuote);
                    
                    return new Response(JSON.stringify(newQuote), {
                        status: 201,
                        headers: corsHeaders
                    });
                    
                } catch (error) {
                    return new Response(JSON.stringify({
                        error: 'Bad Request',
                        message: error.message
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 견적서 API - GET (단일 조회)
            // ============================================
            if (path.match(/^\/api\/tables\/quotes\/[^\/]+$/) && method === 'GET') {
                const quoteId = path.split('/').pop();
                const quote = quotes.find(q => q.id === quoteId && !q.deleted);
                
                if (quote) {
                    return new Response(JSON.stringify(quote), {
                        status: 200,
                        headers: corsHeaders
                    });
                } else {
                    return new Response(JSON.stringify({ 
                        error: 'Quote not found',
                        id: quoteId 
                    }), {
                        status: 404,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 견적서 API - PUT (전체 수정)
            // ============================================
            if (path.match(/^\/api\/tables\/quotes\/[^\/]+$/) && method === 'PUT') {
                try {
                    const quoteId = path.split('/').pop();
                    const body = await request.json();
                    
                    const index = quotes.findIndex(q => q.id === quoteId && !q.deleted);
                    
                    if (index === -1) {
                        return new Response(JSON.stringify({
                            error: 'Quote not found',
                            id: quoteId
                        }), {
                            status: 404,
                            headers: corsHeaders
                        });
                    }
                    
                    // 전체 수정
                    quotes[index] = {
                        ...body,
                        id: quoteId,
                        deleted: false,
                        created_at: quotes[index].created_at,
                        updated_at: Date.now(),
                        gs_project_id: 'beautycat',
                        gs_table_name: 'quotes'
                    };
                    
                    return new Response(JSON.stringify(quotes[index]), {
                        status: 200,
                        headers: corsHeaders
                    });
                    
                } catch (error) {
                    return new Response(JSON.stringify({
                        error: 'Bad Request',
                        message: error.message
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 견적서 API - PATCH (부분 수정)
            // ============================================
            if (path.match(/^\/api\/tables\/quotes\/[^\/]+$/) && method === 'PATCH') {
                try {
                    const quoteId = path.split('/').pop();
                    const body = await request.json();
                    
                    const index = quotes.findIndex(q => q.id === quoteId && !q.deleted);
                    
                    if (index === -1) {
                        return new Response(JSON.stringify({
                            error: 'Quote not found',
                            id: quoteId
                        }), {
                            status: 404,
                            headers: corsHeaders
                        });
                    }
                    
                    // 부분 수정
                    quotes[index] = addUpdateFields(quotes[index], body);
                    
                    return new Response(JSON.stringify(quotes[index]), {
                        status: 200,
                        headers: corsHeaders
                    });
                    
                } catch (error) {
                    return new Response(JSON.stringify({
                        error: 'Bad Request',
                        message: error.message
                    }), {
                        status: 400,
                        headers: corsHeaders
                    });
                }
            }
            
            // ============================================
            // 견적서 API - DELETE (소프트 삭제)
            // ============================================
            if (path.match(/^\/api\/tables\/quotes\/[^\/]+$/) && method === 'DELETE') {
                const quoteId = path.split('/').pop();
                const index = quotes.findIndex(q => q.id === quoteId && !q.deleted);
                
                if (index === -1) {
                    return new Response(JSON.stringify({
                        error: 'Quote not found',
                        id: quoteId
                    }), {
                        status: 404,
                        headers: corsHeaders
                    });
                }
                
                // 소프트 삭제
                quotes[index].deleted = true;
                quotes[index].updated_at = Date.now();
                
                return new Response(null, {
                    status: 204,
                    headers: corsHeaders
                });
            }
            
            // 404 - Not Found
            return new Response(JSON.stringify({ 
                error: 'Not Found',
                path: path,
                method: method
            }), { 
                status: 404, 
                headers: corsHeaders 
            });
            
        } catch (error) {
            console.error('API Error:', error);
            return new Response(JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message 
            }), {
                status: 500,
                headers: corsHeaders
            });
        }
    }
};
