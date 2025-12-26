# 🐱🎫 BeautyCat & BeautyKet - 듀얼 브랜드 피부관리 매칭 플랫폼

## 📋 프로젝트 개요

**BeautyCat (뷰티캣)** 과 **BeautyKet (뷰티켓)** 은 고객과 뷰티샵(피부관리실, 네일샵, 왁싱샵 등)을 연결하는 AI 기반 매칭 플랫폼입니다.

### 🌐 듀얼 브랜드 전략
- **🎫 BeautyKet (beautyket.com)**: 프리미엄 피부관리 예약 매칭 플랫폼 (메인 브랜드)
- **🐱 BeautyCat (beautycat.kr)**: 친근한 피부관리실 찾기 서비스 (서브 브랜드)

### 📍 프로젝트 정보
- **메인 URL**: https://beautycat.kr (현재 운영 중)
- **신규 URL**: https://beautyket.com (2026년 1월 추가 예정)
- **현재 버전**: v2.8.13.6.75 (로고 배경색 통일)
- **마지막 업데이트**: 2025-12-25
- **상태**: 🟢 프로덕션 운영 중

---

## 🚀 최근 업데이트

### v2.8.13.6.75 (2025-12-25) 🎨 **NEW!**
**로고 배경색 통일 + 듀얼 브랜드 전략 수립**
- ✅ **로고 배경 추가**: 모든 페이지 로고에 흰색 배경 + 둥근 모서리 적용
- ✅ **시각적 일관성**: 헤더 배경색과 로고 주변색 완전 통일
- ✅ **반응형 디자인**: padding: 8px, border-radius: 8px로 모든 화면 최적화
- ✅ **적용 페이지**: index.html, login.html, admin/customer/shop-dashboard.html
- 🎯 **듀얼 브랜드 전략**: BeautyCat + BeautyKet 동시 운영 계획 수립
- 🔍 **SEO 전략**: "뷰티캣" + "뷰티켓" 양쪽 검색 노출 최적화
- 📄 문서: `COMMIT_GUIDE_v2.8.13.6.75_LOGO_BACKGROUND.md`, `DUAL_BRAND_STRATEGY_COMPLETE.md`

### v2.8.13.6.74 (2025-12-24) 🔧
**로그아웃 완전 초기화 + 관리자 권한 체크 개선**
- ✅ **로그아웃 후 로그인 상태 유지 버그 수정**
- ✅ **관리자 로그인 시 권한 오류 문제 해결**
- ✅ 모든 `localStorage` 세션 항목 완전 제거
- ✅ 고객/샵/관리자 대시보드 로그아웃 통일
- ✅ 관리자 권한 체크 로직 개선 (OR 조건)
- ✅ localStorage 동기화 타이밍 보장
- 📄 문서: `COMMIT_GUIDE_v2.8.13.6.74_LOGOUT_FIX.md`

### v2.8.13.6.73 (2025-12-24) 🎨
**야놀자 스타일 + 로그인 아이콘**
- ✅ **야놀자 스타일**: 로고를 상단 **정중앙**에 배치
- ✅ **Beautyket 풀 로고**: 큰 핑크색 'B' + 'eautyket' 텍스트
- ✅ **로그인 아이콘**: 우측 상단 원형 아이콘 (핑크 → 초록)
- ✅ **로그인 상태 표시**: "로그인 중" 빨간 배지
- ✅ **프로필 드롭다운**: 마이페이지, 로그아웃 메뉴
- ✅ **모든 페이지 통일**: 6개 주요 페이지 일관된 디자인
- 📄 문서: `COMMIT_GUIDE_v2.8.13.6.73_YANOLJA_CENTER_LOGO.md`

### v2.8.13.6.72 (2025-12-23) ⚡
**관리자 직접 로그인 (이메일 불필요)**
- ✅ **1단계 로그인**: 비밀번호 5874 입력 → 바로 대시보드 이동
- ✅ **UX 대폭 개선**: 3단계 → 1단계 (66% 단축)
- ✅ localStorage 세션 자동 저장
- ✅ 로딩 애니메이션 추가
- ✅ 비밀번호 숨김 (●●●●) + 자동 클리어
- 📄 문서: `COMMIT_GUIDE_v2.8.13.6.72_ADMIN_DIRECT_LOGIN.md`

