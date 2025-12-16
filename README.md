# 🐱 BeautyCat - 뷰티 샵 매칭 플랫폼

## 📋 프로젝트 개요

BeautyCat은 고객과 뷰티샵(피부관리실, 네일샵, 왁싱샵 등)을 연결하는 AI 기반 매칭 플랫폼입니다.

- **프로젝트 URL**: https://beautycat.kr
- **현재 버전**: v2.8.13.7
- **마지막 업데이트**: 2025-12-16
- **상태**: 🟢 프로덕션 운영 중

---

## 🎯 주요 기능

### 1. 고객 기능
- **상담 신청**: 원하는 서비스, 지역, 예산 입력
- **긴급 예약** ⚡: 오늘/내일 빠른 매칭 (v2.8.12.4)
- **지역 기반 매칭**: 시/도/구/동 단위 정밀 매칭
- **다중 로그인**: 카카오 / 네이버 / 이메일

### 2. 샵 기능
- **Shop Dashboard**: 상담 요청 관리
- **견적서 자동 입력** ✨: 샵 소개 자동 입력 (v2.8.13.6)
- **견적서 템플릿** ⭐: 저장/불러오기로 작성 시간 단축 (v2.8.13.3)
- **견적 발송**: 고객에게 견적서 전송
- **견적서 수정**: accepted 상태에서도 수정 가능 (v2.8.13.2)
- **이미지 확대** 🔍: 피부 사진 클릭으로 확대 (v2.8.13.3)
- **긴급 예약 우선 확인**: ⚡ 표시로 긴급 요청 식별
- **이미지 업로드**: 자동 리사이징 (108KB)

### 3. 시스템 기능
- **대표샵 시스템**: 지역별 대표 샵 자동 매칭
- **API Global Override**: 필드명 통합 관리
- **쿠폰 시스템**: 베타 테스트 쿠폰 5종
- **예약 시스템**: 18개 시간 슬롯
- **알림 시스템**: 실시간 알림

---

## 🚀 최근 업데이트 (v2.8.13.7)

### 2025-12-16 배포
**UI Improvement**: Shop Dashboard 빠른 액션 아이콘 그리드 추가

#### 주요 변경사항
1. ✅ **Shop Dashboard UI 개선** (v2.8.13.7)
   - 빠른 액션 아이콘 그리드 추가 (8개 기능)
   - 실시간 카운트 표시 (신규 상담, 견적)
   - 모바일 최적화 (2x4 그리드)
   - 주요 기능 원클릭 접근

2. ✅ **이전 버전 (v2.8.13.6)**
   - Kakao 로그인 버그 수정
   - 견적서 자동 입력 기능
   - 견적서 템플릿 시스템

2. ✅ **이미지 확대 모달** (v2.8.13.3)
   - 피부 사진 클릭 → 전체 화면 확대
   - 다운로드 기능 포함
   - 순수 JS (라이브러리 불필요)

3. ✅ **피부 상태 필드 추가** (v2.8.13.3)
   - 샵 대시보드 견적 상세에 표시
   - 고객 정보 완전성 향상

4. ✅ **Critical API 경로 버그 수정** (v2.8.13.4)
   - 절대 경로 → 상대 경로 변경 (16곳)
   - 404/500 에러 원천 차단
   - 8개 JavaScript 파일 수정

#### 시스템 상태
```
1️⃣ 견적서 템플릿: ✅ 정상
2️⃣ 이미지 확대: ✅ 정상
3️⃣ 피부 상태 표시: ✅ 정상
4️⃣ API 호출: ✅ 정상
5️⃣ 전체 시스템: 🟢 100% 정상
```

---

## 🏗️ 기술 스택

### Frontend
- **HTML5** / **CSS3** / **JavaScript (ES6+)**
- **Tailwind CSS**: 스타일링
- **Font Awesome**: 아이콘
- **Google Fonts**: 타이포그래피

### Backend & API
- **RESTful API**: https://api.beautycat.kr/api
- **Cloudflare Pages**: 호스팅 및 배포
- **Cloudflare API Bridge**: API 프록시

### 외부 SDK
- **Kakao SDK v2.7.2**: 카카오 로그인
- **Naver SDK**: 네이버 로그인

### 데이터베이스
- **RESTful Table API**: 데이터 관리
  - `consultation_requests`: 상담 신청
  - `quotations`: 견적서
  - `representative_shops`: 대표 샵
  - `shop_announcements`: 샵 공지사항
  - `admin_announcements`: 관리자 공지

