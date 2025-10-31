# 🚀 BeautyCat 상용화 데이터 설정 가이드

**목적**: 사용자, 샵, 상담 등 실제 데이터를 저장하고 관리하기 위한 완전한 가이드  
**현재 상태**: ✅ D1 데이터베이스 준비 완료 (10개 테이블)  
**소요 시간**: 약 10-15분

---

## 📊 현재 데이터 저장 시스템

### ✅ 이미 구축된 것들

```
✅ Cloudflare D1 Database: beautycat-db
✅ 10개 테이블 스키마 설계 완료
✅ Workers API (RESTful CRUD) 배포 완료
✅ D1 바인딩 연결 완료
```

### 📋 사용 가능한 10개 테이블

1. **users** - 사용자 (고객/업체/관리자)
2. **skincare_shops** - 피부관리실 정보
3. **consultations** - 상담 신청
4. **quotes** - 견적서
5. **messages** - 채팅 메시지
6. **representative_shops** - 대표업체
7. **announcements** - 공지사항
8. **reviews** - 리뷰
9. **call_statistics** - 전화상담 통계
10. **user_sessions** - 세션 관리

---

## 🎯 상용화를 위한 3단계

### Step 1: D1 데이터베이스 초기 데이터 설정 (5분)
### Step 2: 프론트엔드 API 연동 (5분)
### Step 3: 실제 데이터 테스트 (5분)

---

## Step 1: D1 데이터베이스 초기 설정

### 방법 A: Cloudflare Dashboard (가장 쉬움! ⚡)

#### 1. D1 데이터베이스 접속
```
1. Cloudflare Dashboard 로그인
2. Storage & Databases → D1
3. beautycat-db 클릭
4. "Console" 탭 클릭
```

#### 2. 초기 데이터 삽입

**관리자 계정 생성** (필수!):
```sql
INSERT INTO users (
    id, email, password, name, user_type, phone, status, 
    email_verified, created_at, updated_at
) VALUES (
    'admin_001',
    'admin@beautycat.kr',
    'beautycat2024!',
    '뷰티캣 관리자',
    'admin',
    '070-7004-5902',
    'active',
    1,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);
```

**샘플 피부관리실 등록** (테스트용):
```sql
INSERT INTO skincare_shops (
    id, name, owner_name, phone, email, 
    address, state, district, 
    description, status,
    created_at, updated_at
) VALUES (
    'shop_001',
    '강남 프리미엄 스킨케어',
    '김미영',
    '02-1234-5678',
    'gangnam@beautycat.kr',
    '서울특별시 강남구 테헤란로 123',
    '서울',
    '강남구',
    '피부관리 전문 케어센터',
    'active',
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);

INSERT INTO skincare_shops (
    id, name, owner_name, phone, email, 
    address, state, district, 
    description, status,
    created_at, updated_at
) VALUES (
    'shop_002',
    '홍대 뷰티클리닉',
    '이지은',
    '02-2345-6789',
    'hongdae@beautycat.kr',
    '서울특별시 마포구 홍익로 45',
    '서울',
    '마포구',
    '젊은 층을 위한 트렌디한 피부관리',
    'active',
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);
```

**대표업체 등록** (전화상담용):
```sql
INSERT INTO representative_shops (
    id, shop_id, shop_name, state, district, phone,
    approved, status, owner_name, address, application_date,
    created_at, updated_at
) VALUES (
    'rep_001',
    'shop_001',
    '강남 프리미엄 스킨케어',
    '서울',
    '강남구',
    '02-1234-5678',
    1,
    'approved',
    '김미영',
    '서울특별시 강남구 테헤란로 123',
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);
```

**웰컴 공지사항**:
```sql
INSERT INTO announcements (
    id, title, content, author_id, author_name, 
    priority, target_audience, is_pinned, is_published, 
    publish_date, created_at, updated_at
) VALUES (
    'announce_001',
    'beautycat 서비스 정식 오픈!',
    '피부관리실 견적 비교 플랫폼 beautycat이 정식 오픈했습니다. 지역별 피부관리실 견적을 한 번에 비교하고 최적의 선택을 하세요!',
    'admin_001',
    '뷰티캣 관리자',
    'high',
    'all',
    1,
    1,
    datetime('now'),
    strftime('%s', 'now') * 1000,
    strftime('%s', 'now') * 1000
);
```

