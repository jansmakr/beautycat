# 🚀 BeautyCat 상용화 빠른 시작 가이드

**목적**: 15분 안에 실제 데이터 저장 시스템 가동하기  
**대상**: 사용자, 샵, 상담 데이터를 실제로 저장하고 관리  
**난이도**: ⭐ (쉬움)

---

## 🎯 3단계로 완료하기

### Step 1: 데이터베이스 초기 설정 (5분)
### Step 2: API 연동 확인 (5분)
### Step 3: 실제 테스트 (5분)

---

## Step 1: 데이터베이스 초기 설정

### 1. Cloudflare Dashboard 접속

```
1. https://dash.cloudflare.com 로그인
2. Storage & Databases → D1 클릭
3. beautycat-db 클릭
4. Console 탭 클릭
```

### 2. 관리자 계정 생성 (필수!)

아래 SQL을 복사하여 Console에 붙여넣고 Execute 클릭:

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

### 3. 샘플 피부관리실 2개 등록

```sql
INSERT INTO skincare_shops (
    id, name, owner_name, phone, email, 
    address, state, district, 
    description, status,
    created_at, updated_at
) VALUES 
(
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
),
(
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

### 4. 대표업체 등록 (전화상담용)

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

### 5. 웰컴 공지사항

```sql
INSERT INTO announcements (
    id, title, content, author_id, author_name, 
    priority, target_audience, is_pinned, is_published, 
    publish_date, created_at, updated_at
) VALUES (
    'announce_001',
    'beautycat 서비스 정식 오픈!',
    '피부관리실 견적 비교 플랫폼 beautycat이 정식 오픈했습니다.',
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

### 6. 데이터 확인

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM skincare_shops;
SELECT COUNT(*) FROM representative_shops;
SELECT COUNT(*) FROM announcements;
```

각각 1, 2, 1, 1이 나오면 성공! ✅

---

## Step 2: API 연동 확인

### 1. 브라우저에서 테스트

beautycat.kr 사이트를 열고, 개발자 도구(F12) 콘솔에서:

```javascript
// 1. API 정상 작동 확인
API.checkHealth().then(console.log);
// 예상: {success: true, data: {status: "healthy"}}

// 2. 사용자 조회
API.get('users').then(console.log);
// 예상: 관리자 계정 1개 보임

// 3. 샵 조회
API.get('skincare_shops').then(console.log);
// 예상: 샵 2개 보임

// 4. 공지사항 조회
API.get('announcements').then(console.log);
// 예상: 공지사항 1개 보임
```

모두 성공하면 API 연동 완료! ✅

---

## Step 3: 실제 기능 테스트

### 1. 회원가입 테스트

beautycat.kr/register.html 접속 후:

```javascript
// 개발자 도구 콘솔에서 테스트
API.create('users', {
    email: 'test@beautycat.kr',
    password: await hashPassword('test1234'),
    name: '테스트 사용자',
    user_type: 'customer',
    phone: '010-0000-0000',
    status: 'active'
}).then(console.log);
```

성공 시: `{success: true, data: {...}}` ✅

### 2. 상담 신청 테스트

beautycat.kr/index.html 접속 후:

```javascript
// 상담 신청 폼 작성 또는 콘솔에서 직접 테스트
API.create('consultations', {
    customer_name: '김영희',
    customer_phone: '010-9876-5432',
    customer_email: 'test@beautycat.kr',
    state: '서울',
    district: '강남구',
    treatment_types: '["피부관리","미백관리"]',
    skin_concerns: '["여드름","모공"]',
    age_range: '30대',
    budget_range: '10-30만원',
    status: 'pending',
    submission_date: new Date().toISOString()
}).then(console.log);
```

성공 시: `{success: true, data: {...}}` ✅

### 3. 데이터 확인

D1 Console에서:

```sql
SELECT * FROM consultations ORDER BY created_at DESC LIMIT 1;
```

방금 생성한 상담 신청이 보이면 성공! ✅

---

## 🎉 완료!

**축하합니다! BeautyCat이 상용화 준비 완료되었습니다!**

### 이제 가능한 것들:

✅ **실제 사용자 회원가입**  
✅ **피부관리실 등록 및 승인**  
✅ **상담 신청 저장 및 관리**  
✅ **견적서 전송**  
✅ **채팅 메시지**  
✅ **리뷰 작성**  
✅ **통계 기록**

---

## 📝 다음 단계

### 즉시 (지금 바로!)
1. ✅ **베타 테스터 모집** (지인 3-5명)
2. ✅ **실제 사용 시나리오 테스트**
3. ✅ **피드백 수집**

### 1주일 이내
1. 📱 **모바일 최적화 확인**
2. 🐛 **버그 수정**
3. 📊 **사용 통계 확인**

### 2주일 이내
1. 🎯 **정식 서비스 런칭**
2. 📢 **마케팅 시작**
3. 🏪 **업체 모집 시작**

---

## 📚 더 자세한 가이드

- **PRODUCTION_DATA_SETUP_GUIDE.md** - 상세 데이터 설정 (15분)
- **PRODUCTION_FRONTEND_INTEGRATION.md** - 프론트엔드 완전 통합 (20분)
- **PRODUCTION_LAUNCH_CHECKLIST.md** - 최종 런칭 체크리스트 (45분)

---

## 🆘 문제 해결

### API가 작동하지 않는 경우

```javascript
// 1. Health Check 확인
API.checkHealth().then(console.log);

// 2. API URL 확인
console.log(API.BASE_URL);
// 예상: https://beautycat-api.jansmakr.workers.dev/api
```

### 데이터가 저장되지 않는 경우

```javascript
// 1. D1 바인딩 확인
// Cloudflare Dashboard → Workers → beautycat-api
// Variables → D1 database bindings 확인

// 2. 직접 테스트
fetch('https://beautycat-api.jansmakr.workers.dev/api/health')
  .then(r => r.json())
  .then(console.log);
```

---

## 📞 지원

- **이메일**: utuber@kakao.com
- **카카오톡**: https://open.kakao.com/o/sXXnTISh
- **대표번호**: 070-7004-5902

**성공적인 런칭을 응원합니다!** 🚀🎉
