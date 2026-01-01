# 통합 테스트 가이드 v2.8.13.6.123

## 📅 작성 일시
**2025-12-31**

---

## 🎯 테스트 목적

리뷰 시스템과 공공 데이터 자동 매칭의 **전체 플로우**를 심층 검증하여 오류 없는 배포를 보장합니다.

---

## 🔍 발견된 문제 및 수정 사항

### 1. ✅ 리뷰 필터링 개선 (중요도: 높음)

#### 문제
```javascript
// customer-dashboard.js (수정 전)
const response = await fetch(`tables/reviews?search=${encodeURIComponent(currentUser.id)}&limit=100`);
```

- `search` 파라미터는 **모든 텍스트 필드**를 검색
- `customer_id`만 정확하게 필터링하지 못함
- 다른 사용자의 리뷰가 포함될 수 있음

#### 해결
```javascript
// customer-dashboard.js (수정 후)
const response = await fetch(`tables/reviews?limit=1000`);
const reviewsData = await response.json();
// customer_id로 필터링
const myReviews = (reviewsData.data || []).filter(r => r.customer_id === currentUser.id);
const existingReviewQuoteIds = myReviews.map(r => r.quote_id).filter(Boolean);
```

**적용 위치**: 
- Line 995-997: `loadPendingReviews()` 함수
- Line 1033-1035: `loadMyReviews()` 함수

---

### 2. ✅ 에러 핸들링 강화 (중요도: 높음)

#### 문제
```javascript
// customer-dashboard.js (수정 전)
if (response.ok) {
    showNotification('리뷰가 성공적으로 작성되었습니다!', 'success');
} else {
    throw new Error('리뷰 저장 실패'); // 🔴 상세 정보 없음
}
```

#### 해결
```javascript
// customer-dashboard.js (수정 후)
if (response.ok) {
    const result = await response.json();
    console.log('✅ 리뷰 저장 성공:', result);
    showNotification('리뷰가 성공적으로 작성되었습니다!', 'success');
} else {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ 리뷰 저장 실패:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
    });
    throw new Error(`리뷰 저장 실패 (${response.status}): ${errorData.message || response.statusText}`);
}
```

**적용 위치**: Line 1206-1221 (`submitReview()` 함수)

---

### 3. ✅ 회원가입 시 자동 매칭 제거 (중요도: 중간)

#### 문제
```javascript
// auth.js (수정 전)
// 🔍 공공데이터 자동 매칭 시도
if (typeof autoMatchPublicDataShop === 'function') {
    const matchResult = await autoMatchPublicDataShop({...});
}
```

- `autoMatchPublicDataShop` 함수가 `representative_shops` 테이블 사용 (❌ 잘못된 테이블)
- `public_skincare_data` 테이블을 사용해야 함
- 회원가입 시 샵 정보가 불완전할 수 있음

#### 해결
```javascript
// auth.js (수정 후)
// 💡 자동 매칭은 관리자 승인 시에만 수행됨 (admin-dashboard.js의 approveShop 함수)
// 이유: 
// 1. 샵 정보가 완전하지 않을 수 있음 (pending 상태)
// 2. 관리자가 샵 정보를 검증한 후 매칭하는 것이 더 정확
// 3. 중복 매칭 방지
console.log('ℹ️ 자동 매칭은 관리자 승인 시 수행됩니다.');
```

**적용 위치**: Line 881-909 (`auth.js` 회원가입 함수)

---

## 📊 전체 시스템 데이터 흐름

### 시나리오 1: 샵 등록 및 자동 매칭

