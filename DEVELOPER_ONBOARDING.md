# 뽀샵 개발자 온보딩 가이드 👩‍💻👨‍💻

새로운 개발자가 뽀샵 프로젝트에 참여할 때 전달해야 할 모든 데이터와 정보를 정리한 문서입니다.

---

## 📋 1. 필수 전달 자료 체크리스트

### ✅ **코드베이스 및 프로젝트 파일**
- [ ] **전체 프로젝트 소스코드** (현재 디렉토리의 모든 파일)
- [ ] **README.md** - 프로젝트 전체 개요 및 기능 설명
- [ ] **SCALING_GUIDE.md** - 확장성 계획 및 로드맵
- [ ] **이 문서 (DEVELOPER_ONBOARDING.md)** - 개발자 온보딩 가이드

### ✅ **기술 문서**
- [ ] **데이터베이스 스키마** (8개 테이블 구조)
- [ ] **API 엔드포인트 문서** (RESTful Table API)
- [ ] **JavaScript 모듈 구조** (7개 JS 파일 역할)
- [ ] **UI/UX 가이드라인** (뽀샵 브랜드 가이드)

### ✅ **계정 및 접근 권한**
- [ ] **개발 환경 접근권한**
- [ ] **데모 계정 정보** (테스트용)
- [ ] **관리자 계정** (필요시)
- [ ] **개발 도구 라이선스** (필요시)

---

## 📂 2. 프로젝트 파일 구조 설명

### **현재 프로젝트 구조**
```
뽀샵 프로젝트/
├── 📄 index.html                 # 메인 페이지 (상담 신청)
├── 📄 login.html                # 로그인 페이지  
├── 📄 register.html             # 회원가입 페이지
├── 📄 customer-dashboard.html   # 고객 대시보드
├── 📄 shop-dashboard.html       # 업체 대시보드
├── 📄 admin-dashboard.html      # 관리자 대시보드
├── 📄 shop-registration.html    # 업체 등록 페이지
├── 📄 chat.html                # 실시간 채팅 페이지
├── 📄 contact-inquiry.html      # 온라인 문의 페이지
├── 📁 js/                      # JavaScript 모듈들
│   ├── main.js              # 메인 페이지 로직 + 지역 데이터 (17개 시도, 249개 시군구)
│   ├── auth.js              # 인증 시스템 (로그인/회원가입/세션)
│   ├── customer-dashboard.js # 고객 대시보드 기능
│   ├── shop-dashboard.js    # 업체 대시보드 기능  
│   ├── admin-dashboard.js   # 관리자 대시보드 기능
│   ├── shop-registration.js # 업체 등록 로직
│   └── chat.js              # 채팅 기능 로직
├── 📄 README.md                # 프로젝트 전체 문서 (필수 읽기)
├── 📄 SCALING_GUIDE.md         # 확장성 가이드 (성장 전략)
└── 📄 DEVELOPER_ONBOARDING.md  # 개발자 온보딩 가이드 (이 문서)
```

### **각 파일의 역할과 중요도**
| 파일명 | 중요도 | 역할 | 수정 빈도 |
|--------|--------|------|-----------|
| `README.md` | 🔥🔥🔥 | **전체 프로젝트 가이드** - 반드시 먼저 읽기 | 높음 |
| `index.html` | 🔥🔥🔥 | **메인 페이지** - 사용자 첫 접점 | 높음 |
| `js/main.js` | 🔥🔥🔥 | **핵심 비즈니스 로직** - 상담 신청, 지역 매칭 | 높음 |
| `js/auth.js` | 🔥🔥🔥 | **인증 시스템** - 모든 페이지에서 사용 | 중간 |
| `*-dashboard.html` | 🔥🔥 | **사용자별 대시보드** - 핵심 기능 | 높음 |
| `js/*-dashboard.js` | 🔥🔥 | **대시보드 로직** - 각 사용자 타입별 | 높음 |
| `chat.html + js/chat.js` | 🔥🔥 | **실시간 채팅** - 매칭 후 소통 | 중간 |
| `login.html, register.html` | 🔥 | **사용자 인증 UI** - 진입점 | 낮음 |