#### 3. 데이터 확인
```sql
-- 사용자 수 확인
SELECT COUNT(*) as user_count FROM users;

-- 등록된 샵 확인
SELECT id, name, state, district, status FROM skincare_shops;

-- 대표업체 확인
SELECT shop_name, phone, state, district FROM representative_shops WHERE status = 'approved';

-- 공지사항 확인
SELECT title, is_published FROM announcements;
```

---

### 방법 B: Wrangler CLI 사용 (개발자용)

```bash
# D1 데이터베이스에 SQL 실행
wrangler d1 execute beautycat-db --file=cloudflare-d1-schema.sql

# 개별 쿼리 실행
wrangler d1 execute beautycat-db --command="SELECT * FROM users"
```

---

## Step 2: 프론트엔드 API 연동

### 📝 JS 파일에서 API 사용하기

#### 기본 설정 (config.js 또는 global-config.js)

```javascript
// API 기본 URL 설정
const API_CONFIG = {
    BASE_URL: 'https://beautycat-api.jansmakr.workers.dev/api',
    // 또는 Custom Domain (DNS 전파 후)
    // BASE_URL: 'https://api.beautycat.kr/api',
    
    TIMEOUT: 10000,
    HEADERS: {
        'Content-Type': 'application/json'
    }
};
```

#### 1. 사용자 회원가입

```javascript
async function registerUser(userData) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/tables/users`, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify({
                email: userData.email,
                password: userData.password, // 실제로는 해시화 필요
                name: userData.name,
                user_type: userData.userType, // 'customer' or 'shop'
                phone: userData.phone,
                status: 'active',
                email_verified: 0,
                created_at: Date.now(),
                updated_at: Date.now()
            })
        });
        
        if (!response.ok) throw new Error('회원가입 실패');
        
        const result = await response.json();
        console.log('회원가입 성공:', result);
        return result;
        
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류가 발생했습니다.');
        return null;
    }
}

// 사용 예시
const newUser = {
    email: 'customer@example.com',
    password: 'password123',
    name: '홍길동',
    userType: 'customer',
    phone: '010-1234-5678'
};

registerUser(newUser);
```

#### 2. 피부관리실 등록

```javascript
async function registerShop(shopData) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/tables/skincare_shops`, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify({
                name: shopData.name,
                owner_name: shopData.ownerName,
                phone: shopData.phone,
                email: shopData.email,
                address: shopData.address,
                state: shopData.state,
                district: shopData.district,
                services: JSON.stringify(shopData.services), // Array → JSON string
                description: shopData.description,
                business_number: shopData.businessNumber,
                status: 'pending', // 관리자 승인 대기
                operating_hours: JSON.stringify(shopData.operatingHours),
                created_at: Date.now(),
                updated_at: Date.now()
            })
        });
        
        if (!response.ok) throw new Error('샵 등록 실패');
        
        const result = await response.json();
        console.log('샵 등록 성공:', result);
        return result;
        
    } catch (error) {
        console.error('샵 등록 오류:', error);
        alert('샵 등록 중 오류가 발생했습니다.');
        return null;
    }
}

// 사용 예시
const newShop = {
    name: '서초 뷰티랩',
    ownerName: '박지영',
    phone: '02-3456-7890',
    email: 'seocho@beautycat.kr',
    address: '서울특별시 서초구 서초대로 100',
    state: '서울',
    district: '서초구',
    services: ['피부관리', '미백관리', '여드름관리'],
    description: '20년 경력의 전문가가 운영하는 피부관리실',
    businessNumber: '123-45-67890',
    operatingHours: {
        mon: '10:00-20:00',
        tue: '10:00-20:00',
        wed: '10:00-20:00',
        thu: '10:00-20:00',
        fri: '10:00-20:00',
        sat: '10:00-18:00',
        sun: 'closed'
    }
};

registerShop(newShop);
```

#### 3. 상담 신청 저장

