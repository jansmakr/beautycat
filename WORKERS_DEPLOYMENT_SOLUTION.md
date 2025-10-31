# 🔧 BeautyCat Workers 재배포 가이드

**문제**: beautycat-api Workers가 404 오류 발생  
**원인**: Workers 코드가 배포되지 않았거나 손실됨  
**해결**: cloudflare-workers-beautycat.js 코드를 재배포

---

## ✅ Workers 코드 발견!

프로젝트에서 완전한 Workers 코드를 찾았습니다:

**파일**: `cloudflare-workers-beautycat.js` (309줄, 9.7KB)

**주요 기능**:
- ✅ `/api/health` 엔드포인트
- ✅ `/api/tables/{table}` RESTful API
- ✅ D1 데이터베이스 연동 (env.BEAUTYCAT_DB)
- ✅ CORS 헤더 설정
- ✅ GET, POST, PUT, DELETE 지원
- ✅ 페이징, 정렬 기능

---

## 🚀 즉시 재배포 방법 (3가지)

### 방법 1: Cloudflare Dashboard에서 Quick Edit (가장 빠름! ⚡ 2분)

#### 단계:
1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com
   - Workers & Pages 메뉴 클릭

2. **beautycat-api 선택**
   - Workers 목록에서 `beautycat-api` 클릭

3. **Quick Edit 클릭**
   - 오른쪽 상단의 "Quick Edit" 버튼 클릭

4. **코드 복사/붙여넣기**
   - 기존 코드 전체 삭제 (Ctrl+A → Delete)
   - 아래 전체 코드 복사하여 붙여넣기

5. **Save and Deploy 클릭**
   - 하단의 "Save and Deploy" 버튼 클릭
   - 배포 완료 대기 (약 10초)

6. **테스트**
   ```bash
   curl https://beautycat-api.jansmakr.workers.dev/api/health
   ```

---

### 방법 2: Wrangler CLI 사용 (개발자용 ⚙️ 5분)

#### 사전 준비:
```bash
# Node.js 및 npm 설치 필요
npm install -g wrangler
wrangler login
```

#### 배포 단계:
```bash
# 1. wrangler.toml 생성
cat > wrangler.toml << 'EOF'
name = "beautycat-api"
main = "cloudflare-workers-beautycat.js"
compatibility_date = "2024-10-22"

[[d1_databases]]
binding = "BEAUTYCAT_DB"
database_name = "beautycat-db"
database_id = "YOUR_DATABASE_ID"
EOF

# 2. Workers 배포
wrangler deploy

# 3. 테스트
curl https://beautycat-api.jansmakr.workers.dev/api/health
```

**주의**: `YOUR_DATABASE_ID`는 Cloudflare Dashboard의 D1 섹션에서 확인 필요

---

### 방법 3: API로 배포 (자동화용 🤖)

```bash
# Cloudflare API Token 필요
curl -X PUT "https://api.cloudflare.com/client/v4/accounts/YOUR_ACCOUNT_ID/workers/scripts/beautycat-api" \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/javascript" \
  --data-binary "@cloudflare-workers-beautycat.js"
```

---

## 📋 재배포할 Workers 코드

아래 전체 코드를 복사하여 Cloudflare Dashboard의 Quick Edit에 붙여넣으세요:

```javascript
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
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
                // 레코드 업데이트
                const updateData = await request.json();
                return await updateRecord(env, tableName, recordId, updateData, corsHeaders);
                
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
    const countResult = await env.BEAUTYCAT_DB.prepare(\`SELECT COUNT(*) as total FROM \${tableName}\`).first();
    const total = countResult?.total || 0;
    
    const dataResult = await env.BEAUTYCAT_DB.prepare(\`
        SELECT * FROM \${tableName} 
        ORDER BY \${sort} DESC 
        LIMIT ? OFFSET ?
    \`).bind(limit, offset).all();
    
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
    const result = await env.BEAUTYCAT_DB.prepare(\`
        SELECT * FROM \${tableName} WHERE id = ?
    \`).bind(recordId).first();
    
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
    
    const query = \`INSERT INTO \${tableName} (\${fields.join(', ')}) VALUES (\${placeholders})\`;
    
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
    const setClause = fields.map(field => \`\${field} = ?\`).join(', ');
    const values = [...fields.map(field => updateData[field]), recordId];
    
    const query = \`UPDATE \${tableName} SET \${setClause} WHERE id = ?\`;
    
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
    const updatedRecord = await env.BEAUTYCAT_DB.prepare(\`
        SELECT * FROM \${tableName} WHERE id = ?
    \`).bind(recordId).first();
    
    return new Response(JSON.stringify(updatedRecord), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

/**
 * 레코드 삭제 (소프트 삭제)
 */
async function deleteRecord(env, tableName, recordId, corsHeaders) {
    const timestamp = Date.now();
    
    const result = await env.BEAUTYCAT_DB.prepare(\`
        UPDATE \${tableName} SET deleted = 1, updated_at = ? WHERE id = ?
    \`).bind(timestamp, recordId).run();
    
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
            fields: ['id', 'customer_name', 'customer_phone', 'customer_email', 'state', 'district', 'status', 'created_at']
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
```

---

## ✅ 재배포 후 확인 사항

### 1. Health Check 테스트
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/health
```

**예상 응답**:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-31T...",
  "service": "beautycat-api"
}
```

### 2. Root 경로 테스트
```bash
curl https://beautycat-api.jansmakr.workers.dev/
```

**예상 응답**:
```
beautycat API Server - Powered by Cloudflare Workers
```

### 3. Tables API 테스트
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users
```

---

## 🎯 배포 성공 체크리스트

- [ ] Quick Edit에서 코드 붙여넣기 완료
- [ ] "Save and Deploy" 클릭 완료
- [ ] 배포 성공 메시지 확인
- [ ] Health Check 200 OK 응답
- [ ] Root 경로 정상 응답
- [ ] D1 바인딩 정상 작동 확인

---

## 🚨 문제 해결

### 배포 후에도 404가 나온다면?

1. **캐시 초기화**
   ```bash
   curl -H "Cache-Control: no-cache" https://beautycat-api.jansmakr.workers.dev/api/health
   ```

2. **브라우저 시크릿 모드**로 테스트

3. **5분 대기** (전 세계 CDN 배포 시간)

4. **Workers 로그 확인**
   - Cloudflare Dashboard → beautycat-api → Logs → Real-time logs

### D1 바인딩 오류가 나온다면?

**오류 메시지**: `env.BEAUTYCAT_DB is undefined`

**해결**:
1. Workers & Pages → beautycat-api → Settings
2. Variables and Secrets → D1 database bindings 확인
3. `BEAUTYCAT_DB` → `beautycat-db` 바인딩 확인
4. 없다면 "Add binding" 클릭하여 추가

---

## 📊 재배포 후 예상 결과

| 테스트 | 예상 결과 |
|--------|-----------|
| Health Check | ✅ 200 OK |
| Root 경로 | ✅ "beautycat API Server..." |
| Tables API | ✅ JSON 데이터 반환 |
| D1 쿼리 | ✅ 데이터베이스 정상 작동 |

---

## 🎉 다음 단계

재배포가 성공하면:

1. ✅ test-api.html에서 자동 테스트 실행
2. ✅ Frontend에서 API 연동 확인
3. ✅ 실제 데이터 CRUD 테스트
4. ✅ Custom Domain (api.beautycat.kr) 테스트

---

**이 가이드를 따라 재배포한 후, 결과를 공유해주시면 추가 지원해드리겠습니다!** 🚀