---

## 🗃️ 3. 데이터베이스 스키마 (8개 테이블)

### **핵심 테이블 구조**
```sql
-- 1. users (사용자 - 고객/업체/관리자)
{
  id, email, password, name, phone, user_type,
  is_active, is_verified, profile_image, last_login,
  shop_id, permissions, created_at, updated_at
}

-- 2. consultations (상담 신청)
{
  id, customer_name, customer_phone, customer_email,
  region, treatment_type, consultation_text, image_url,
  budget_range, preferred_schedule, status, created_at
}

-- 3. skincare_shops (피부관리실)  
{
  id, shop_name, owner_name, phone, email, address,
  region, specialties, business_hours, price_range,
  description, images, rating, is_active, verified
}

-- 4. quotes (견적서)
{
  id, consultation_id, shop_id, treatment_details,
  price, duration, available_dates, additional_notes,
  status, valid_until
}

-- 5. messages (메시지)
{
  id, consultation_id, sender_type, sender_id,
  message, attachment_url, is_read, timestamp
}

-- 6. user_sessions (사용자 세션)
{
  id, user_id, session_token, expires_at,
  ip_address, user_agent, is_active
}

-- 7. admin_logs (관리자 로그)
{
  id, admin_id, action, target_type,
  target_id, details, timestamp
}

-- 8. contact_inquiries (문의사항)
{
  id, inquiry_type, contact_name, contact_email, contact_phone,
  inquiry_subject, inquiry_message, status, admin_response,
  created_at, updated_at
}
```

### **테이블 관계도**
```
users (1) ──→ (N) consultations (고객이 여러 상담 신청)
users (1) ──→ (1) skincare_shops (업체 계정과 업체 정보)
consultations (1) ──→ (N) quotes (하나의 상담에 여러 견적)
consultations (1) ──→ (N) messages (하나의 상담에 여러 메시지)
skincare_shops (1) ──→ (N) quotes (하나의 업체가 여러 견적 제공)
users (1) ──→ (N) messages (사용자가 여러 메시지 발송)
```

---

## 🔌 4. API 엔드포인트 문서

### **RESTful Table API 구조**
```javascript
// 기본 URL: 상대 경로 사용
// 모든 API는 JSON 형태로 데이터 송수신

// 1. 데이터 조회
GET /tables/{table_name}                    # 전체 목록 (페이징 지원)
GET /tables/{table_name}?page=1&limit=10    # 페이징
GET /tables/{table_name}?search=keyword     # 검색
GET /tables/{table_name}?sort=created_at    # 정렬
GET /tables/{table_name}/{record_id}        # 단일 레코드

// 2. 데이터 생성/수정/삭제
POST /tables/{table_name}                   # 새 레코드 생성
PUT /tables/{table_name}/{record_id}        # 전체 업데이트
PATCH /tables/{table_name}/{record_id}      # 부분 업데이트  
DELETE /tables/{table_name}/{record_id}     # 소프트 삭제 (deleted=true)
```

### **사용 예시**
```javascript
// 상담 신청 생성
const newConsultation = await fetch('/tables/consultations', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    customer_name: '홍길동',
    customer_email: 'hong@example.com',
    region: '서울특별시 강남구',
    treatment_type: '여드름 관리',
    consultation_text: '얼굴 여드름이 심해서 상담받고 싶습니다.'
  })
});

// 업체 목록 조회 (지역별 필터)
const shops = await fetch('/tables/skincare_shops?search=강남구');
const data = await shops.json();
```

---

## 🎨 5. UI/UX 및 브랜드 가이드

### **뽀샵 브랜드 아이덴티티**
```css
/* 브랜드 컬러 */
--primary-gradient: linear-gradient(135deg, #ff2d92 0%, #ff6b9d 100%);
--primary-pink: #ff2d92;
--secondary-pink: #ff6b9d;
--light-pink: #fef7f7;

/* 브랜드 로고 */
<span class="text-white text-xl font-bold">P</span> 뽀샵

/* 브랜드 메시지 */
"우리 동네 모든 피부샵, 한 번에 비교하고 선택하세요!"
```