```
[1] 원장님 회원가입
    ├─ users 테이블에 사용자 생성
    │   ├─ user_type: 'shop'
    │   ├─ email: 'shop@example.com'
    │   └─ status: 'active'
    │
    ├─ skincare_shops 테이블에 샵 생성
    │   ├─ name: '헤버구떼 압구정'
    │   ├─ state: '서울특별시'
    │   ├─ district: '강남구'
    │   ├─ address: '서울특별시 강남구...'
    │   ├─ phone: '02-1234-5678'
    │   └─ status: 'pending' ← 승인 대기
    │
    └─ users.shop_id ← skincare_shops.id 연결
        ✅ 회원가입 완료

[2] 관리자 승인 (중요! ⭐)
    ├─ admin-dashboard.html → approveShop(shopId) 호출
    │
    ├─ 지역 정보 검증
    │   ├─ state, district 필수 확인
    │   └─ 누락 시 승인 거부
    │
    ├─ status 변경: 'pending' → 'active'
    │
    └─ 🤖 autoMatchPublicData(shop) 자동 실행
        │
        ├─ [1단계] 공공 데이터 검색
        │   └─ tables/public_skincare_data?search=${shop.name}&limit=10
        │
        ├─ [2단계] 유사도 계산
        │   ├─ 이름 유사도: calculateSimilarity(shop.name, public.business_name)
        │   │   └─ 임계값: 80% 이상
        │   ├─ 주소 유사도: calculateSimilarity(shop.address, public.address)
        │   │   └─ 임계값: 60% 이상
        │   └─ 전화번호 일치: shop.phone === public.phone
        │
        ├─ [3단계] 매칭 성공 시
        │   ├─ PATCH tables/public_skincare_data/${public.id}
        │   │   └─ matched_shop_id: shop.id ← 등록 샵 ID 저장
        │   └─ 알림: "공공 데이터 매칭 완료"
        │
        └─ [4단계] 매칭 실패 시
            └─ 알림: "일반 승인 완료 (매칭 안 됨)"

[3] 매칭 결과
    ├─ public_skincare_data
    │   ├─ id: "d273c494-xxx"
    │   ├─ business_name: "헤버구떼 압구정"
    │   └─ matched_shop_id: "shop_001" ← 연결됨!
    │
    └─ skincare_shops
        ├─ id: "shop_001"
        ├─ name: "헤버구떼 압구정"
        └─ status: "active"
```

---

### 시나리오 2: 리뷰 작성 플로우

```
[1] 고객 상담 신청
    └─ consultations 테이블
        ├─ id: "cons_123"
        ├─ customer_id: "user_456"
        ├─ state: "서울특별시"
        ├─ district: "강남구"
        └─ status: "pending"

[2] 샵이 견적서 제출
    └─ quotes 테이블
        ├─ id: "quote_789"
        ├─ consultation_id: "cons_123"
        ├─ shop_id: "shop_001" ← 등록 샵 ID (FOREIGN KEY)
        ├─ shop_name: "헤버구떼 압구정"
        ├─ price: 50000
        └─ status: "sent"

[3] 고객이 견적서 수락
    └─ quotes 테이블 업데이트
        └─ status: "sent" → "accepted"

[4] 리뷰 작성 가능 상태
    ├─ customer-dashboard.html → 리뷰 관리 탭
    │
    ├─ loadPendingReviews() 함수 실행
    │   ├─ currentQuotes에서 status === 'accepted' 필터링
    │   ├─ 이미 리뷰 작성한 견적서 제외 (quote_id 비교)
    │   └─ "리뷰 작성" 버튼 표시
    │
    └─ showReviewModal(consultation_id, shop_id, shop_name, quote_id)
        └─ selectedConsultation 객체 생성

[5] 리뷰 작성 및 저장
    ├─ submitReview(event) 함수
    │
    ├─ 유효성 검사
    │   ├─ rating: 1~5 필수
    │   └─ review_text: 20자 이상
    │
    ├─ reviewData 객체 생성
    │   ├─ consultation_id: "cons_123"
    │   ├─ quote_id: "quote_789" ← 견적서 연결
    │   ├─ shop_id: "shop_001" ← 등록 샵 ID (FOREIGN KEY)
    │   ├─ customer_id: "user_456" ← 고객 ID (FOREIGN KEY)
    │   ├─ rating: 5
    │   ├─ review_text: "정말 좋았어요..."
    │   └─ created_at: ISO 날짜
    │
    └─ POST tables/reviews
        └─ reviews 테이블에 저장

[6] 리뷰 표시
    ├─ 고객 대시보드: 내가 작성한 리뷰
    │   └─ loadMyReviews() → customer_id로 필터링
    │
    └─ 샵 대시보드: 우리 샵 리뷰
        └─ shop_id로 필터링
```

