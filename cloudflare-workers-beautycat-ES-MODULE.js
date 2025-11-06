// Cloudflare Workers API - ES Module Format with D1 Database Support
// CORS 헤더 설정 (PATCH 포함!)
function getCorsHeaders(origin) {
    const allowedOrigins = [
        'https://beautycat-v2.pages.dev',
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ];
    
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
    };
    
    return corsHeaders;
}

// OPTIONS 요청 처리 (Preflight)
function handleOptions(request) {
    const origin = request.headers.get('Origin');
    const corsHeaders = getCorsHeaders(origin);
    
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

// TABLE_SCHEMAS 정의 (필드 필터링용)
const TABLE_SCHEMAS = {
    users: [
        'id', 'email', 'password', 'password_salt', 'name', 'user_type', 
        'phone', 'status', 'shop_id', 'email_verified', 'phone_verified', 
        'last_login_at', 'created_at', 'updated_at', 'deleted'
    ],
    skincare_shops: [
        'id', 'name', 'owner_name', 'phone', 'email', 'address', 'state', 
        'district', 'services', 'description', 'business_number', 
        'business_license', 'status', 'representative_treatments', 
        'price_range', 'operating_hours', 'created_at', 'updated_at', 'deleted'
    ],
    service_categories: [
        'id', 'name', 'description', 'icon', 'display_order', 
        'created_at', 'updated_at', 'deleted'
    ],
    shop_services: [
        'id', 'shop_id', 'category_id', 'name', 'description', 'price', 
        'duration', 'is_active', 'created_at', 'updated_at', 'deleted'
    ],
    reservations: [
        'id', 'customer_id', 'shop_id', 'service_id', 'reservation_date', 
        'start_time', 'end_time', 'status', 'notes', 'created_at', 
        'updated_at', 'deleted'
    ],
    reviews: [
        'id', 'customer_id', 'shop_id', 'reservation_id', 'rating', 
        'comment', 'response', 'created_at', 'updated_at', 'deleted'
    ],
    messages: [
        'id', 'sender_id', 'receiver_id', 'content', 'is_read', 
        'created_at', 'updated_at', 'deleted'
    ],
    notifications: [
        'id', 'user_id', 'title', 'message', 'type', 'is_read', 
        'created_at', 'updated_at', 'deleted'
    ],
    shop_photos: [
        'id', 'shop_id', 'photo_url', 'caption', 'display_order', 
        'created_at', 'updated_at', 'deleted'
    ],
    favorites: [
        'id', 'customer_id', 'shop_id', 'created_at', 'updated_at', 'deleted'
    ]
};

// JSON 응답 헬퍼
function jsonResponse(data, status = 200, corsHeaders = {}) {
    return new Response(JSON.stringify(data), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
        }
    });
}

