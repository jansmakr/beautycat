# 🐱 BeautyCat - 피부관리 샵 매칭 플랫폼

## 📋 프로젝트 개요

BeautyCat은 고객과 뷰티샵(피부관리실, 네일샵, 왁싱샵 등)을 연결하는 AI 기반 매칭 플랫폼입니다.

- **프로젝트 URL**: https://beautycat.kr
- **현재 버전**: v2.8.13.6.73 (Beautyket 로고 복원)
- **마지막 업데이트**: 2025-12-24
- **상태**: 🟢 프로덕션 운영 중

---

## 🚀 최근 업데이트

### v2.8.13.6.73 (2025-12-24) 🎨 **NEW!**
**야놀자 스타일 가운데 로고 배치**
- ✅ **야놀자 스타일**: 로고를 상단 **정중앙**에 배치
- ✅ **Beautyket 풀 로고**: 큰 핑크색 'B' + 'eautyket' 텍스트
- ✅ **모든 페이지 통일**: 메인, 로그인, 회원가입, 3개 대시보드 (총 6개)
- ✅ **좌우 균형**: 양쪽 메뉴로 시각적 균형
- ✅ **프리미엄 UI/UX**: 세련되고 일관된 디자인
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
| v2.8.13.6.73 | 2025-12-24 | 야놀자 스타일 가운데 로고 (6개 페이지) |
| v2.8.13.6.72 | 2025-12-23 | 관리자 직접 로그인 |
| v2.8.13.6.71 | 2025-12-23 | 관리자 비밀번호 UI 개선 + 보안 강화 |
| v2.8.13.6.70 | 2025-12-23 | 네이버 SDK 오류 수정 |
| v2.8.13.6.69 | 2025-12-23 | UI 개선 (로딩 + 에러 처리) |
| v2.8.13.6.68 | 2025-12-23 | 카카오 로그인 활성화 |

---

## 🎯 다음 단계

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

### 장기 목표
- [ ] 모바일 앱 개발
- [ ] 결제 시스템 통합
- [ ] 리뷰 시스템
- [ ] 예약 자동화

---

## 👥 기여자

- **개발팀**: BeautyCat 개발팀
- **문의**: beautycat@example.com

---

## 📄 라이선스

이 프로젝트는 BeautyCat의 소유입니다.

---

**마지막 업데이트**: 2025-12-24 (v2.8.13.6.73)