```javascript
async function submitConsultation(consultationData) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/tables/consultations`, {
            method: 'POST',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify({
                customer_name: consultationData.customerName,
                customer_phone: consultationData.customerPhone,
                customer_email: consultationData.customerEmail,
                state: consultationData.state,
                district: consultationData.district,
                treatment_types: JSON.stringify(consultationData.treatmentTypes),
                skin_concerns: JSON.stringify(consultationData.skinConcerns),
                age_range: consultationData.ageRange,
                budget_range: consultationData.budgetRange,
                preferred_schedule: consultationData.preferredSchedule,
                additional_notes: consultationData.notes,
                status: 'pending',
                submission_date: new Date().toISOString(),
                created_at: Date.now(),
                updated_at: Date.now()
            })
        });
        
        if (!response.ok) throw new Error('상담 신청 실패');
        
        const result = await response.json();
        console.log('상담 신청 성공:', result);
        alert('상담 신청이 완료되었습니다!');
        return result;
        
    } catch (error) {
        console.error('상담 신청 오류:', error);
        alert('상담 신청 중 오류가 발생했습니다.');
        return null;
    }
}

// 사용 예시
const consultation = {
    customerName: '김영희',
    customerPhone: '010-9876-5432',
    customerEmail: 'younghee@example.com',
    state: '서울',
    district: '강남구',
    treatmentTypes: ['피부관리', '미백관리'],
    skinConcerns: ['여드름', '모공'],
    ageRange: '30대',
    budgetRange: '10-30만원',
    preferredSchedule: '평일 오후',
    notes: '민감성 피부입니다'
};

submitConsultation(consultation);
```

#### 4. 데이터 조회

```javascript
// 전체 샵 목록 조회
async function getShops(page = 1, limit = 10) {
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}/tables/skincare_shops?page=${page}&limit=${limit}&sort=created_at`
        );
        
        if (!response.ok) throw new Error('샵 목록 조회 실패');
        
        const result = await response.json();
        console.log('샵 목록:', result.data);
        return result;
        
    } catch (error) {
        console.error('샵 목록 조회 오류:', error);
        return null;
    }
}

// 특정 지역 샵 검색 (서버 쿼리는 현재 미지원, 클라이언트 필터링 필요)
async function getShopsByLocation(state, district) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/tables/skincare_shops?limit=100`);
        
        if (!response.ok) throw new Error('샵 조회 실패');
        
        const result = await response.json();
        
        // 클라이언트 사이드 필터링
        const filteredShops = result.data.filter(shop => 
            shop.state === state && 
            shop.district === district &&
            shop.status === 'active'
        );
        
        console.log(`${state} ${district} 샵 목록:`, filteredShops);
        return filteredShops;
        
    } catch (error) {
        console.error('샵 검색 오류:', error);
        return [];
    }
}