---

## 🔐 데이터베이스 제약 조건

### reviews 테이블 FOREIGN KEY 검증

```sql
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    quote_id TEXT,                    -- 견적서 ID (추가됨)
    shop_id TEXT NOT NULL,            -- 등록 샵 ID
    customer_id TEXT NOT NULL,        -- 고객 ID
    ...
    FOREIGN KEY (consultation_id) REFERENCES consultations(id),
    FOREIGN KEY (quote_id) REFERENCES quotes(id),           -- 새로 추가
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id),    -- 기존
    FOREIGN KEY (customer_id) REFERENCES users(id)          -- 기존
);
```

### ⚠️ public_skincare_data 테이블 제약 누락

```sql
CREATE TABLE public_skincare_data (
    ...
    matched_shop_id TEXT,  -- ❌ FOREIGN KEY 제약 없음!
    ...
);
```

**문제점**:
- `matched_shop_id`가 `skincare_shops(id)`를 참조해야 하는데 제약이 없음
- 잘못된 ID가 저장될 수 있음 (데이터 무결성 위험)

**해결 방법**:
SQLite는 테이블 생성 후 FOREIGN KEY 추가가 불가능하므로:
1. **애플리케이션 레벨에서 검증** (현재 방식)
2. 또는 테이블 재생성 (데이터 마이그레이션 필요)

---

## 🧪 통합 테스트 시나리오

### 테스트 1: 샵 등록 → 자동 매칭

#### 준비
```sql
-- 1. 공공 데이터 확인
SELECT id, business_name, address, phone, matched_shop_id 
FROM public_skincare_data 
WHERE business_name LIKE '%신디네일%'
LIMIT 5;

-- 결과 예시:
-- id: "d273c494-xxx"
-- business_name: "신디네일"
-- address: "충청남도 천안시 서북구..."
-- phone: "041-xxx-xxxx"
-- matched_shop_id: NULL  ← 아직 매칭 안 됨
```

#### 실행
1. **회원가입**:
   - https://beautycat.kr/ → 회원가입
   - 타입: 업체
   - 샵명: "신디네일"
   - 주소: "충청남도 천안시 서북구..."
   - 전화: "041-xxx-xxxx"

2. **DB 확인**:
   ```sql
   -- users 테이블
   SELECT id, email, user_type, shop_id, created_at
   FROM users
   WHERE email = 'shop@test.com';
   
   -- skincare_shops 테이블
   SELECT id, name, state, district, address, phone, status
   FROM skincare_shops
   WHERE email = 'shop@test.com';
   
   -- 예상 결과:
   -- status: 'pending' ← 승인 대기
   ```

3. **관리자 승인**:
   - https://beautycat.kr/admin-dashboard.html
   - 로그인 (admin@beautycat.kr)
   - 업체 관리 탭
   - "신디네일" 찾기
   - "플랫폼 입점 승인" 클릭

4. **자동 매칭 확인**:
   ```sql
   -- public_skincare_data 확인
   SELECT id, business_name, matched_shop_id
   FROM public_skincare_data
   WHERE business_name LIKE '%신디네일%';
   
   -- 예상 결과:
   -- matched_shop_id: "shop_xxx" ← 연결됨!
   ```

#### 예상 결과
```
✅ 플랫폼 입점 승인 완료!

샵명: 신디네일
지역: 충남 천안시

🔗 공공 데이터 매칭 완료:
신디네일

이제 리뷰 작성이 가능합니다.
```

---

### 테스트 2: 견적 수락 → 리뷰 작성

