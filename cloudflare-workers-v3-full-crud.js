/**
 * BeautyCat Cloudflare Workers API v3
 * Full CRUD Operations with KV Storage
 * CORS 지원 추가
 */

// KV 네임스페이스 바인딩: BEAUTYCAT_KV

// ==========================================
// 🛡️ CORS 헤더 추가 함수
// ==========================================
function addCorsHeaders(response) {
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', '*');
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  newHeaders.set('Access-Control-Max-Age', '86400');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

// ==========================================
// 🔧 유틸리티 함수들
// ==========================================

// JSON 응답 생성 (CORS 포함)
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

// 오류 응답 생성 (CORS 포함)
function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}

// UUID 생성
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 현재 타임스탬프 (밀리초)
function getCurrentTimestamp() {
  return Date.now();
}

// ==========================================
// 📊 데이터 스키마 정의
// ==========================================

const SCHEMAS = {
  users: {
    required: ['email', 'password', 'name', 'user_type'],
    fields: {
      id: 'string',
      email: 'string',
      password: 'string',
      name: 'string',
      user_type: 'string', // customer, shop, admin
      phone: 'string',
      address: 'string',
      shop_name: 'string',
      business_number: 'string',
      services: 'array',
      price_range: 'string',
      rating: 'number',
      status: 'string',
      is_active: 'boolean',
      shop_id: 'string',
      created_at: 'number',
      updated_at: 'number'
    }
  },
  skincare_shops: {
    required: ['name', 'address', 'phone'],
    fields: {
      id: 'string',
      name: 'string',
      address: 'string',
      phone: 'string',
      email: 'string',
      description: 'string',
      services: 'array',
      price_range: 'string',
      rating: 'number',
      images: 'array',
      business_hours: 'object',
      owner_id: 'string',
      status: 'string',
      is_active: 'boolean',
      created_at: 'number',
      updated_at: 'number'
    }
  },
  consultations: {
    required: ['customer_id', 'service_type'],
    fields: {
      id: 'string',
      customer_id: 'string',
      customer_name: 'string',
      customer_phone: 'string',
      service_type: 'string',
      location: 'string',
      preferred_date: 'string',
      skin_condition: 'string',
      budget: 'string',
      status: 'string',
      created_at: 'number',
      updated_at: 'number'
    }
  },
  quotes: {
    required: ['consultation_id', 'shop_id', 'price'],
    fields: {
      id: 'string',
      consultation_id: 'string',
      shop_id: 'string',
      shop_name: 'string',
      service_description: 'string',
      price: 'number',
      estimated_duration: 'string',
      validity_period: 'string',
      status: 'string',
      created_at: 'number',
      updated_at: 'number'
    }
  }
};

// ==========================================
// 💾 KV 스토리지 작업
// ==========================================

// 테이블의 모든 레코드 가져오기
async function getAllRecords(env, tableName) {
  const key = `table:${tableName}:records`;
  const data = await env.BEAUTYCAT_KV.get(key, { type: 'json' });
  return data || [];
}

// 테이블에 레코드 저장
async function saveAllRecords(env, tableName, records) {
  const key = `table:${tableName}:records`;
  await env.BEAUTYCAT_KV.put(key, JSON.stringify(records));
}

// 단일 레코드 가져오기
async function getRecordById(env, tableName, id) {
  const records = await getAllRecords(env, tableName);
  return records.find(r => r.id === id);
}

// ==========================================
// 🔍 API 핸들러: GET (목록 조회)
// ==========================================
async function handleGetRecords(env, tableName, url) {
  try {
    const records = await getAllRecords(env, tableName);
    
    // 쿼리 파라미터 파싱
    const urlObj = new URL(url);
    const page = parseInt(urlObj.searchParams.get('page')) || 1;
    const limit = parseInt(urlObj.searchParams.get('limit')) || 100;
    const search = urlObj.searchParams.get('search') || '';
    const sort = urlObj.searchParams.get('sort') || 'created_at';
    
    // 검색 필터링
    let filteredRecords = records;
    if (search) {
      filteredRecords = records.filter(record => {
        return Object.values(record).some(value => {
          if (typeof value === 'string') {
            return value.toLowerCase().includes(search.toLowerCase());
          }
          return false;
        });
      });
    }
    
    // 정렬
    filteredRecords.sort((a, b) => {
      if (a[sort] < b[sort]) return -1;
      if (a[sort] > b[sort]) return 1;
      return 0;
    });
    
    // 페이징
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedRecords = filteredRecords.slice(start, end);
    
    return jsonResponse({
      data: paginatedRecords,
      total: filteredRecords.length,
      page: page,
      limit: limit,
      table: tableName
    });
    
  } catch (error) {
    return errorResponse(`Failed to get records: ${error.message}`, 500);
  }
}

// ==========================================
// 🔍 API 핸들러: GET (단일 조회)
// ==========================================
async function handleGetRecord(env, tableName, id) {
  try {
    const record = await getRecordById(env, tableName, id);
    
    if (!record) {
      return errorResponse('Record not found', 404);
    }
    
    return jsonResponse(record);
    
  } catch (error) {
    return errorResponse(`Failed to get record: ${error.message}`, 500);
  }
}

