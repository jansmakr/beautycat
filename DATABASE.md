# 📊 Beautyket 데이터베이스 구조 문서

**버전**: v2.8.8.1.61  
**작성일**: 2026-01-18  
**상용화 지원**: ✅ 장기 운영 가능

---

## 🎯 개요

Beautyket은 **RESTful Table API**를 사용하여 데이터를 저장하고 관리합니다.  
모든 데이터는 **영구 저장**되며, API를 통해 안전하게 접근할 수 있습니다.

### 📌 핵심 특징
- ✅ **영구 데이터 저장**: 모든 데이터는 서버에 안전하게 저장됩니다
- ✅ **RESTful API**: 표준 HTTP 메서드 (GET, POST, PUT, PATCH, DELETE)
- ✅ **자동 필드**: id, created_at, updated_at 자동 생성
- ✅ **Soft Delete**: 삭제 시 deleted=true 플래그 설정
- ✅ **페이지네이션**: 대량 데이터 효율적 조회
- ✅ **검색 지원**: search 파라미터로 데이터 검색

---

## 📁 데이터베이스 구조

### 전체 테이블 목록 (7개)

| 테이블명 | 설명 | 레코드 수 | 상태 |
|---------|------|-----------|------|
| **users** | 사용자 (고객 + 샵 오너 + 관리자) | 5+ | ✅ 운영중 |
| **skincare_shops** | 피부관리샵 정보 | 3+ | ✅ 운영중 |
| **announcements** | 전체 공지사항 | 3+ | ✅ 운영중 |
| **representative_shops** | 지역 대표샵 | 3+ | ✅ 운영중 |
| **shop_announcements** | 샵별 공지사항 | 0 | ✅ 준비됨 |
| **bookings** | 예약 관리 | 0 | ✅ 준비됨 |
| **reviews** | 리뷰 관리 | 0 | ✅ 준비됨 |

---

## 📋 테이블 상세 스키마

### 1️⃣ users (사용자)

**용도**: 고객, 샵 오너, 관리자 계정 관리

| 필드명 | 타입 | 필수 | 설명 | 제약조건 |
|--------|------|------|------|----------|
| id | text | ✅ | 사용자 고유 ID (UUID) | PRIMARY KEY |
| email | text | ✅ | 이메일 (로그인 ID) | UNIQUE |
| password | text | ✅ | 비밀번호 (해시) | - |
| name | text | ✅ | 사용자 이름 | - |
| phone | text | ❌ | 전화번호 | - |
| user_type | text | ✅ | 사용자 유형 | customer, shop_owner, admin |
| shop_id | text | ❌ | 연결된 샵 ID | FK: skincare_shops.id |
| profile_image | text | ❌ | 프로필 이미지 URL | - |
| social_provider | text | ❌ | 소셜 로그인 제공자 | kakao, naver, google |
| social_id | text | ❌ | 소셜 로그인 ID | - |
| is_verified | bool | ❌ | 이메일 인증 여부 | default: false |
| is_active | bool | ❌ | 계정 활성화 여부 | default: true |
| last_login | datetime | ❌ | 마지막 로그인 시간 | - |
| metadata | text | ❌ | 추가 메타데이터 (JSON) | - |

**샘플 데이터**:
```json
{
  "email": "customer1@example.com",
  "name": "김민지",
  "user_type": "customer",
  "social_provider": "kakao",
  "is_verified": true,
  "is_active": true
}
```

---

### 2️⃣ skincare_shops (피부관리샵)

**용도**: 피부관리샵 정보 및 운영 관리

| 필드명 | 타입 | 필수 | 설명 | 제약조건 |
|--------|------|------|------|----------|
| id | text | ✅ | 샵 고유 ID (UUID) | PRIMARY KEY |
| shop_name | text | ✅ | 샵 이름 | - |
| email | text | ✅ | 오너 이메일 | - |
| owner_name | text | ✅ | 오너 이름 | - |
| phone | text | ✅ | 오너 전화번호 | - |
| business_number | text | ❌ | 사업자등록번호 | - |
| address | text | ✅ | 주소 (전체) | - |
| state | text | ✅ | 시/도 | 서울, 경기, 부산 등 |
| district | text | ✅ | 시/군/구 | 강남구, 수원시 등 |
| detailed_address | text | ❌ | 상세 주소 | - |
| postal_code | text | ❌ | 우편번호 | - |
| latitude | number | ❌ | 위도 | - |
| longitude | number | ❌ | 경도 | - |
| description | rich_text | ❌ | 샵 소개 | - |
| images | array | ❌ | 샵 이미지 URL 목록 | - |
| business_hours | text | ❌ | 영업 시간 (JSON) | - |
| services | array | ✅ | 제공 서비스 목록 | - |
| price_min | number | ❌ | 가격 범위 최소 | - |
| price_max | number | ❌ | 가격 범위 최대 | - |
| rating | number | ❌ | 평점 (0-5) | default: 0 |
| review_count | number | ❌ | 리뷰 수 | default: 0 |
| is_verified | bool | ❌ | 인증 여부 | default: false |
| is_representative | bool | ❌ | 대표샵 여부 | default: false |
| status | text | ✅ | 상태 | active, inactive, pending, suspended |
| website_url | text | ❌ | 웹사이트 URL | - |
| instagram_url | text | ❌ | 인스타그램 URL | - |
| kakaotalk_url | text | ❌ | 카카오톡 채널 URL | - |
| blog_url | text | ❌ | 블로그 URL | - |
| special_offers | text | ❌ | 특별 혜택/할인 정보 | - |
| metadata | text | ❌ | 추가 메타데이터 (JSON) | - |