### **디자인 시스템**
- **UI 프레임워크**: Tailwind CSS (CDN)
- **아이콘**: Font Awesome 6.4.0
- **폰트**: Noto Sans KR (Google Fonts)
- **디자인 철학**: "강남언니" 스타일 - 카드 기반, 모바일 퍼스트
- **반응형**: Mobile (320px+) → Tablet (768px+) → Desktop (1024px+)

### **주요 UI 컴포넌트**
```html
<!-- 브랜드 헤더 -->
<div class="bg-gradient-to-r from-pink-500 to-pink-400">
  <span class="text-white text-xl font-bold">P</span>
  <span class="text-white text-xl font-bold ml-1">뽀샵</span>
</div>

<!-- 카드 스타일 -->
<div class="bg-white rounded-xl shadow-lg p-6 mb-4">
  <!-- 카드 내용 -->
</div>

<!-- 버튼 스타일 -->
<button class="bg-gradient-to-r from-pink-500 to-pink-400 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all">
  상담 신청하기
</button>
```

---

## 👥 6. 사용자 계정 및 권한 시스템

### **3단계 사용자 타입**
| 사용자 타입 | 영문코드 | 접근 페이지 | 주요 기능 |
|------------|----------|------------|----------|
| **고객** | `customer` | `customer-dashboard.html` | 상담 신청, 견적 비교, 채팅 |
| **피부샵** | `shop` | `shop-dashboard.html` | 상담 수신, 견적 발송, 업체 관리 |
| **관리자** | `admin` | `admin-dashboard.html` | 전체 관리, 승인, 통계 |

### **데모 계정 (테스트용)**
```javascript
// 즉시 테스트 가능한 계정들
const demoAccounts = {
  customer: {
    email: 'demo@customer.com',
    password: 'customer123',
    name: '김고객'
  },
  shop: {
    email: 'demo@shop.com', 
    password: 'shop123',
    name: '뷰티샵 사장'
  },
  admin: {
    email: 'admin@demo.com',
    password: 'admin123',
    name: '관리자'
  }
};
```

### **권한 확인 로직**
```javascript
// 현재 사용자 정보 가져오기
function getCurrentUser() {
  const userData = localStorage.getItem('currentUser');
  return userData ? JSON.parse(userData) : null;
}

// 페이지 접근 권한 확인
function checkPageAccess(requiredUserType) {
  const user = getCurrentUser();
  if (!user || user.user_type !== requiredUserType) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
```

---

## 🔧 7. 개발 환경 설정

### **필수 도구 및 설정**
```bash
# 1. 코드 에디터
- Visual Studio Code (권장)
  + 확장: Live Server, Prettier, ES6 Snippets
  + 설정: Auto Save, Format on Save

# 2. 브라우저 개발 도구
- Chrome DevTools (권장)
- Firefox Developer Tools
- 모바일 시뮬레이터 활용

# 3. 버전 관리
- Git (필수)
- GitHub 또는 GitLab 계정

# 4. 테스트 환경
- 로컬 서버: Live Server Extension
- 모바일 테스트: Chrome DevTools Device Mode
- 브라우저 호환성: Chrome, Safari, Firefox, Edge
```

### **개발 서버 실행**
```bash
# 방법 1: VS Code Live Server
1. VS Code에서 index.html 우클릭
2. "Open with Live Server" 선택
3. http://localhost:5500 에서 확인

# 방법 2: Python 서버 (로컬)
python -m http.server 8000
# http://localhost:8000 에서 확인

# 방법 3: Node.js 서버 (로컬)  
npx serve .
# http://localhost:3000 에서 확인
```

---

## 🐛 8. 디버깅 및 문제 해결

### **자주 발생하는 이슈와 해결법**