#### 준비
```sql
-- 1. 테스트용 상담 생성
INSERT INTO consultations (
    id, customer_id, customer_name, customer_email, customer_phone,
    state, district, status, submission_date, created_at, updated_at
) VALUES (
    'test_cons_001', 'user_123', '테스터', 'test@example.com', '010-1234-5678',
    '서울특별시', '강남구', 'pending', datetime('now'), 
    cast(strftime('%s','now') || '000' as int),
    cast(strftime('%s','now') || '000' as int)
);

-- 2. 테스트용 견적서 생성
INSERT INTO quotes (
    id, consultation_id, shop_id, shop_name, treatment_details,
    price, status, valid_until, created_at, updated_at
) VALUES (
    'test_quote_001', 'test_cons_001', 'shop_001', '헤버구떼 압구정',
    '{"treatment": "기본 관리"}', 50000, 'sent', 
    datetime('now', '+7 days'),
    cast(strftime('%s','now') || '000' as int),
    cast(strftime('%s','now') || '000' as int)
);
```

#### 실행
1. **견적서 수락**:
   ```sql
   UPDATE quotes
   SET status = 'accepted', updated_at = cast(strftime('%s','now') || '000' as int)
   WHERE id = 'test_quote_001';
   ```

2. **고객 대시보드 접속**:
   - https://beautycat.kr/customer-dashboard.html
   - 로그인 (test@example.com)
   - 리뷰 관리 탭 클릭

3. **리뷰 작성**:
   - "리뷰 작성" 버튼 클릭
   - 별점: 5점
   - 리뷰 내용: "정말 좋았어요. 친절하고 시설도 깨끗했습니다. 강력 추천!"
   - 추천 여부: 체크
   - 저장 클릭

4. **DB 확인**:
   ```sql
   SELECT 
       id, consultation_id, quote_id, shop_id, customer_id,
       rating, review_text, recommend_yn, created_at
   FROM reviews
   WHERE customer_id = 'user_123'
   ORDER BY created_at DESC
   LIMIT 1;
   
   -- 예상 결과:
   -- quote_id: "test_quote_001" ← 견적서 연결됨
   -- shop_id: "shop_001" ← 등록 샵 연결됨
   -- rating: 5
   ```

#### 예상 결과
```
✅ 리뷰가 성공적으로 작성되었습니다!
```

---

### 테스트 3: 리뷰 중복 작성 방지

#### 실행
1. 동일한 견적서에 대해 리뷰 작성 재시도
2. 리뷰 관리 탭 확인

#### 예상 결과
```
✅ 모든 견적서에 대한 리뷰를 작성하셨습니다!
```

---

## 🚨 예외 상황 테스트

### 케이스 1: 지역 정보 누락 샵 승인

#### 시나리오
```sql
-- 지역 정보 없는 샵 생성
INSERT INTO skincare_shops (
    id, name, owner_name, phone, email, address,
    state, district, status, created_at, updated_at
) VALUES (
    'shop_bad_001', '테스트샵', '홍길동', '010-1111-1111',
    'bad@example.com', '서울시 어딘가',
    NULL, NULL, 'pending',  -- state, district가 NULL
    cast(strftime('%s','now') || '000' as int),
    cast(strftime('%s','now') || '000' as int)
);
```

#### 실행
- 관리자 대시보드 → "플랫폼 입점 승인" 클릭

#### 예상 결과
```
⚠️ 승인 불가: 지역 정보가 없습니다.

샵명: 테스트샵
시/도: 미입력
구/군: 미입력

해당 샵에 연락하여 지역 정보를 입력하도록 안내해주세요.
```

**검증**: 승인이 중단되고, status가 'pending'으로 유지됨

---

### 케이스 2: 매칭 실패 (유사한 공공 데이터 없음)

#### 시나리오
- 샵명: "전혀 없는 샵 이름 12345"
- 주소: "화성시 우주로..."