// ==========================================
// ✏️ API 핸들러: POST (생성)
// ==========================================
async function handleCreateRecord(env, tableName, body) {
  try {
    const schema = SCHEMAS[tableName];
    if (!schema) {
      return errorResponse(`Unknown table: ${tableName}`, 400);
    }
    
    // 필수 필드 검증
    for (const field of schema.required) {
      if (!body[field]) {
        return errorResponse(`Missing required field: ${field}`, 400);
      }
    }
    
    // 새 레코드 생성
    const newRecord = {
      id: body.id || generateUUID(),
      ...body,
      gs_project_id: 'beautycat',
      gs_table_name: tableName,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp()
    };
    
    // 기존 레코드 가져오기
    const records = await getAllRecords(env, tableName);
    
    // 레코드 추가
    records.push(newRecord);
    
    // 저장
    await saveAllRecords(env, tableName, records);
    
    return jsonResponse(newRecord, 201);
    
  } catch (error) {
    return errorResponse(`Failed to create record: ${error.message}`, 500);
  }
}

// ==========================================
// 🔄 API 핸들러: PUT (전체 수정)
// ==========================================
async function handleUpdateRecord(env, tableName, id, body) {
  try {
    const records = await getAllRecords(env, tableName);
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) {
      return errorResponse('Record not found', 404);
    }
    
    // 전체 교체 (id, created_at 유지)
    const updatedRecord = {
      ...body,
      id: id,
      created_at: records[index].created_at,
      updated_at: getCurrentTimestamp(),
      gs_project_id: 'beautycat',
      gs_table_name: tableName
    };
    
    records[index] = updatedRecord;
    await saveAllRecords(env, tableName, records);
    
    return jsonResponse(updatedRecord);
    
  } catch (error) {
    return errorResponse(`Failed to update record: ${error.message}`, 500);
  }
}

// ==========================================
// 🔄 API 핸들러: PATCH (부분 수정)
// ==========================================
async function handlePatchRecord(env, tableName, id, body) {
  try {
    const records = await getAllRecords(env, tableName);
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) {
      return errorResponse('Record not found', 404);
    }
    
    // 부분 병합
    const updatedRecord = {
      ...records[index],
      ...body,
      id: id,
      created_at: records[index].created_at,
      updated_at: getCurrentTimestamp()
    };
    
    records[index] = updatedRecord;
    await saveAllRecords(env, tableName, records);
    
    return jsonResponse(updatedRecord);
    
  } catch (error) {
    return errorResponse(`Failed to patch record: ${error.message}`, 500);
  }
}

// ==========================================
// 🗑️ API 핸들러: DELETE (삭제)
// ==========================================
async function handleDeleteRecord(env, tableName, id) {
  try {
    const records = await getAllRecords(env, tableName);
    const index = records.findIndex(r => r.id === id);
    
    if (index === -1) {
      return errorResponse('Record not found', 404);
    }
    
    // Soft delete (deleted 플래그 설정)
    records[index].deleted = true;
    records[index].updated_at = getCurrentTimestamp();
    
    await saveAllRecords(env, tableName, records);
    
    return new Response(null, { 
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
    
  } catch (error) {
    return errorResponse(`Failed to delete record: ${error.message}`, 500);
  }
}

// ==========================================
// 🌐 메인 요청 핸들러
// ==========================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    // CORS Preflight 처리
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    
    // 라우팅
    const apiPrefix = '/api/tables/';
    
    if (!path.startsWith(apiPrefix)) {
      return errorResponse('Invalid API endpoint', 404);
    }
    
    // 경로 파싱: /api/tables/{table}/{id?}
    const pathParts = path.slice(apiPrefix.length).split('/').filter(Boolean);
    const tableName = pathParts[0];
    const recordId = pathParts[1];
    
    // 테이블명 검증
    if (!SCHEMAS[tableName]) {
      return errorResponse(`Unknown table: ${tableName}`, 400);
    }
    
    try {
      // 메서드별 라우팅
      switch (method) {
        case 'GET':
          if (recordId) {
            return await handleGetRecord(env, tableName, recordId);
          } else {
            return await handleGetRecords(env, tableName, url.toString());
          }
          
        case 'POST':
          const createBody = await request.json();
          return await handleCreateRecord(env, tableName, createBody);
          
        case 'PUT':
          if (!recordId) {
            return errorResponse('Record ID required for PUT', 400);
          }
          const updateBody = await request.json();
          return await handleUpdateRecord(env, tableName, recordId, updateBody);
          
        case 'PATCH':
          if (!recordId) {
            return errorResponse('Record ID required for PATCH', 400);
          }
          const patchBody = await request.json();
          return await handlePatchRecord(env, tableName, recordId, patchBody);
          
        case 'DELETE':
          if (!recordId) {
            return errorResponse('Record ID required for DELETE', 400);
          }
          return await handleDeleteRecord(env, tableName, recordId);
          
        default:
          return errorResponse(`Method ${method} not allowed`, 405);
      }
      
    } catch (error) {
      console.error('API Error:', error);
      return errorResponse(`Internal server error: ${error.message}`, 500);
    }
  }
};