### v2.8.13.6.71 (2025-12-23) 🔐
**관리자 비밀번호 UI 개선 + 보안 강화**
- ✅ 관리자 전용 비밀번호 입력 필드 추가
- ✅ 비밀번호 5874 입력 시 자동 관리자 모드 전환
- ✅ 보안 강화: 비밀번호 숨김 처리 + 자동 클리어
- ✅ Enter 키 지원, 시각적 피드백
- 📄 문서: `COMMIT_GUIDE_v2.8.13.6.71_ADMIN_PASSWORD_INPUT.md`

### v2.8.13.6.70 (2025-12-23) 🔧
**네이버 SDK 콘솔 오류 수정**
- ✅ 네이버 SDK 스크립트 주석 처리
- ✅ Uncaught TypeError 해결
- 📄 문서: `COMMIT_GUIDE_v2.8.13.6.70_NAVER_SDK_REMOVAL.md`

### v2.8.13.6.69 (2025-12-23) ✨
**UI 개선 (로딩 + 에러 처리)**
- ✅ 로딩 애니메이션 (핑크 스피너)
- ✅ 에러 메시지 개선 (빨간 박스 + 흔들림)
- ✅ 약관 위치 변경 (사업자 정보 위)
- 📄 문서: `COMMIT_GUIDE_v2.8.13.6.69_UI_IMPROVEMENTS.md`

### v2.8.13.6.68 (2025-12-23) 🎉
**카카오 로그인 활성화**
- ✅ 카카오 소셜 로그인 연동
- ✅ 자동 사용자 정보 수신
- 📄 문서: `COMMIT_GUIDE_v2.8.13.6.68_KAKAO_ENABLE.md`

---

## 🎯 주요 기능

### 1. 인증 시스템 🔐
- **이메일 로그인**: ✅ 활성화
- **카카오 로그인**: ✅ 활성화 (v2.8.13.6.68)
- **네이버 로그인**: ⏸️ 준비 중
- **관리자 로그인**: ✅ 비밀번호 5874 → 바로 대시보드 (v2.8.13.6.72) ⚡

### 2. 고객 기능
- 상담 신청 (서비스, 지역, 예산)
- 긴급 예약 ⚡ (오늘/내일)
- 지역 기반 매칭 (시/도/구/동)
- 피부 사진 업로드
- 견적서 수신 및 확인

### 3. 샵 기능
- Shop Dashboard (상담 요청 관리)
- 견적서 자동 입력 ✨
- 견적서 템플릿 (저장/불러오기)
- 견적 발송
- 긴급 예약 우선 확인 ⚡

### 4. 관리자 기능 (NEW!)
- 관리자 대시보드
- 공공데이터 업로드 (피부관리실 DB)
- 자동 매칭 시스템
- 사용자/샵 관리

### 5. 공공데이터 시스템 (NEW!)
- CSV 일괄 업로드
- 피부미용업 필터링
- 자동 매칭 알고리즘 (이름 + 위치 기반)
- 유사도 매칭 (Levenshtein Distance)
- 수동 매칭 기능

---

## 📁 주요 파일 구조

