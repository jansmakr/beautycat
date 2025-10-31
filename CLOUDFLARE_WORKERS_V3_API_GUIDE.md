# Cloudflare Workers API v3 - 완전한 CRUD API 가이드

## 📋 개요

BeautyCat Cloudflare Workers API v3는 **완전한 RESTful CRUD 작업**을 지원합니다.

### ✅ 지원되는 HTTP 메서드
- **GET** - 데이터 조회
- **POST** - 신규 생성
- **PUT** - 전체 수정
- **PATCH** - 부분 수정
- **DELETE** - 삭제 (soft delete)

---

## 🚀 API 엔드포인트

### Base URL
```
https://your-worker.your-subdomain.workers.dev/api
```

### 엔드포인트 목록
- `/api/tables/users` - 사용자 (GET만 지원)
- `/api/tables/skincare_shops` - 피부관리실 (GET만 지원)
- `/api/tables/consultations` - 상담 요청 (전체 CRUD)
- `/api/tables/quotes` - 견적서 (전체 CRUD)

---

## 📖 상담 요청 (Consultations) API

### 1️⃣ GET - 상담 목록 조회

**요청:**
```javascript
const response = await fetch('https://your-worker.workers.dev/api/tables/consultations');
const data = await response.json();
```

**쿼리 파라미터:**
- `shop_id` - 특정 업체의 상담만 조회
- `status` - 특정 상태의 상담만 조회 (pending, in_progress, completed)

**예시:**
```javascript
// 특정 업체의 대기중인 상담만 조회
const response = await fetch(
  'https://your-worker.workers.dev/api/tables/consultations?shop_id=user_shop_001&status=pending'
);
```

**응답:**
```json
{
  "data": [
    {
      "id": "consult_001",
      "customer_id": "user_customer_001",
      "customer_name": "김지연",
      "shop_id": "user_shop_001",
      "treatment_type": "여드름 집중 관리",
      "status": "pending",
      "deleted": false,
      "created_at": 1738234567890,
      "updated_at": 1738234567890
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 100,
  "table": "consultations"
}
```

---

### 2️⃣ GET - 단일 상담 조회

**요청:**
```javascript
const consultId = 'consult_001';
const response = await fetch(`https://your-worker.workers.dev/api/tables/consultations/${consultId}`);
const consultation = await response.json();
```

**응답:** 단일 상담 객체

---

### 3️⃣ POST - 상담 신규 생성

**요청:**
```javascript
const newConsultation = {
  customer_id: 'user_customer_001',
  customer_name: '김지연',
  customer_phone: '010-1234-5678',
  shop_id: 'user_shop_001',
  shop_name: '강남 피부관리실',
  treatment_type: '여드름 집중 관리',
  skin_type: '복합성',
  concern: '여드름과 홍조',
  description: '관리 받고 싶습니다',
  preferred_date: '2025-02-15',
  preferred_time: '오후 2시',
  budget: '100000-150000',
  status: 'pending'
};

const response = await fetch('https://your-worker.workers.dev/api/tables/consultations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newConsultation)
});

const created = await response.json();
```

**필수 필드:**
- `customer_id`
- `shop_id`
- `treatment_type`

**응답:** HTTP 201 Created + 생성된 상담 객체 (시스템 필드 포함)

---

### 4️⃣ PUT - 상담 전체 수정

**요청:**
```javascript
const consultId = 'consult_001';
const updatedData = {
  customer_id: 'user_customer_001',
  customer_name: '김지연',
  customer_phone: '010-1234-5678',
  shop_id: 'user_shop_001',
  shop_name: '강남 피부관리실',
  treatment_type: '여드름 + 미백 관리',  // 변경됨
  skin_type: '복합성',
  concern: '여드름, 홍조, 기미',  // 변경됨
  description: '종합 관리 받고 싶습니다',  // 변경됨
  preferred_date: '2025-02-20',  // 변경됨
  preferred_time: '오후 3시',  // 변경됨
  budget: '150000-200000',  // 변경됨
  status: 'in_progress'  // 변경됨
};

const response = await fetch(`https://your-worker.workers.dev/api/tables/consultations/${consultId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updatedData)
});

const updated = await response.json();
```

**주의:** PUT은 **모든 필드를 포함**해야 합니다. 누락된 필드는 사라집니다.

---

### 5️⃣ PATCH - 상담 부분 수정

**요청:**
```javascript
const consultId = 'consult_001';
const partialUpdate = {
  status: 'completed'  // status만 변경
};

const response = await fetch(`https://your-worker.workers.dev/api/tables/consultations/${consultId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(partialUpdate)
});

const updated = await response.json();
```

**장점:** 변경하고 싶은 필드만 보내면 됩니다.

**일반적인 사용 사례:**
```javascript
// 상태만 변경
{ status: 'in_progress' }