// UUID 생성
function generateUUID() {
    return 'cf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 레코드 목록 조회 (GET /tables/{table})
async function listRecords(db, tableName, searchParams, corsHeaders) {
    try {
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = parseInt(searchParams.get('limit')) || 100;
        const offset = (page - 1) * limit;
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || 'created_at';
        
        let query = `SELECT * FROM ${tableName} WHERE deleted = 0`;
        let countQuery = `SELECT COUNT(*) as total FROM ${tableName} WHERE deleted = 0`;
        const params = [];
        const countParams = [];
        
        if (search) {
            const searchCondition = ` AND (
                id LIKE ? OR 
                name LIKE ? OR 
                email LIKE ?
            )`;
            const searchValue = `%${search}%`;
            query += searchCondition;
            countQuery += searchCondition;
            params.push(searchValue, searchValue, searchValue);
            countParams.push(searchValue, searchValue, searchValue);
        }
        
        query += ` ORDER BY ${sort} DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);
        
        const stmt = db.prepare(query).bind(...params);
        const result = await stmt.all();
        
        const countStmt = db.prepare(countQuery).bind(...countParams);
        const countResult = await countStmt.first();
        
        return jsonResponse({
            data: result.results || [],
            total: countResult?.total || 0,
            page,
            limit,
            table: tableName,
            schema: TABLE_SCHEMAS[tableName] || []
        }, 200, corsHeaders);
        
    } catch (error) {
        console.error('List records error:', error);
        return jsonResponse({ 
            error: 'Failed to list records',
            message: error.message 
        }, 500, corsHeaders);
    }
}

// 단일 레코드 조회 (GET /tables/{table}/{id})
async function getRecord(db, tableName, recordId, corsHeaders) {
    try {
        const query = `SELECT * FROM ${tableName} WHERE id = ? AND deleted = 0 LIMIT 1`;
        const stmt = db.prepare(query).bind(recordId);
        const result = await stmt.first();
        
        if (!result) {
            return jsonResponse({ error: 'Record not found' }, 404, corsHeaders);
        }
        
        return jsonResponse(result, 200, corsHeaders);
        
    } catch (error) {
        console.error('Get record error:', error);
        return jsonResponse({ 
            error: 'Failed to get record',
            message: error.message 
        }, 500, corsHeaders);
    }
}

// 레코드 생성 (POST /tables/{table})
async function createRecord(db, tableName, data, corsHeaders) {
    try {
        // 허용된 필드만 필터링
        const allowedFields = TABLE_SCHEMAS[tableName];
        if (!allowedFields) {
            return jsonResponse({ error: 'Unknown table' }, 400, corsHeaders);
        }
        
        const filteredData = {};
        for (const field of allowedFields) {
            if (data.hasOwnProperty(field)) {
                filteredData[field] = data[field];
            }
        }
        
        // 시스템 필드 자동 설정
        filteredData.id = filteredData.id || generateUUID();
        filteredData.created_at = filteredData.created_at || Date.now();
        filteredData.updated_at = filteredData.updated_at || Date.now();
        filteredData.deleted = filteredData.deleted || 0;
        
        const fields = Object.keys(filteredData);
        const values = Object.values(filteredData);
        const placeholders = fields.map(() => '?').join(', ');
        
        const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        const stmt = db.prepare(query).bind(...values);
        await stmt.run();
        
        // 생성된 레코드 반환
        const selectQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
        const selectStmt = db.prepare(selectQuery).bind(filteredData.id);
        const result = await selectStmt.first();
        
        return jsonResponse(result, 201, corsHeaders);
        
    } catch (error) {
        console.error('Create record error:', error);
        return jsonResponse({ 
            error: 'Failed to create record',
            message: error.message 
        }, 500, corsHeaders);
    }
}

// 레코드 수정 (PUT/PATCH /tables/{table}/{id})
async function updateRecord(db, tableName, recordId, data, isPartial, corsHeaders) {
    try {
        // 허용된 필드만 필터링
        const allowedFields = TABLE_SCHEMAS[tableName];
        if (!allowedFields) {
            return jsonResponse({ error: 'Unknown table' }, 400, corsHeaders);
        }
        
        const filteredData = {};
        for (const field of allowedFields) {
            if (data.hasOwnProperty(field) && field !== 'id') {
                filteredData[field] = data[field];
            }
        }
        
        // updated_at 자동 갱신
        filteredData.updated_at = Date.now();
        
        const fields = Object.keys(filteredData);
        const values = Object.values(filteredData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        
        const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ? AND deleted = 0`;
        values.push(recordId);
        
        const stmt = db.prepare(query).bind(...values);
        const result = await stmt.run();
        
        if (result.meta.changes === 0) {
            return jsonResponse({ error: 'Record not found or not modified' }, 404, corsHeaders);
        }
        
        // 수정된 레코드 반환
        const selectQuery = `SELECT * FROM ${tableName} WHERE id = ?`;
        const selectStmt = db.prepare(selectQuery).bind(recordId);
        const selectResult = await selectStmt.first();
        
        return jsonResponse(selectResult, 200, corsHeaders);
        
    } catch (error) {
        console.error('Update record error:', error);
        return jsonResponse({ 
            error: 'Failed to update record',
            message: error.message 
        }, 500, corsHeaders);
    }
}

// 레코드 삭제 (DELETE /tables/{table}/{id})
async function deleteRecord(db, tableName, recordId, corsHeaders) {
    try {
        const query = `UPDATE ${tableName} SET deleted = 1, updated_at = ? WHERE id = ? AND deleted = 0`;
        const stmt = db.prepare(query).bind(Date.now(), recordId);
        const result = await stmt.run();
        
        if (result.meta.changes === 0) {
            return jsonResponse({ error: 'Record not found' }, 404, corsHeaders);
        }
        
        return new Response(null, { 
            status: 204,
            headers: corsHeaders 
        });
        
    } catch (error) {
        console.error('Delete record error:', error);
        return jsonResponse({ 
            error: 'Failed to delete record',
            message: error.message 
        }, 500, corsHeaders);
    }
}

// ES Module Export - 메인 핸들러
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin');
        const corsHeaders = getCorsHeaders(origin);
        
        // OPTIONS 요청 처리
        if (request.method === 'OPTIONS') {
            return handleOptions(request);
        }
        
        // API 경로 확인
        if (!url.pathname.startsWith('/api/')) {
            return new Response('Not Found', { 
                status: 404,
                headers: corsHeaders 
            });
        }
        
        // /api/ 제거
        const path = url.pathname.replace(/^\/api\//, '');
        const pathParts = path.split('/');
        
        try {
            // D1 데이터베이스 바인딩 확인
            if (!env.BEAUTYCAT_DB) {
                return jsonResponse({ 
                    error: 'Database not configured',
                    message: 'BEAUTYCAT_DB binding is missing' 
                }, 500, corsHeaders);
            }
            
            // tables 경로 라우팅
            if (pathParts[0] === 'tables') {
                const tableName = pathParts[1];
                const recordId = pathParts[2];
                
                if (!tableName) {
                    return jsonResponse({ error: 'Table name required' }, 400, corsHeaders);
                }
                
                // RESTful API 메서드 처리
                switch (request.method) {
                    case 'GET':
                        if (recordId) {
                            return getRecord(env.BEAUTYCAT_DB, tableName, recordId, corsHeaders);
                        } else {
                            return listRecords(env.BEAUTYCAT_DB, tableName, url.searchParams, corsHeaders);
                        }
                        
                    case 'POST':
                        const createData = await request.json();
                        return createRecord(env.BEAUTYCAT_DB, tableName, createData, corsHeaders);
                        
                    case 'PUT':
                        if (!recordId) {
                            return jsonResponse({ error: 'Record ID required for PUT' }, 400, corsHeaders);
                        }
                        const putData = await request.json();
                        return updateRecord(env.BEAUTYCAT_DB, tableName, recordId, putData, false, corsHeaders);
                        
                    case 'PATCH':
                        if (!recordId) {
                            return jsonResponse({ error: 'Record ID required for PATCH' }, 400, corsHeaders);
                        }
                        const patchData = await request.json();
                        return updateRecord(env.BEAUTYCAT_DB, tableName, recordId, patchData, true, corsHeaders);
                        
                    case 'DELETE':
                        if (!recordId) {
                            return jsonResponse({ error: 'Record ID required for DELETE' }, 400, corsHeaders);
                        }
                        return deleteRecord(env.BEAUTYCAT_DB, tableName, recordId, corsHeaders);
                        
                    default:
                        return jsonResponse({ error: 'Method not allowed' }, 405, corsHeaders);
                }
            }
            
            return jsonResponse({ error: 'Invalid API endpoint' }, 404, corsHeaders);
            
        } catch (error) {
            console.error('API Error:', error);
            return jsonResponse({ 
                error: 'Internal server error',
                message: error.message 
            }, 500, corsHeaders);
        }
    }
};