```
beautycat/
├── index.html                    # 메인 페이지
├── login.html                    # 로그인 페이지 (v2.8.13.6.71 업데이트)
├── register.html                 # 회원가입 페이지
├── admin-dashboard.html          # 관리자 대시보드
├── import-public-data.html       # 공공데이터 업로드 (NEW!)
│
├── js/
│   ├── auth.js                   # 인증 로직
│   ├── kakao-login.js           # 카카오 로그인 (v2.8.13.6.68)
│   ├── naver-login.js           # 네이버 로그인 (준비중)
│   ├── auto-matching.js         # 자동 매칭 알고리즘 (NEW!)
│   └── config.js                # 설정
│
├── css/
│   ├── tailwind-production.css
│   └── mobile-optimized.css
│
└── 📚 문서/
    ├── README.md                              # 이 파일
    ├── DEPLOYMENT_READY.md                    # 배포 준비 완료
    ├── DEPLOY_FROM_NEW_COMPUTER.md            # 다른 컴퓨터 배포 가이드 (NEW!)
    ├── QUICK_DEPLOY_GUIDE.md                  # 빠른 배포 가이드 (NEW!)
    ├── PUBLIC_DATA_IMPORT_GUIDE.md            # 공공데이터 업로드 가이드
    ├── COMMIT_GUIDE_v2.8.13.6.71_ADMIN_PASSWORD_INPUT.md
    ├── COMMIT_GUIDE_v2.8.13.6.70_NAVER_SDK_REMOVAL.md
    ├── COMMIT_GUIDE_v2.8.13.6.69_UI_IMPROVEMENTS.md
    └── COMMIT_GUIDE_v2.8.13.6.68_KAKAO_ENABLE.md
```

---

## 🚀 배포 가이드

### 현재 컴퓨터에서 배포
```bash
cd /d/beautycat
git add -A
git commit -m "변경사항"
git push origin main
```

### 다른 컴퓨터에서 배포
📄 자세한 가이드: `DEPLOY_FROM_NEW_COMPUTER.md`  
⚡ 빠른 시작: `QUICK_DEPLOY_GUIDE.md`

#### 간단 요약
```bash
# 1. Git 설치
# Windows: https://git-scm.com/download/win

# 2. 프로젝트 클론
git clone https://github.com/your-username/beautycat.git
cd beautycat

# 3. 배포
git pull origin main  # 최신 코드 받기
# ... 파일 수정 ...
git add -A
git commit -m "변경사항"
git push origin main
```

---

## 🔗 주요 링크

- **메인**: https://beautycat.kr/
- **로그인**: https://beautycat.kr/login.html
- **회원가입**: https://beautycat.kr/register.html
- **관리자 대시보드**: https://beautycat.kr/admin-dashboard.html
- **공공데이터 업로드**: https://beautycat.kr/import-public-data.html

---

## 💾 데이터베이스

### 주요 테이블
- **users**: 사용자 정보
- **skincare_shops**: 피부관리실 정보
- **representative_shops**: 대표샵 + 공공데이터
- **consultations**: 상담 신청
- **quotes**: 견적서

### API Endpoints
```
GET    /tables/{table}                # 목록 조회
GET    /tables/{table}/{id}           # 단일 조회
POST   /tables/{table}                # 생성
PUT    /tables/{table}/{id}           # 전체 수정
PATCH  /tables/{table}/{id}           # 부분 수정
DELETE /tables/{table}/{id}           # 삭제
```

---

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Tailwind CSS (CDN)
- **Authentication**: Email, Kakao OAuth
- **Database**: RESTful Table API
- **Hosting**: Cloudflare Pages (beautycat.kr)
- **Version Control**: Git, GitHub

---

## 📊 버전 히스토리

| 버전 | 날짜 | 주요 변경사항 |
|------|------|--------------|
| **v2.8.13.6.75** | **2025-12-25** | **로고 배경색 통일 + 듀얼 브랜드 전략 수립** |
| v2.8.13.6.74 | 2025-12-24 | 로그아웃 완전 초기화 + 관리자 권한 체크 개선 |
| v2.8.13.6.73 | 2025-12-24 | 야놀자 스타일 가운데 로고 (6개 페이지) |
| v2.8.13.6.72 | 2025-12-23 | 관리자 직접 로그인 |
| v2.8.13.6.71 | 2025-12-23 | 관리자 비밀번호 UI 개선 + 보안 강화 |
| v2.8.13.6.70 | 2025-12-23 | 네이버 SDK 오류 수정 |
| v2.8.13.6.69 | 2025-12-23 | UI 개선 (로딩 + 에러 처리) |
| v2.8.13.6.68 | 2025-12-23 | 카카오 로그인 활성화 |

---

## 🎯 다음 단계