#### **JavaScript 오류**
```javascript
// 문제: "Cannot read properties of null"
// 원인: DOM 요소를 찾지 못함
// 해결: 요소 존재 확인 후 사용
const element = document.getElementById('myId');
if (element) {
  element.addEventListener('click', handleClick);
}

// 문제: localStorage 관련 오류
// 원인: 사용자 데이터 불일치
// 해결: 로컬스토리지 초기화
localStorage.clear();
location.reload();
```

#### **API 호출 오류**
```javascript
// 문제: API 응답 실패
// 해결: try-catch로 오류 처리
async function apiCall() {
  try {
    const response = await fetch('/tables/users');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 호출 실패:', error);
    alert('데이터 로딩에 실패했습니다.');
  }
}
```

#### **CSS/레이아웃 이슈**
```css
/* 문제: Tailwind CSS 스타일이 적용되지 않음 */
/* 해결: CDN 링크 확인 */
<script src="https://cdn.tailwindcss.com"></script>

/* 문제: 모바일 반응형 이슈 */
/* 해결: viewport meta 태그 확인 */
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

### **개발자 도구 활용**
```javascript
// 콘솔에서 현재 사용자 확인
console.log('Current User:', getCurrentUser());

// 로컬스토리지 데이터 확인
console.log('Local Storage:', localStorage);

// API 테스트
fetch('/tables/consultations').then(r => r.json()).then(console.log);
```

---

## 📋 9. 테스트 시나리오

### **기본 기능 테스트**
```
1. 사용자 인증 테스트
   □ 회원가입 (고객/업체/관리자)
   □ 로그인/로그아웃
   □ 데모 계정 로그인
   □ 권한별 페이지 접근

2. 상담 신청 플로우
   □ 지역 선택 (2단계: 시도 → 시군구)  
   □ 관리 프로그램 선택
   □ 상담 내용 작성
   □ 이미지 업로드 (선택)
   □ 신청 완료

3. 업체 등록 플로우
   □ 업체 정보 입력
   □ 전문 분야 선택
   □ 영업시간/가격대 설정
   □ 업체 사진 업로드
   □ 등록 완료

4. 채팅 시스템
   □ 실시간 메시지 송수신
   □ 파일 첨부
   □ 견적서 전송/수신
   □ 5초 폴링 동작 확인

5. 대시보드 기능
   □ 통계 데이터 표시
   □ 데이터 필터링/정렬
   □ CRUD 작업 (생성/조회/수정/삭제)
   □ 페이징 동작
```

### **모바일 테스트**
```
□ 320px (iPhone SE) 레이아웃
□ 375px (iPhone 12) 레이아웃  
□ 768px (iPad) 레이아웃
□ 터치 영역 44px+ 확인
□ 폰트 크기 16px+ 확인
□ 햄버거 메뉴 동작
□ 스크롤 및 네비게이션
```

---

## 💡 10. 개발 팁 및 베스트 프랙티스

### **코드 스타일 가이드**
```javascript
// 1. 함수명은 명확하고 설명적으로
function handleConsultationSubmit() { /* */ }  // ✅ Good
function submit() { /* */ }                    // ❌ Bad

// 2. 에러 처리는 필수
async function loadData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Data loading failed:', error);
    showErrorMessage('데이터 로딩에 실패했습니다.');
    return null;
  }
}

// 3. DOM 조작 시 요소 존재 확인
const button = document.getElementById('submitBtn');
if (button) {
  button.addEventListener('click', handleSubmit);
}

// 4. 상수는 대문자로, 설정값은 객체로 관리
const API_ENDPOINTS = {
  CONSULTATIONS: '/tables/consultations',
  SHOPS: '/tables/skincare_shops',
  USERS: '/tables/users'
};
```

### **성능 최적화 팁**
```javascript
// 1. 불필요한 API 호출 방지 (캐싱)
let cachedRegions = null;
async function getRegions() {
  if (cachedRegions) return cachedRegions;
  cachedRegions = await fetchRegionsFromAPI();
  return cachedRegions;
}