// 사용 예시
getShops(1, 10); // 첫 페이지, 10개씩
getShopsByLocation('서울', '강남구'); // 강남구 샵 검색
```

#### 5. 데이터 수정

```javascript
async function updateShopStatus(shopId, newStatus) {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/tables/skincare_shops/${shopId}`, {
            method: 'PUT',
            headers: API_CONFIG.HEADERS,
            body: JSON.stringify({
                status: newStatus,
                updated_at: Date.now()
            })
        });
        
        if (!response.ok) throw new Error('상태 변경 실패');
        
        const result = await response.json();
        console.log('상태 변경 성공:', result);
        return result;
        
    } catch (error) {
        console.error('상태 변경 오류:', error);
        return null;
    }
}

// 사용 예시
updateShopStatus('shop_001', 'active'); // 샵 승인
```

---

## Step 3: 실제 데이터 테스트

### 테스트 시나리오

#### 1. 브라우저 콘솔에서 직접 테스트

```javascript
// 1. 테스트 사용자 생성
fetch('https://beautycat-api.jansmakr.workers.dev/api/tables/users', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
        email: 'test@beautycat.kr',
        password: 'test1234',
        name: '테스트 사용자',
        user_type: 'customer',
        phone: '010-0000-0000',
        status: 'active',
        created_at: Date.now(),
        updated_at: Date.now()
    })
})
.then(r => r.json())
.then(data => console.log('사용자 생성:', data));

// 2. 사용자 목록 조회
fetch('https://beautycat-api.jansmakr.workers.dev/api/tables/users')
.then(r => r.json())
.then(data => console.log('사용자 목록:', data));

// 3. 샵 목록 조회
fetch('https://beautycat-api.jansmakr.workers.dev/api/tables/skincare_shops')
.then(r => r.json())
.then(data => console.log('샵 목록:', data));
```

---

## 🔐 보안 고려사항

### 즉시 구현해야 할 것

#### 1. 비밀번호 해싱
```javascript
// 프론트엔드에서 비밀번호 해싱 (SHA-256)
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// 사용
const hashedPassword = await hashPassword('user_password');
```

#### 2. 입력값 검증
```javascript
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^010-\d{4}-\d{4}$/;
    return re.test(phone);
}

// 사용
if (!validateEmail(userData.email)) {
    alert('유효한 이메일을 입력해주세요');
    return;
}
```

#### 3. XSS 방지
```javascript
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// 사용
const safeName = sanitizeInput(userInput.name);
```

---

## 📊 데이터 구조 예시

### Users 테이블
```json
{
  "id": "user_1730368800000_abc123",
  "email": "customer@example.com",
  "password": "hashed_password_here",
  "name": "홍길동",
  "user_type": "customer",
  "phone": "010-1234-5678",
  "status": "active",
  "created_at": 1730368800000,
  "updated_at": 1730368800000
}
```

### Skincare Shops 테이블
```json
{
  "id": "shop_1730368800000_xyz789",
  "name": "강남 프리미엄 스킨케어",
  "owner_name": "김미영",
  "phone": "02-1234-5678",
  "email": "shop@example.com",
  "address": "서울특별시 강남구 테헤란로 123",
  "state": "서울",
  "district": "강남구",
  "services": "[\"피부관리\",\"미백관리\"]",
  "description": "전문 피부관리실",
  "status": "active",
  "created_at": 1730368800000,
  "updated_at": 1730368800000
}
```

### Consultations 테이블
```json
{
  "id": "consult_1730368800000_def456",
  "customer_name": "김영희",
  "customer_phone": "010-9876-5432",
  "customer_email": "customer@example.com",
  "state": "서울",
  "district": "강남구",
  "treatment_types": "[\"피부관리\",\"미백관리\"]",
  "skin_concerns": "[\"여드름\",\"모공\"]",
  "age_range": "30대",
  "budget_range": "10-30만원",
  "status": "pending",
  "created_at": 1730368800000,
  "updated_at": 1730368800000
}
```

---

## ✅ 상용화 체크리스트

### 데이터베이스 설정
- [ ] D1 데이터베이스 초기 데이터 삽입 완료
- [ ] 관리자 계정 생성 완료
- [ ] 샘플 샵 2-3개 등록 완료
- [ ] 공지사항 등록 완료

### API 연동
- [ ] API 기본 URL 설정 완료
- [ ] 회원가입 기능 연동
- [ ] 샵 등록 기능 연동
- [ ] 상담 신청 기능 연동
- [ ] 데이터 조회 기능 테스트

### 보안
- [ ] 비밀번호 해싱 구현
- [ ] 입력값 검증 추가
- [ ] XSS 방지 처리

### 테스트
- [ ] 테스트 사용자로 회원가입
- [ ] 테스트 상담 신청
- [ ] 데이터 조회 확인
- [ ] 관리자 대시보드에서 데이터 확인

---

## 🚀 다음 단계

1. ✅ **즉시**: D1 Console에서 초기 데이터 삽입
2. ✅ **5분 후**: 프론트엔드에서 API 호출 테스트
3. ✅ **10분 후**: 실제 회원가입/샵등록 테스트
4. ✅ **준비 완료**: 베타 테스트 시작!

---

**질문이 있으시면 언제든지 물어보세요!** 😊

다음 문서: `PRODUCTION_FRONTEND_INTEGRATION.md` (프론트엔드 완전 통합 가이드)