// 날짜/시간만 변경
{ preferred_date: '2025-03-01', preferred_time: '오전 10시' }

// 여러 필드 동시 변경
{ status: 'completed', concern: '개선됨' }
```

---

### 6️⃣ DELETE - 상담 삭제

**요청:**
```javascript
const consultId = 'consult_001';
const response = await fetch(`https://your-worker.workers.dev/api/tables/consultations/${consultId}`, {
  method: 'DELETE'
});

// 응답: HTTP 204 No Content
```

**주의:** Soft Delete이므로 데이터가 실제로 삭제되지 않고 `deleted: true`로 표시됩니다.

---

## 💰 견적서 (Quotes) API

### 1️⃣ GET - 견적서 목록 조회

**요청:**
```javascript
const response = await fetch('https://your-worker.workers.dev/api/tables/quotes');
const data = await response.json();
```

**쿼리 파라미터:**
- `shop_id` - 특정 업체의 견적서만 조회
- `status` - 특정 상태의 견적서만 조회 (pending, accepted, rejected, completed)

---

### 2️⃣ GET - 단일 견적서 조회

**요청:**
```javascript
const quoteId = 'quote_001';
const response = await fetch(`https://your-worker.workers.dev/api/tables/quotes/${quoteId}`);
const quote = await response.json();
```

---

### 3️⃣ POST - 견적서 신규 생성

**요청:**
```javascript
const newQuote = {
  consultation_id: 'consult_001',
  customer_id: 'user_customer_001',
  customer_name: '김지연',
  shop_id: 'user_shop_001',
  shop_name: '강남 피부관리실',
  treatment_type: '여드름 집중 관리',
  description: '여드름 압출 + 진정 관리 + LED 테라피',
  price: 120000,
  duration: '90분',
  available_dates: '월-금 오전/오후',
  additional_notes: '신규 고객 10% 할인',
  status: 'pending',
  valid_until: Date.now() + 604800000  // 7일 후
};

const response = await fetch('https://your-worker.workers.dev/api/tables/quotes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(newQuote)
});

const created = await response.json();
```

**필수 필드:**
- `consultation_id`
- `customer_id`
- `shop_id`
- `treatment_type`
- `price`

---

### 4️⃣ PUT - 견적서 전체 수정

**요청:**
```javascript
const quoteId = 'quote_001';
const updatedQuote = {
  consultation_id: 'consult_001',
  customer_id: 'user_customer_001',
  customer_name: '김지연',
  shop_id: 'user_shop_001',
  shop_name: '강남 피부관리실',
  treatment_type: '여드름 집중 관리 + 미백',  // 변경
  description: '여드름 압출 + 진정 + LED + 미백팩',  // 변경
  price: 150000,  // 변경
  duration: '120분',  // 변경
  available_dates: '월-금 전시간',
  additional_notes: '패키지 할인 적용',  // 변경
  status: 'pending',
  valid_until: Date.now() + 604800000
};

const response = await fetch(`https://your-worker.workers.dev/api/tables/quotes/${quoteId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(updatedQuote)
});

const updated = await response.json();
```

---

### 5️⃣ PATCH - 견적서 부분 수정

**요청:**
```javascript
const quoteId = 'quote_001';
const partialUpdate = {
  status: 'accepted'  // 고객이 견적서 수락
};

const response = await fetch(`https://your-worker.workers.dev/api/tables/quotes/${quoteId}`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(partialUpdate)
});

const updated = await response.json();
```

**일반적인 사용 사례:**
```javascript
// 상태만 변경
{ status: 'accepted' }
{ status: 'rejected' }
{ status: 'completed' }

// 가격만 변경
{ price: 130000 }

// 여러 필드 동시 변경
{ price: 140000, duration: '100분', additional_notes: '추가 서비스 포함' }
```

---

### 6️⃣ DELETE - 견적서 삭제

**요청:**
```javascript
const quoteId = 'quote_001';
const response = await fetch(`https://your-worker.workers.dev/api/tables/quotes/${quoteId}`, {
  method: 'DELETE'
});