// 2. 이벤트 리스너 정리
function cleanup() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

// 3. 이미지 최적화
function compressImage(file, maxWidth = 800, quality = 0.8) {
  // Canvas를 사용한 이미지 압축 로직
}
```

### **보안 고려사항**
```javascript
// 1. XSS 방지 - 사용자 입력 이스케이프
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 2. 민감 정보 로깅 방지
function logUserAction(action, userId) {
  console.log(`Action: ${action}, User: ${userId}`);
  // 비밀번호, 개인정보는 로깅 금지
}

// 3. API 호출 시 권한 확인
function checkApiAccess(userType, requiredType) {
  return userType === requiredType || userType === 'admin';
}
```

---

## 📞 11. 개발자 지원 및 문의

### **개발 관련 문의처**
- **기술 문의**: dev@뽀샵.com
- **긴급 이슈**: 카카오톡 @뽀샵개발팀
- **문서 업데이트**: GitHub Issues

### **추가 학습 자료**
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Vanilla JavaScript**: MDN Web Docs
- **RESTful API**: REST API 설계 가이드
- **모바일 퍼스트**: Google Web Fundamentals

### **코드 리뷰 기준**
```
✅ 체크포인트
□ 기능이 정상 동작하는가?
□ 에러 처리가 적절한가?  
□ 모바일에서 정상 동작하는가?
□ 코드가 읽기 쉽고 이해하기 쉬운가?
□ 보안 취약점은 없는가?
□ 성능에 문제는 없는가?
□ 기존 기능에 영향을 주지 않는가?
```

---

## 🎯 12. 첫 주 개발 계획 예시

### **Day 1-2: 환경 설정 및 이해**
- [ ] 개발 환경 설정 (VS Code, Live Server)
- [ ] README.md 완독
- [ ] 전체 프로젝트 구조 파악
- [ ] 데모 계정으로 모든 기능 테스트

### **Day 3-4: 코드 분석**
- [ ] JavaScript 모듈별 코드 리뷰
- [ ] API 엔드포인트 테스트
- [ ] 데이터베이스 스키마 이해
- [ ] UI 컴포넌트 구조 파악

### **Day 5: 첫 번째 개발 작업**
- [ ] 작은 버그 수정 또는 UI 개선
- [ ] 코드 커밋 및 테스트
- [ ] 팀 리뷰 및 피드백

---

## ✅ 13. 온보딩 완료 체크리스트

새 개발자가 다음 항목들을 모두 완료하면 온보딩이 성공적으로 마무리됩니다:

### **기술적 이해**
- [ ] 프로젝트 전체 구조를 설명할 수 있다
- [ ] 8개 데이터베이스 테이블의 역할을 안다
- [ ] RESTful API 사용법을 이해한다
- [ ] 3가지 사용자 타입 시스템을 이해한다
- [ ] 주요 JavaScript 함수들의 역할을 안다

### **실무 능력**
- [ ] 데모 계정으로 모든 기능을 테스트했다
- [ ] 새로운 기능을 추가할 수 있다
- [ ] 버그를 찾고 수정할 수 있다
- [ ] 모바일/데스크톱 반응형을 확인할 수 있다
- [ ] Git으로 코드를 관리할 수 있다

### **비즈니스 이해**  
- [ ] 뽀샵의 비즈니스 모델을 이해한다
- [ ] 고객-업체-관리자 매칭 플로우를 안다
- [ ] 확장성 계획(SCALING_GUIDE.md)을 읽었다
- [ ] 향후 개발 로드맵을 이해한다

---

**🎉 새로운 개발자님, 뽀샵 팀에 오신 것을 환영합니다!**

이 문서의 모든 내용을 차근차근 따라하시면 뽀샵 프로젝트의 전문가가 될 수 있습니다. 

**"우리 동네 모든 피부샵, 한 번에 비교하고 선택하세요!"** 
함께 뽀샵을 더 멋진 플랫폼으로 만들어 나가요! 🚀💖