---

## 📂 프로젝트 구조

```
beautycat/
├── index.html                 # 메인 페이지
├── shop-dashboard.html        # 샵 대시보드
├── register.html              # 회원가입
├── css/
│   ├── style.css             # 메인 스타일
│   └── responsive.css        # 반응형 스타일
├── js/
│   ├── api-global-override.js # API 통합 관리
│   ├── api-helper.js         # API 헬퍼 함수
│   ├── auth.js               # 인증 시스템
│   ├── regional-matching.js  # 지역 매칭
│   ├── deposit-system.js     # 예약금 시스템
│   ├── shop-dashboard.js     # 샵 대시보드 로직
│   └── ...
├── _archive/                 # 아카이브 (120+ 파일 정리)
│   ├── backup-files/
│   ├── old-migrations/
│   ├── checkpoint-222-docs/
│   ├── v2.1-v2.6-docs/
│   └── old-guides/
└── docs/
    ├── HOTFIX_v2.8.12.5_*.md
    ├── DEPLOYMENT_SUCCESS_v2.8.12.5.md
    └── PROJECT_STATUS_v2.8.12.5.md
```

---

## 🔑 주요 URI 및 엔드포인트

### 웹 페이지
- **메인 페이지**: https://beautycat.kr
- **샵 대시보드**: https://beautycat.kr/shop-dashboard.html
- **회원가입**: https://beautycat.kr/register.html

### API 엔드포인트
```
BASE_URL: https://api.beautycat.kr/api

GET    /tables/{table}                    # 목록 조회
GET    /tables/{table}/{record_id}        # 단일 조회
POST   /tables/{table}                    # 생성
PUT    /tables/{table}/{record_id}        # 전체 수정
PATCH  /tables/{table}/{record_id}        # 부분 수정
DELETE /tables/{table}/{record_id}        # 삭제
```

### 주요 테이블
- `consultation_requests`: 상담 신청 (34건 처리 중)
- `quotations`: 견적서 (1건)
- `representative_shops`: 대표 샵 (2개)
- `shop_announcements`: 샵 공지 (5개)
- `admin_announcements`: 관리자 공지 (1개)

---

## ✅ 완료된 기능

### 핵심 기능 (v2.8.12.5)
- ✅ 상담 신청 시스템
- ✅ 견적서 발송 시스템
- ✅ 지역 기반 매칭 (시/도/구/동)
- ✅ 대표샵 자동 할당
- ✅ 카카오 로그인 (복구 완료)
- ✅ 네이버 로그인
- ✅ 이메일 로그인
- ✅ **긴급 예약 필드** ⚡ (v2.8.12.4)
- ✅ Shop Dashboard
- ✅ 이미지 자동 리사이징 (108KB)

### 시스템 기능
- ✅ API Global Override (필드명 통합)
- ✅ Service Worker 제거 (v2.2.5)
- ✅ 쿠폰 시스템 (베타 5종)
- ✅ 예약 시스템 (18 슬롯)
- ✅ 알림 시스템
- ✅ 캐시 관리 시스템

---

## 🔜 미구현 기능

### 단기 (1-2주)
- ⏳ 긴급 예약 통계 대시보드
- ⏳ 샵 평점/리뷰 시스템
- ⏳ 결제 시스템 연동

### 중기 (1-2개월)
- ⏳ 모바일 앱 (React Native)
- ⏳ 실시간 채팅 시스템
- ⏳ AI 추천 알고리즘 고도화

### 장기 (3-6개월)
- ⏳ 샵 자체 예약 관리 시스템
- ⏳ 고객 멤버십 프로그램
- ⏳ 대규모 마케팅 캠페인 관리

---

## 🎯 다음 개발 계획

### v2.8.13 (예정)
- 긴급 예약 통계 대시보드
- 샵별 긴급 예약 응답률 추적
- 고객 만족도 설문

### v2.9.0 (예정)
- 사용자 피드백 기반 UI/UX 개선
- 샵 평점 및 리뷰 시스템
- 검색 기능 고도화

### v3.0.0 (계획)
- 대규모 UI/UX 리뉴얼
- 모바일 최적화 강화
- 성능 최적화

---

## 🗂️ 데이터 모델