**샘플 데이터**:
```json
{
  "shop_name": "비씨티 강남점",
  "state": "서울",
  "district": "강남구",
  "rating": 4.8,
  "review_count": 127,
  "services": ["피부관리", "딥클렌징", "마사지"],
  "status": "active",
  "is_verified": true
}
```

---

### 3️⃣ announcements (공지사항)

**용도**: 플랫폼 전체 공지사항 관리

| 필드명 | 타입 | 필수 | 설명 | 제약조건 |
|--------|------|------|------|----------|
| id | text | ✅ | 공지 고유 ID (UUID) | PRIMARY KEY |
| title | text | ✅ | 공지 제목 | - |
| content | rich_text | ✅ | 공지 내용 | HTML 지원 |
| category | text | ✅ | 카테고리 | 일반공지, 이벤트, 시스템, 업데이트, 긴급 |
| priority | text | ✅ | 중요도 | low, medium, high, urgent |
| type | text | ✅ | 공지 유형 | banner, modal, inline |
| status | text | ✅ | 게시 상태 | draft, published, archived |
| start_date | datetime | ❌ | 게시 시작일 | - |
| end_date | datetime | ❌ | 게시 종료일 | - |
| author_id | text | ❌ | 작성자 ID | FK: users.id |
| author_name | text | ❌ | 작성자 이름 | - |
| image_url | text | ❌ | 첨부 이미지 URL | - |
| link_url | text | ❌ | 링크 URL | - |
| view_count | number | ❌ | 조회수 | default: 0 |
| is_pinned | bool | ❌ | 상단 고정 여부 | default: false |
| show_popup | bool | ❌ | 팝업 표시 여부 | default: false |
| metadata | text | ❌ | 메타데이터 (JSON) | - |

**샘플 데이터**:
```json
{
  "title": "신규 회원 첫 시술 20% 할인 이벤트",
  "category": "이벤트",
  "priority": "high",
  "type": "banner",
  "status": "published",
  "is_pinned": true,
  "view_count": 1247
}
```

---

### 4️⃣ representative_shops (지역 대표샵)

**용도**: 지역별 대표 피부관리샵 선정 및 노출

| 필드명 | 타입 | 필수 | 설명 | 제약조건 |
|--------|------|------|------|----------|
| id | text | ✅ | 대표샵 고유 ID | PRIMARY KEY |
| shop_id | text | ✅ | 샵 ID | FK: skincare_shops.id |
| shop_name | text | ✅ | 샵 이름 | - |
| state | text | ✅ | 시/도 | - |
| district | text | ✅ | 시/군/구 | - |
| address | text | ✅ | 주소 | - |
| phone | text | ✅ | 전화번호 | - |
| rating | number | ❌ | 평점 | - |
| review_count | number | ❌ | 리뷰 수 | - |
| image_url | text | ❌ | 대표 이미지 URL | - |
| is_public_data | bool | ❌ | 공공 데이터 여부 | default: false |
| is_verified | bool | ❌ | 인증 여부 | default: false |
| display_order | number | ❌ | 표시 순서 | 0-100 |
| status | text | ✅ | 상태 | active, inactive |
| metadata | text | ❌ | 메타데이터 (JSON) | - |

---

### 5️⃣ bookings (예약)

**용도**: 고객 예약 관리

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| id | text | ✅ | 예약 고유 ID |
| customer_id | text | ✅ | 고객 ID (FK: users.id) |
| shop_id | text | ✅ | 샵 ID (FK: skincare_shops.id) |
| service_name | text | ✅ | 서비스 이름 |
| booking_date | datetime | ✅ | 예약 날짜 |
| booking_time | text | ✅ | 예약 시간 |
| duration_minutes | number | ✅ | 소요 시간 (분) |
| price | number | ✅ | 가격 |
| status | text | ✅ | 상태 (pending, confirmed, completed, cancelled, no_show) |
| payment_status | text | ✅ | 결제 상태 (unpaid, paid, refunded, partial_refund) |
| payment_method | text | ❌ | 결제 방법 (card, cash, transfer, kakaopay, naverpay) |