### ⭐ 최우선: 듀얼 브랜드 전략 (2026년 1월)
- [ ] **beautyket.com 도메인 추가** (1주일 후)
  - Cloudflare Pages Custom Domain 설정
  - CORS 설정 업데이트 (api.beautycat.kr)
  - 소셜 로그인 URI 추가 (Kakao, Naver)
- [ ] **메타 태그 최적화** (양쪽 도메인)
  - beautyket.com: "뷰티켓" 키워드 집중
  - beautycat.kr: "뷰티캣" 키워드 집중
- [ ] **검색엔진 등록**
  - Google Search Console (beautyket.com)
  - Naver Search Advisor (beautyket.com)
  - Sitemap 제출 (양쪽 도메인)
- [ ] **Canonical 태그 설정**
  - beautycat.kr → beautyket.com (SEO 통합)
- [ ] **크로스 링크 추가**
  - beautyket.com ↔ beautycat.kr (양방향 링크)
- 📄 상세 문서: `DUAL_BRAND_STRATEGY_COMPLETE.md`

### 단기 목표
- [ ] 네이버 로그인 활성화
- [ ] Google 로그인 추가
- [ ] Apple 로그인 추가
- [ ] 관리자 비밀번호 암호화 저장

### 중기 목표
- [ ] 공공데이터 자동 업데이트 (주기적)
- [ ] 매칭 정확도 향상 (AI/ML)
- [ ] 관리자 대시보드 고도화
- [ ] 통계 및 분석 기능
- [ ] 듀얼 브랜드 SEO 효과 측정 (6개월 후)

### 장기 목표
- [ ] 모바일 앱 개발
- [ ] 결제 시스템 통합
- [ ] 리뷰 시스템
- [ ] 예약 자동화

---

## 🌐 듀얼 브랜드 전략

### 🎯 전략 배경
```
❌ 문제: "뷰티캣" 검색 시 경쟁사(beauty-cat.co.kr)만 노출
✅ 해결: BeautyCat + BeautyKet 듀얼 브랜드로 검색 노출 2배 확대
```

### 📊 브랜드 포지셔닝
| 브랜드 | 도메인 | 컨셉 | 타겟 |
|-------|--------|------|------|
| **🎫 BeautyKet** | beautyket.com | 프리미엄 예약 플랫폼 | 20~40대 여성 |
| **🐱 BeautyCat** | beautycat.kr | 친근한 피부관리실 찾기 | 10~30대 여성 |

### 🔍 SEO 전략
```
🎯 beautyket.com (메인):
   - "뷰티켓" 검색 독점 (경쟁 없음)
   - "피부관리 예약" Top 10
   - "뷰티 티켓" Top 5

🎯 beautycat.kr (서브):
   - "뷰티캣" 검색 경쟁 (경쟁사 견제)
   - "피부관리실" Top 10
   - "내 주변 피부관리" Top 10
```

### 📅 전환 일정
```
🟢 2025-12-26: v2.8.13.6.75 배포 + 1주일 안정화
🟡 2026-01-02: beautyket.com 도메인 추가
🟠 2026-01-09: 병렬 운영 시작 (양쪽 도메인)
🔴 2026-01-26: SEO 최적화 집중
🟣 2026-04-26: 6개월 효과 측정
```

### 📈 예상 효과 (6개월 후)
```
✅ "뷰티켓" 검색: 1위 독점
✅ "뷰티캣" 검색: Top 10 진입
✅ 전체 트래픽: +500% ↑
✅ 검색 노출 면적: 2배 확대
```

### 📚 관련 문서
- `DUAL_BRAND_STRATEGY_COMPLETE.md` - 상세 전략 및 실행 계획
- `PUSH_TOMORROW_v2.8.13.6.75.md` - 내일 배포 가이드
- `DOMAIN_CHANGE_PLAN_BEAUTYKET.md` - 기술적 전환 계획

---

## 👥 기여자

- **개발팀**: BeautyCat & BeautyKet 개발팀
- **문의**: beautycat@example.com

---

## 📄 라이선스

이 프로젝트는 BeautyCat & BeautyKet의 소유입니다.

---

**마지막 업데이트**: 2025-12-25 (v2.8.13.6.75 - 듀얼 브랜드 전략 수립)