// 응답: HTTP 204 No Content
```

---

## 🔧 시스템 필드

### 자동 생성되는 필드

모든 데이터에는 다음 시스템 필드가 자동으로 추가됩니다:

```javascript
{
  id: 'consult_1738234567890_abc123def',  // 자동 생성
  deleted: false,  // 삭제 상태 (soft delete)
  created_at: 1738234567890,  // 생성 시간 (밀리초)
  updated_at: 1738234567890,  // 수정 시간 (밀리초)
  gs_project_id: 'beautycat',
  gs_table_name: 'consultations'  // or 'quotes'
}
```

### 시스템 필드 규칙

1. **POST (생성)**: 모든 시스템 필드 자동 생성
2. **PUT (전체 수정)**: `created_at`, `id`, `gs_*` 유지, `updated_at` 갱신
3. **PATCH (부분 수정)**: 기존 데이터 유지, `updated_at`만 갱신
4. **DELETE (삭제)**: `deleted: true`, `updated_at` 갱신

---

## ⚠️ 에러 처리

### HTTP 상태 코드

| 코드 | 의미 | 예시 |
|------|------|------|
| 200 | 성공 (GET, PUT, PATCH) | 데이터 조회/수정 성공 |
| 201 | 생성 성공 (POST) | 새 데이터 생성 |
| 204 | 성공 (DELETE) | 삭제 완료 (응답 본문 없음) |
| 400 | 잘못된 요청 | 필수 필드 누락, JSON 파싱 실패 |
| 404 | 찾을 수 없음 | 존재하지 않는 ID |
| 500 | 서버 오류 | 내부 에러 |

### 에러 응답 형식

```json
{
  "error": "Validation Error",
  "message": "Missing required field: customer_id"
}
```

### 프론트엔드 에러 처리 예시

```javascript
async function createConsultation(data) {
  try {
    const response = await fetch('https://your-worker.workers.dev/api/tables/consultations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API 오류');
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('상담 생성 실패:', error);
    alert(`상담 신청 실패: ${error.message}`);
    throw error;
  }
}
```

---

## 🚨 중요 제한사항

### ⚠️ 메모리 기반 저장

현재 v3 API는 **메모리 기반**으로 동작합니다:

- ✅ **장점**: 빠른 구현, 무료
- ❌ **단점**: Workers 재시작 시 데이터 손실
- ⚠️ **주의**: 프로덕션 환경에 부적합

### 🔄 Cloudflare D1 마이그레이션 권장

영구 데이터 저장을 위해 Cloudflare D1 데이터베이스로 마이그레이션하는 것을 강력히 권장합니다.

---

## 📝 프론트엔드 통합 예시

### 상담 신청 (consultation-request.html)

```javascript
async function submitConsultation() {
  const formData = {
    customer_id: currentUser.id,
    customer_name: currentUser.name,
    customer_phone: currentUser.phone,
    shop_id: selectedShop.id,
    shop_name: selectedShop.shop_name,
    treatment_type: document.getElementById('treatment-type').value,
    skin_type: document.getElementById('skin-type').value,
    concern: document.getElementById('concern').value,
    description: document.getElementById('description').value,
    preferred_date: document.getElementById('preferred-date').value,
    preferred_time: document.getElementById('preferred-time').value,
    budget: document.getElementById('budget').value,
    status: 'pending'
  };
  
  try {
    const response = await fetch(`${API_BASE}/tables/consultations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) throw new Error('상담 신청 실패');
    
    const result = await response.json();
    alert('상담 신청이 완료되었습니다!');
    window.location.href = 'customer-dashboard-v2.html';
    
  } catch (error) {
    console.error('Error:', error);
    alert('상담 신청 중 오류가 발생했습니다.');
  }
}
```

### 견적서 상태 변경 (my-quotes.html)

```javascript
async function acceptQuote(quoteId) {
  try {
    const response = await fetch(`${API_BASE}/tables/quotes/${quoteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' })
    });
    
    if (!response.ok) throw new Error('견적서 수락 실패');
    
    alert('견적서를 수락했습니다!');
    loadQuotes();  // 목록 새로고침
    
  } catch (error) {
    console.error('Error:', error);
    alert('견적서 수락 중 오류가 발생했습니다.');
  }
}
```

### 상담 상태 변경 (consultation-detail.html)

```javascript
async function updateConsultationStatus(consultId, newStatus) {
  try {
    const response = await fetch(`${API_BASE}/tables/consultations/${consultId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    
    if (!response.ok) throw new Error('상태 변경 실패');
    
    alert('상태가 변경되었습니다!');
    location.reload();
    
  } catch (error) {
    console.error('Error:', error);
    alert('상태 변경 중 오류가 발생했습니다.');
  }
}
```

---

## 🎯 다음 단계

1. **Cloudflare Workers에 배포**
   - `cloudflare-workers-v3-full-crud.js` 파일을 Cloudflare Workers에 업로드
   - API 엔드포인트 URL 확인

2. **프론트엔드 페이지 업데이트**
   - consultation-request.html
   - consultation-detail.html
   - quote-management.html
   - my-quotes.html

3. **테스트**
   - API 엔드포인트별 기능 테스트
   - 에러 처리 확인

4. **프로덕션 준비** (선택)
   - Cloudflare D1로 마이그레이션
   - 인증/권한 추가
   - Rate limiting 적용

---

## 📞 문의

API 관련 문의사항이 있으시면 언제든지 연락주세요!
