/**
 * beautycat.kr Cloudflare Workers API
 * 완전한 백엔드 기능 구현
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
                message: error.message
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
                    const limit = parseInt(url.searchParams.get('limit')) || 10;
                    const page = parseInt(url.searchParams.get('page')) || 1;
                    const sort = url.searchParams.get('sort') || 'created_at';
                    
                    return await getTableData(env, tableName, { limit, page, sort }, corsHeaders);
                }
                
            case 'POST':
                // 새 레코드 생성
                const createData = await request.json();
                return await createRecord(env, tableName, createData, corsHeaders);
                
            case 'PUT':
                // 레코드 전체 업데이트
                const updateData = await request.json();
                return await updateRecord(env, tableName, recordId, updateData, corsHeaders);
                
            case 'PATCH':
                // 레코드 부분 업데이트
                const patchData = await request.json();
                return await updateRecord(env, tableName, recordId, patchData, corsHeaders);
                
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
        return new Response(JSON.stringify({
            error: 'Database operation failed',
            message: error.message
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

/**
 * 테이블 데이터 조회
 */
async function getTableData(env, tableName, params, corsHeaders) {
    const { limit, page, sort } = params;
    const offset = (page - 1) * limit;
    
    // D1 데이터베이스 쿼리
    const countResult = await env.BEAUTYCAT_DB.prepare(`SELECT COUNT(*) as total FROM ${tableName}`).first();
    const total = countResult?.total || 0;
    
    const dataResult = await env.BEAUTYCAT_DB.prepare(`
        SELECT * FROM ${tableName} 
        ORDER BY ${sort} DESC 
        LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    
    const response = {
        data: dataResult.results || [],
        total: total,
        page: page,
        limit: limit,
        table: tableName,
        schema: await getTableSchema(tableName)
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
        SELECT * FROM ${tableName} WHERE id = ?
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
 * 새 레코드 생성
 */
async function createRecord(env, tableName, data, corsHeaders) {
    // ID 생성
    const id = data.id || generateId();
    const timestamp = Date.now();
    
    // 기본 필드 추가
    const recordData = {
        ...data,
        id: id,
        created_at: timestamp,
        updated_at: timestamp
    };
    
    // 동적 INSERT 쿼리 생성
    const fields = Object.keys(recordData);
    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map(field => recordData[field]);
    
    const query = `INSERT INTO ${tableName} (${fields.join(', ')}) VALUES (${placeholders})`;
    
    await env.BEAUTYCAT_DB.prepare(query).bind(...values).run();
    
    return new Response(JSON.stringify(recordData), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

/**
 * 레코드 업데이트
 */
async function updateRecord(env, tableName, recordId, data, corsHeaders) {
    const timestamp = Date.now();
    const updateData = { ...data, updated_at: timestamp };
    
    // 동적 UPDATE 쿼리 생성
    const fields = Object.keys(updateData);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = [...fields.map(field => updateData[field]), recordId];
    
    const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;
    
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
        SELECT * FROM ${tableName} WHERE id = ?
    `).bind(recordId).first();
    
    return new Response(JSON.stringify(updatedRecord), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
 * 테이블 스키마 정보
 */
async function getTableSchema(tableName) {
    // 간단한 스키마 정보 반환
    const schemas = {
        users: {
            fields: ['id', 'email', 'name', 'user_type', 'phone', 'status', 'created_at', 'updated_at']
        },
        consultations: {
            fields: ['id', 'customer_name', 'customer_phone', 'customer_email', 'state', 'district', 'treatment_types', 'skin_concerns', 'age_range', 'budget_range', 'preferred_schedule', 'additional_notes', 'skin_photos', 'image_urls', 'status', 'created_at', 'updated_at']
        },
        skincare_shops: {
            fields: ['id', 'name', 'owner_name', 'phone', 'email', 'state', 'district', 'status', 'created_at']
        }
    };
    
    return schemas[tableName] || { fields: [] };
}

/**
 * 유니크 ID 생성
 */
function generateId() {
    return 'cf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}