#### 예상 결과
```
✅ 플랫폼 입점 승인 완료!

샵명: 전혀 없는 샵 이름 12345
지역: 경기 화성시

해당 지역의 고객 견적 요청을 수신합니다.
```

**검증**: 
- 승인은 완료됨
- 매칭은 안 됨 (public_skincare_data에 matched_shop_id 업데이트 없음)

---

### 케이스 3: 리뷰 작성 시 필수 필드 누락

#### 시나리오
- 별점: 선택 안 함
- 리뷰 내용: "짧은글"

#### 예상 결과
```
❌ 전체 만족도를 선택해주세요.
```

또는

```
❌ 리뷰 내용을  20자 이상 작성해주세요.
```

**검증**: 리뷰가 저장되지 않음

---

## 📋 최종 체크리스트

### 데이터베이스
- [x] reviews.quote_id 컬럼 추가
- [x] reviews.quote_id 인덱스 생성
- [x] FOREIGN KEY 제약 조건 확인
- [ ] public_skincare_data.matched_shop_id FOREIGN KEY (선택사항)

### 코드 수정
- [x] customer-dashboard.js - 리뷰 필터링 개선
- [x] customer-dashboard.js - 에러 핸들링 강화
- [x] auth.js - 회원가입 시 자동 매칭 제거
- [x] admin-dashboard.js - 자동 매칭 시스템 검증

### 기능 테스트
- [ ] 샵 회원가입 → DB 저장 확인
- [ ] 관리자 승인 → status 변경 확인
- [ ] 자동 매칭 → matched_shop_id 업데이트 확인
- [ ] 견적서 수락 → status 변경 확인
- [ ] 리뷰 작성 → reviews 테이블 저장 확인
- [ ] 리뷰 중복 작성 방지 확인

### 예외 상황
- [ ] 지역 정보 누락 샵 승인 거부
- [ ] 매칭 실패 시 정상 승인
- [ ] 리뷰 필수 필드 누락 시 에러

---

## 📁 변경된 파일 목록

1. **js/customer-dashboard.js** (3개 수정)
   - Line 995-1000: 리뷰 필터링 개선
   - Line 1033-1037: 내 리뷰 목록 필터링 개선
   - Line 1206-1221: 에러 핸들링 강화

2. **js/auth.js** (1개 수정)
   - Line 881-909: 회원가입 시 자동 매칭 제거

3. **migrations/0003_add_quote_id_to_reviews.sql** (신규)
   - quote_id 컬럼 추가

4. **cloudflare-d1-schema.sql** (2개 수정)
   - Line 195: quote_id 컬럼 추가
   - Line 250: 인덱스 추가

5. **INTEGRATION_TEST_v2.8.13.6.123.md** (신규, 본 파일)

---

## 🚀 배포 전 최종 확인

### 1. 마이그레이션 실행
```bash
wrangler d1 execute beautycat-db --remote --file=migrations/0003_add_quote_id_to_reviews.sql
```

### 2. 스키마 확인
```bash
wrangler d1 execute beautycat-db --remote --command="PRAGMA table_info(reviews);"
```

**예상 출력**:
```
...
quote_id|TEXT|0||0
...
```

### 3. Git 커밋 및 Push
```bash
git add js/customer-dashboard.js js/auth.js cloudflare-d1-schema.sql migrations/0003_add_quote_id_to_reviews.sql INTEGRATION_TEST_v2.8.13.6.123.md

git commit -m "v2.8.13.6.123 - 리뷰 시스템 개선 및 통합 테스트

- 리뷰 필터링 개선 (customer_id 정확 필터링)
- 에러 핸들링 강화 (상세 로그)
- 회원가입 시 자동 매칭 제거 (관리자 승인 시만)
- quote_id 컬럼 추가 (견적서 연결)
- 통합 테스트 문서 작성"

git push origin main
```

---

**작성일**: 2025-12-31  
**버전**: v2.8.13.6.123  
**우선순위**: 최고 (배포 전 필수 검증)  
**작성자**: BeautyCat 개발팀