### consultation_requests (상담 신청)
```javascript
{
  id: "uuid",
  customer_name: "string",
  phone: "string",
  service_type: "string",
  region: "string",
  district: "string",
  town: "string",
  budget: "string",
  additional_notes: "string",  // "⚡ 긴급 예약 희망" 포함 가능
  created_at: "timestamp",
  updated_at: "timestamp"
}
```

### representative_shops (대표 샵)
```javascript
{
  id: "uuid",
  shop_name: "string",
  region: "string",      // API Override: state → region
  district: "string",
  town: "string",
  service_types: "array",
  contact_email: "string",
  created_at: "timestamp"
}
```

### quotations (견적서)
```javascript
{
  id: "uuid",
  consultation_id: "uuid",
  shop_name: "string",
  total_price: "number",
  description: "string",
  image_url: "string",   // 자동 리사이징됨
  created_at: "timestamp"
}
```

---

## 🔧 개발 환경 설정

### 로컬 개발
```bash
# 프로젝트 클론
git clone <repository-url>

# 로컬 서버 실행
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server -p 8000

# 브라우저에서 접속
http://localhost:8000
```

### 환경 변수
```javascript
// index.html 또는 js 파일에서 설정
const API_BASE_URL = 'https://api.beautycat.kr/api';
const KAKAO_JAVASCRIPT_KEY = 'YOUR_KAKAO_KEY';
```

### 필수 설정
1. **Kakao Developers Console**
   - JavaScript Key 발급
   - 플랫폼 등록: `https://beautycat.kr`
   - Redirect URI 설정

2. **Cloudflare Pages**
   - GitHub 연동
   - 자동 배포 설정
   - 환경 변수 설정

---

## 🧪 테스트

### F12 Console 검증
```javascript
// 시스템 상태 확인
console.log('Kakao SDK:', typeof Kakao !== 'undefined' ? '✅' : '❌');
console.log('긴급 예약:', !!document.getElementById('urgentReservation') ? '✅' : '❌');

// API 테스트
fetch('https://api.beautycat.kr/api/tables/consultation_requests?limit=1')
  .then(res => res.json())
  .then(data => console.log('✅ API 정상:', data));
```

### 기능 테스트
1. **로그인 테스트**: 카카오/네이버/이메일
2. **상담 신청**: 긴급 예약 체크
3. **Shop Dashboard**: 상담 요청 확인
4. **견적 발송**: 이미지 업로드 및 발송

---

## 📊 현재 통계

### 시스템 상태 (2025-12-16)
- **시스템 가동률**: 100%
- **처리 중인 상담**: 34건
- **발송된 견적**: 1건
- **등록된 대표샵**: 2개
- **활성 공지사항**: 6개

### 무료 기간
- **시작일**: 2025년 12월 11일 (추정)
- **종료일**: 2026년 5월 30일
- **남은 기간**: 170일

---

## 📝 관련 문서

### v2.8.12.5 문서
- `HOTFIX_v2.8.12.5_KAKAO_SDK_RESTORE.md` - Kakao SDK 복구
- `HOTFIX_v2.8.12.5_INTEGRITY_FIX.md` - Integrity 오류 수정
- `DEPLOYMENT_SUCCESS_v2.8.12.5.md` - 배포 성공 보고서
- `PROJECT_STATUS_v2.8.12.5.md` - 프로젝트 상태

### 이전 버전
- `HOTFIX_v2.8.12.4_URGENT_RESERVATION_FIX.md` - 긴급 예약
- `HOTFIX_v2.8.12.3_IMAGE_RESIZE_FIX.md` - 이미지 리사이징
- `FILE_CLEANUP_COMPLETE_v2.8.12.4.md` - 파일 정리

---

## 🤝 기여

### 코드 기여
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

### 버그 리포트
- GitHub Issues 사용
- 재현 방법 상세히 기술
- 스크린샷 첨부

---

## 📞 연락처

- **웹사이트**: https://beautycat.kr
- **이메일**: (추가 필요)
- **GitHub**: (추가 필요)

---

## 📜 라이센스

(라이센스 정보 추가 필요)

---

## 🎉 감사의 말

BeautyCat 플랫폼을 이용해주시는 모든 고객과 샵 운영자분들께 감사드립니다.

**현재 버전**: v2.8.12.5  
**상태**: 🟢 프로덕션 운영 중  
**마지막 업데이트**: 2025-12-16 10:28:02