---

### 6️⃣ reviews (리뷰)

**용도**: 샵 리뷰 및 평가 관리

| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| id | text | ✅ | 리뷰 고유 ID |
| booking_id | text | ✅ | 예약 ID (FK: bookings.id) |
| shop_id | text | ✅ | 샵 ID (FK: skincare_shops.id) |
| customer_id | text | ✅ | 고객 ID (FK: users.id) |
| rating | number | ✅ | 평점 (1-5) |
| content | rich_text | ✅ | 리뷰 내용 |
| images | array | ❌ | 리뷰 이미지 URL 목록 |
| service_rating | number | ❌ | 서비스 평가 (1-5) |
| cleanliness_rating | number | ❌ | 청결도 평가 (1-5) |
| kindness_rating | number | ❌ | 친절도 평가 (1-5) |
| value_rating | number | ❌ | 가성비 평가 (1-5) |
| status | text | ✅ | 상태 (pending, approved, rejected, reported) |

---

## 🔌 RESTful API 사용법

### API 엔드포인트

모든 API는 **상대 경로**로 사용합니다:

```javascript
// ✅ 올바른 사용법
fetch('tables/users?limit=10')
fetch('/tables/skincare_shops')

// ❌ 잘못된 사용법
fetch('https://api.beautycat.kr/api/tables/users')
```

---

### 1️⃣ 데이터 조회 (GET)

#### 전체 목록 조회 (페이지네이션)
```javascript
// users 테이블 조회
const response = await fetch('tables/users?page=1&limit=10');
const data = await response.json();

console.log(data);
// {
//   data: [...],
//   total: 100,
//   page: 1,
//   limit: 10,
//   table: 'users',
//   schema: {...}
// }
```

#### 검색
```javascript
// 이메일로 사용자 검색
const response = await fetch('tables/users?search=customer1@example.com');
const data = await response.json();
```

#### 정렬
```javascript
// 생성일 기준 정렬 (내림차순)
const response = await fetch('tables/users?sort=-created_at');

// 평점 기준 정렬 (오름차순)
const response = await fetch('tables/skincare_shops?sort=rating');
```

#### 단일 레코드 조회
```javascript
const response = await fetch('tables/users/USER_ID');
const user = await response.json();
```

---

### 2️⃣ 데이터 생성 (POST)

```javascript
// 새 사용자 생성
const response = await fetch('tables/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'newuser@example.com',
    password: 'hashed_password',
    name: '홍길동',
    user_type: 'customer',
    is_verified: false,
    is_active: true
  })
});

const newUser = await response.json();
console.log('생성된 ID:', newUser.id);
```

---

### 3️⃣ 데이터 수정 (PUT / PATCH)

#### 전체 업데이트 (PUT)
```javascript
const response = await fetch('tables/users/USER_ID', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'updated@example.com',
    name: '홍길동',
    // 모든 필드 포함
  })
});
```

#### 부분 업데이트 (PATCH)
```javascript
const response = await fetch('tables/users/USER_ID', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    last_login: new Date().toISOString(),
    is_verified: true
  })
});
```

---

### 4️⃣ 데이터 삭제 (DELETE)

```javascript
// Soft Delete (deleted=true 플래그 설정)
const response = await fetch('tables/users/USER_ID', {
  method: 'DELETE'
});

// 응답: HTTP 204 No Content
```

---

## 📊 데이터 사용 예제

