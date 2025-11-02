/**
 * beautycat.kr Cloudflare Workers API
 * 완전한 백엔드 기능 구현 + Field Filtering
 */

// beautycat API 메인 핸들러
export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        
        // CORS 헤더 설정
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };
        
        // OPTIONS 요청 처리 (CORS preflight)
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        try {
            // API 라우팅
            if (path.startsWith('/api/')) {
                return await handleAPI(request, env, path, corsHeaders);
            }
            
            // 기본 응답
            return new Response('beautycat API Server - Powered by Cloudflare Workers', {
                headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
            });
            
        } catch (error) {
            console.error('Workers 오류:', error);
            return new Response(JSON.stringify({
                error: 'Internal Server Error',
                message: error.message,
                stack: error.stack
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};

/**
 * API 요청 핸들러
 */
async function handleAPI(request, env, path, corsHeaders) {
    const method = request.method;
    
    // /api/tables/{table} 형태로 라우팅
    const apiMatch = path.match(/^\/api\/tables\/([^\/]+)(?:\/([^\/]+))?/);
    
    if (apiMatch) {
        const tableName = apiMatch[1];
        const recordId = apiMatch[2];
        
        return await handleTableAPI(request, env, method, tableName, recordId, corsHeaders);
    }
    
    // 기타 API 엔드포인트
    switch (path) {
        case '/api/health':
            return new Response(JSON.stringify({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                service: 'beautycat-api'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
            
        default:
            return new Response(JSON.stringify({
                error: 'API endpoint not found',
                path: path
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
    }
}

/**
 * 테이블별 허용 필드 정의 (D1 스키마 기반)
 */
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
    consultations: [
        'id', 'customer_id', 'customer_name', 'customer_phone', 'customer_email', 
        'preferred_date', 'preferred_time', 'skin_concerns', 'additional_notes', 
        'state', 'district', 'status', 'assigned_shop_id', 'created_at', 
        'updated_at', 'deleted'
    ],
    bookings: [
        'id', 'customer_id', 'shop_id', 'consultation_id', 'booking_date', 
        'booking_time', 'treatment_type', 'duration_minutes', 'price', 
        'status', 'notes', 'created_at', 'updated_at', 'deleted'
    ]
};

/**
 * 테이블 API 핸들러 (RESTful)
 */
async function handleTableAPI(request, env, method, tableName, recordId, corsHeaders) {
    const url = new URL(request.url);
    
    try {
        switch (method) {
            case 'GET':
                if (recordId) {
                    // 단일 레코드 조회
                    return await getRecord(env, tableName, recordId, corsHeaders);
                } else {
                    // 테이블 목록 조회
                    const limit = parseInt(url.searchParams.get('limit')) || 100;
                    const page = parseInt(url.searchParams.get('page')) || 1;
                    const sort = url.searchParams.get('sort') || 'created_at';
                    const search = url.searchParams.get('search') || '';
                    
                    return await getTableData(env, tableName, { limit, page, sort, search }, corsHeaders);
                }
                
            case 'POST':
                // 새 레코드 생성
                const createData = await request.json();
                return await createRecord(env, tableName, createData, corsHeaders);
                
            case 'PUT':
                // 레코드 전체 업데이트
                const updateData = await request.json();
                return await updateRecord(env, tableName, recordId, updateData, false, corsHeaders);
                
            case 'PATCH':
                // 레코드 부분 업데이트
                const patchData = await request.json();
                return await updateRecord(env, tableName, recordId, patchData, true, corsHeaders);
                
            case 'DELETE':
                // 레코드 삭제
                return await deleteRecord(env, tableName, recordId, corsHeaders);
                
            default:
                return new Response(JSON.stringify({
                    error: 'Method not allowed'
                }), {
                    status: 405,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
        }
    } catch (error) {
        console.error('Database operation failed:', error);
        return new Response(JSON.stringify({
            error: 'Database operation failed',
            message: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 테이블 데이터 조회 (deleted=0만 조회)
 */
async function getTableData(env, tableName, params, corsHeaders) {
    const { limit, page, sort, search } = params;
    const offset = (page - 1) * limit;
    
    // WHERE 조건 구성
    let whereClause = 'WHERE deleted = 0';
    const bindings = [];
    
    if (search) {
        // 검색 조건 추가 (email, name, phone 등)
        whereClause += ' AND (email LIKE ? OR name LIKE ? OR phone LIKE ?)';
        const searchPattern = `%${search}%`;
        bindings.push(searchPattern, searchPattern, searchPattern);
    }
    
    // 전체 개수 조회
    const countQuery = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
    const countStmt = env.BEAUTYCAT_DB.prepare(countQuery);
    const countResult = bindings.length > 0 ? 
        await countStmt.bind(...bindings).first() : 
        await countStmt.first();
    const total = countResult?.total || 0;
    
    // 데이터 조회
    const dataQuery = `
        SELECT * FROM ${tableName} 
        ${whereClause}
        ORDER BY ${sort} DESC 
        LIMIT ? OFFSET ?
    `;
    const dataStmt = env.BEAUTYCAT_DB.prepare(dataQuery);
    const dataResult = bindings.length > 0 ?
        await dataStmt.bind(...bindings, limit, offset).all() :
        await dataStmt.bind(limit, offset).all();
    
    const response = {
        data: dataResult.results || [],
        total: total,
        page: page,
        limit: limit,
        table: tableName,
        schema: getTableSchemaInfo(tableName)
    };
    
    return new Response(JSON.stringify(response), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

/**
 * 단일 레코드 조회
 */
async function getRecord(env, tableName, recordId, corsHeaders) {
    const result = await env.BEAUTYCAT_DB.prepare(`
        SELECT * FROM ${tableName} WHERE id = ? AND deleted = 0
    `).bind(recordId).first();
    
    if (!result) {
        return new Response(JSON.stringify({
            error: 'Record not found'
        }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

/**
 * 새 레코드 생성 (필드 필터링 적용)
 */
async function createRecord(env, tableName, data, corsHeaders) {
    try {
        // 허용된 필드만 필터링
        const allowedFields = TABLE_SCHEMAS[tableName];
        if (!allowedFields) {
            return new Response(JSON.stringify({
                error: 'Invalid table name',
                table: tableName
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        const filteredData = {};
        for (const field of allowedFields) {
            if (data.hasOwnProperty(field)) {
                filteredData[field] = data[field];
            }
        }
        
        // ID 생성 (없는 경우)
        if (!filteredData.id) {
            filteredData.id = generateId();
        }
        
        // 타임스탬프 추가
        const timestamp = Date.now();
        filteredData.created_at = timestamp;
        filteredData.updated_at = timestamp;
        filteredData.deleted = 0;
        
        // 동적 INSERT 쿼리 생성
        const fields = Object.keys(filteredData);
        const placeholders = fields.map(() => '?').join(', ');
        const values = fields.map(field => filteredData[field]);
        
        const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
        
        console.log('INSERT Query:', query);
        console.log('INSERT Values:', values);
        
        await env.BEAUTYCAT_DB.prepare(query).bind(...values).run();
        
        return new Response(JSON.stringify(filteredData), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('createRecord error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to create record',
            message: error.message,
            table: tableName
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 레코드 업데이트 (필드 필터링 적용)
 */
async function updateRecord(env, tableName, recordId, data, isPartial, corsHeaders) {
    try {
        // 허용된 필드만 필터링
        const allowedFields = TABLE_SCHEMAS[tableName];
        if (!allowedFields) {
            return new Response(JSON.stringify({
                error: 'Invalid table name',
                table: tableName
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        const filteredData = {};
        for (const field of allowedFields) {
            if (data.hasOwnProperty(field) && field !== 'id' && field !== 'created_at') {
                filteredData[field] = data[field];
            }
        }
        
        // 타임스탬프 업데이트
        const timestamp = Date.now();
        filteredData.updated_at = timestamp;
        
        // 동적 UPDATE 쿼리 생성
        const fields = Object.keys(filteredData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = [...fields.map(field => filteredData[field]), recordId];
        
        const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ? AND deleted = 0`;
        
        console.log('UPDATE Query:', query);
        console.log('UPDATE Values:', values);
        
        const result = await env.BEAUTYCAT_DB.prepare(query).bind(...values).run();
        
        if (result.changes === 0) {
            return new Response(JSON.stringify({
                error: 'Record not found'
            }), {
                status: 404,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
        
        // 업데이트된 레코드 반환
        const updatedRecord = await env.BEAUTYCAT_DB.prepare(`
            SELECT * FROM ${tableName} WHERE id = ? AND deleted = 0
        `).bind(recordId).first();
        
        return new Response(JSON.stringify(updatedRecord), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error('updateRecord error:', error);
        return new Response(JSON.stringify({
            error: 'Failed to update record',
            message: error.message,
            table: tableName
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 레코드 삭제 (소프트 삭제)
 */
async function deleteRecord(env, tableName, recordId, corsHeaders) {
    const timestamp = Date.now();
    
    const result = await env.BEAUTYCAT_DB.prepare(`
        UPDATE ${tableName} SET deleted = 1, updated_at = ? WHERE id = ?
    `).bind(timestamp, recordId).run();
    
    if (result.changes === 0) {
        return new Response(JSON.stringify({
            error: 'Record not found'
        }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(null, {
        status: 204,
        headers: corsHeaders
    });
}

/**
 * 테이블 스키마 정보 반환
 */
function getTableSchemaInfo(tableName) {
    const allowedFields = TABLE_SCHEMAS[tableName];
    
    if (!allowedFields) {
        return { fields: [] };
    }
    
    return {
        fields: allowedFields,
        tableName: tableName
    };
}

/**
 * 유니크 ID 생성
 */
function generateId() {
    return 'cf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}