### 예제 1: 사용자 로그인
```javascript
async function login(email, password) {
  // 1. 이메일로 사용자 검색
  const response = await fetch(`tables/users?search=${encodeURIComponent(email)}`);
  const data = await response.json();
  
  if (data.data.length === 0) {
    throw new Error('사용자를 찾을 수 없습니다');
  }
  
  const user = data.data[0];
  
  // 2. 비밀번호 확인 (실제로는 서버에서 검증)
  // if (user.password !== hashedPassword) { ... }
  
  // 3. 마지막 로그인 시간 업데이트
  await fetch(`/tables/users/${user.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      last_login: new Date().toISOString()
    })
  });
  
  return user;
}
```

### 예제 2: 피부관리샵 목록 조회
```javascript
async function getShops(state, district) {
  const params = new URLSearchParams({
    limit: 20,
    sort: '-rating'
  });
  
  if (state) params.append('search', state);
  
  const response = await fetch(`tables/skincare_shops?${params}`);
  const data = await response.json();
  
  return data.data;
}
```

### 예제 3: 예약 생성
```javascript
async function createBooking(bookingData) {
  const response = await fetch('tables/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customer_id: bookingData.customerId,
      shop_id: bookingData.shopId,
      service_name: bookingData.serviceName,
      booking_date: bookingData.bookingDate,
      booking_time: bookingData.bookingTime,
      duration_minutes: bookingData.duration,
      price: bookingData.price,
      status: 'pending',
      payment_status: 'unpaid'
    })
  });
  
  const newBooking = await response.json();
  return newBooking;
}
```

---

## 💾 데이터 백업 및 복구

### 백업 방법

#### 1️⃣ 자동 백업 (권장)
모든 데이터는 자동으로 백업됩니다. 별도 설정 불필요.

#### 2️⃣ 수동 백업
```javascript
// 전체 테이블 데이터 내보내기
async function backupTable(tableName) {
  const response = await fetch(`tables/${tableName}?limit=10000`);
  const data = await response.json();
  
  // JSON 파일로 저장
  const blob = new Blob([JSON.stringify(data, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${tableName}_backup_${Date.now()}.json`;
  a.click();
}

// 사용 예
backupTable('users');
backupTable('skincare_shops');
```

### 복구 방법

```javascript
// JSON 파일에서 데이터 복구
async function restoreTable(tableName, backupData) {
  for (const record of backupData.data) {
    await fetch(`tables/${tableName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record)
    });
  }
}
```

---

## 🔒 보안 고려사항

### 1️⃣ 비밀번호 보안
- ✅ **절대 평문 저장 금지**
- ✅ bcrypt 등으로 해싱 후 저장
- ✅ 최소 8자 이상, 영문+숫자+특수문자 조합

```javascript
// ❌ 잘못된 예
password: '1234'

// ✅ 올바른 예
password: '$2b$10$ABC123...' // bcrypt 해시
```

### 2️⃣ 개인정보 보호
- 민감 정보는 암호화 저장
- API 응답 시 비밀번호 등 민감 정보 제외

### 3️⃣ SQL Injection 방지
- RESTful API는 자동으로 SQL Injection 방지
- 사용자 입력값 검증 필수

---

## 📈 성능 최적화

### 1️⃣ 페이지네이션 사용
```javascript
// ❌ 잘못된 예: 전체 데이터 조회
fetch('tables/users')

// ✅ 올바른 예: 페이지네이션
fetch('tables/users?page=1&limit=20')
```

### 2️⃣ 필요한 필드만 조회
```javascript
// 전체 조회 후 클라이언트에서 필터링
const data = await fetch('tables/users?limit=100');
const filtered = data.data.filter(u => u.is_active);
```

### 3️⃣ 캐싱 활용
```javascript
// 자주 사용되는 데이터는 로컬 캐싱
const CACHE_KEY = 'skincare_shops';
const CACHE_DURATION = 5 * 60 * 1000; // 5분

async function getCachedShops() {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const response = await fetch('tables/skincare_shops?limit=100');
  const data = await response.json();
  
  localStorage.setItem(CACHE_KEY, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
}
```

---

## 🚀 운영 가이드

### 데이터 정합성 체크
```javascript
// 정기적으로 데이터 정합성 확인
async function checkDataIntegrity() {
  // 1. 사용자-샵 연결 확인
  const users = await fetch('tables/users?limit=1000');
  const shops = await fetch('tables/skincare_shops?limit=1000');
  
  // 2. 리뷰-예약 연결 확인
  const reviews = await fetch('tables/reviews?limit=1000');
  const bookings = await fetch('tables/bookings?limit=1000');
  
  // 3. 고아 레코드(orphan records) 확인
  // ...
}
```

### 정기 유지보수
- **매일**: 데이터 백업
- **매주**: 성능 모니터링
- **매월**: 데이터 정합성 체크
- **분기별**: 불필요한 데이터 아카이빙

---

## 🎯 체크리스트

### 개발 시작 전
- [ ] 테이블 스키마 확인
- [ ] API 엔드포인트 이해
- [ ] 샘플 데이터 확인

### 배포 전
- [ ] 모든 테이블 생성 완료
- [ ] 샘플 데이터 추가
- [ ] API 연동 테스트 완료
- [ ] 에러 핸들링 구현

### 운영 중
- [ ] 정기 백업 설정
- [ ] 성능 모니터링
- [ ] 보안 업데이트
- [ ] 사용자 피드백 반영

---

## 📞 문의 및 지원

데이터베이스 관련 문의사항은 개발팀에게 연락해주세요.

**Beautyket 데이터베이스 - 안정적이고 확장 가능한 구조** 🚀
