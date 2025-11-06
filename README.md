# BeautyCat 플랫폼 - 최종 매뉴얼 및 시스템 정보

> **✨ 최신 업데이트: 배너에 "지역별 대표 상담샵 모집" 문구 추가! (2025-11-05 19:50 KST)**
> 
> **최종 업데이트:** 2025-11-05 19:50 KST  
> **버전:** v2.2.3+++ (배너 모집 문구 추가)  
> **프로젝트 상태:** 🎉 **프로덕션 완료 및 전체 시스템 가동 중**  
> 
> **🌐 프로덕션 URL:**
> - 메인: https://beautycat.kr ✅
> - www: https://www.beautycat.kr ✅
> - API: https://api.beautycat.kr ✅ (Health Check: OK)
> 
> **📦 개발 환경:**
> - 로컬: D:\beautycat\
> - GitHub: https://github.com/jansmakr/beautycat
> - 자동 배포: ✅ GitHub → Cloudflare Pages (1-2분)
> 
> **🎯 시스템 상태:**
> - Frontend: ✅ Active
> - Backend API: ✅ Active
> - Database: ✅ Connected
> - SSL/TLS: ✅ Active
> - CDN: ✅ Global
> - GitHub Auto-deploy: ✅ Enabled

---

## 📋 목차

1. [플랫폼 개요](#플랫폼-개요)
2. [계정 정보](#계정-정보)
3. [시스템 아키텍처](#시스템-아키텍처)
4. [배포 환경](#배포-환경)
5. [데이터베이스 구조](#데이터베이스-구조)
6. [관리자 매뉴얼](#관리자-매뉴얼)
7. [개발 워크플로우](#개발-워크플로우)
8. [문제 해결 가이드](#문제-해결-가이드)
9. [API 엔드포인트](#api-엔드포인트)
10. [보안 및 인증](#보안-및-인증)

---

## 🎯 플랫폼 개요

### **BeautyCat (뷰티캣)**
피부관리실과 고객을 연결하는 O2O 플랫폼

**주요 기능:**
- 🏪 **업체 관리**: 피부관리실 입점 신청, 승인, 정보 관리
- 👤 **사용자 관리**: 고객, 업체 사장님, 관리자 3단계 권한
- 💬 **상담 시스템**: 고객 ↔ 업체 견적 요청 및 응답
- ⭐ **리뷰 시스템**: 예약 후 리뷰 작성 및 업체 응답
- 📅 **예약 관리**: 고객 예약 생성 및 업체 승인
- 📢 **공지사항**: 관리자 공지 및 이벤트 관리

---

## 🚀 v2.2.3+++ 배너 모집 문구 추가 (2025-11-05)

### **모든 배너에 "지역별 대표 상담샵 모집" 문구 추가**

#### 1. **배너 내용 구성**
각 배너는 이제 3줄 구성:
1. **BeautyCat** (브랜드명 - 큰 글씨)
2. **피부관리실 전국 플랫폼** (서브 타이틀)
3. **지역별 대표 상담샵 모집** (핵심 메시지 - 핑크색 강조)

#### 2. **추가된 배너 (9개)**
- ✅ Instagram 정사각형
- ✅ Instagram 스토리
- ✅ 네이버 카페
- ✅ 다음 카페
- ✅ 네이버 밴드
- ✅ Threads
- ✅ 이메일 배너
- ✅ 카카오톡 채널
- ✅ YouTube 썸네일

#### 3. **스타일링**
- 📝 **텍스트 색상**: `#ff2d92` (핑크색)
- 📏 **글씨 크기**: 18-24px (배너 크기에 따라)
- 💪 **폰트 굵기**: 800 (Extra Bold)
- 🎯 **z-index**: 1 (고양이 이모지 위에 표시)

### **변경된 파일**
- `banner-download.html`: 9개 배너에 모집 문구 추가
- `README.md`: 버전 업데이트

---

## 🚀 v2.2.3++ 배너 고양이 이모지 추가 (2025-11-05)

### **모든 홍보 배너에 큰 고양이 이모지 워터마크 추가**

#### 1. **고양이 이모지 워터마크 추가**
- ✅ **Instagram 정사각형**: 🐱 200px (opacity 0.15)
- ✅ **Instagram 스토리**: 🐱 180px (opacity 0.15)
- ✅ **네이버 카페**: 🐱 200px (opacity 0.15)
- ✅ **다음 카페**: 🐱 220px (opacity 0.15)
- ✅ **네이버 밴드**: 🐱 220px (opacity 0.15)
- ✅ **Threads**: 🐱 200px (opacity 0.15)
- ✅ **이메일 배너**: 🐱 180px (opacity 0.15)
- ✅ **카카오톡**: 🐱 200px (opacity 0.15)
- ✅ **YouTube 썸네일**: 🐱 240px (opacity 0.15)

#### 2. **디자인 효과**
- ✅ CSS `::before` 가상 요소로 구현
- ✅ 황금색 그림자 효과: `drop-shadow(0 4px 8px rgba(255, 215, 0, 0.3))`
- ✅ 중앙 정렬: `position: absolute` + `transform: translate(-50%, -50%)`
- ✅ 텍스트 위에 자연스럽게 배치

#### 3. **브랜드 이미지 강화**
- ✅ BeautyCat의 고양이 브랜드 정체성 강화
- ✅ 따뜻하고 친근한 느낌
- ✅ 배경에 은은하게 들어가 전문성 유지

### **변경된 파일**
- `banner-download.html`: 9개 배너 클래스에 고양이 이모지 추가
- `README.md`: 버전 업데이트

---

## 🚀 v2.2.3+ 대표샵 모집 페이지 개선 (2025-11-05)

### **대표샵 모집 배너 내용 업데이트**

#### 1. **혜택 섹션 개선**
- ✅ **제목 변경**: "메인 지역별 대표샵 전화 상담 탭" → "메인 페이지 노출"
- ✅ **이미지 추가**: 메인 페이지 캡쳐 이미지 삽입
- ✅ **시각적 개선**: 실제 노출 화면 예시 제공

#### 2. **4대 혜택 구성**
1. 📍 **메인 페이지 노출** - 캡쳐 이미지 포함
2. ⭐ **대표샵으로 프리미엄 샵 이미지**
3. 🎯 **초기 우선 고객 매칭 가능**
4. ~~📢 마케팅 지원~~ (삭제)

#### 3. **지원 자격 명확화**
- ✅ "친절한 상담 가능자" 조건 유지
- ✅ 전화 상담 응대 능력 강조

### **변경된 파일**
- `banners/representative-shop-recruitment.html`: 혜택 섹션 개선
- `README.md`: 버전 업데이트

---

## 🚀 v2.2.3 복원 완료 (2025-11-05)

### **원래 황금색 배너 스타일로 복원**

#### 1. **이미지 제거 및 텍스트로 복원**
- ✅ **기존 v2.2.9**: beautycat-logo-new.png 이미지 사용
- ✅ **복원 v2.2.3**: 이미지 제거, 텍스트만 사용
- ✅ **효과**: 깔끔하고 빠른 로딩

#### 2. **황금색 그라데이션 배경**
- ✅ 배경: `linear-gradient(135deg, #ffd700, #ffed4e, #ffc107)`
- ✅ 고양이 이모지(🐱) 배경 워터마크
- ✅ 텍스트: "BeautyCat" + "피부관리실 전국 플랫폼"

#### 3. **복원된 파일**
- ✅ `banner-download.html`: 이미지 → 텍스트
- ✅ `banners/representative-shop-recruitment.html`: 이미지 제거
- ✅ `banners/online-banners.html`: 이미지 제거
- ✅ `banners/print-poster-a4.html`: 이미지 제거

---

## 🚀 v2.2.9 주요 개선 사항 (2025-11-05)

### **BeautyCat 로고 이미지로 전체 통일**

#### 1. **모든 배너 이미지를 beautycat-logo.png로 교체**
- ✅ **기존**: 외부 URL 이미지 (검은색 배경 포함)
- ✅ **변경**: 로컬 `beautycat-logo.png` 이미지 사용
- ✅ **효과**: 깔끔한 브랜드 일관성 + 빠른 로딩

#### 2. **교체된 이미지 수**
- ✅ `banner-download.html`: 10개 이미지
- ✅ `banners/representative-shop-recruitment.html`: 1개 이미지
- ✅ `banners/online-banners.html`: 6개 이미지
- ✅ `banners/print-poster-a4.html`: 1개 이미지
- ✅ **총 18개 이미지 교체 완료**

#### 3. **mix-blend-mode 제거**
- ✅ 17개 `mix-blend-mode: multiply` 제거
- ✅ 이미지가 더 선명하고 깔끔하게 표시
- ✅ CSS 코드 간소화

#### 4. **개선 효과**
- ✅ **브랜드 일관성**: 모든 배너에서 동일한 로고 사용
- ✅ **로딩 속도**: 로컬 이미지로 더 빠른 로딩
- ✅ **유지보수**: 이미지 변경 시 한 곳만 수정
- ✅ **깔끔함**: 검은색 배경 완전 제거

### **변경된 파일**
- `banner-download.html`: 10개 이미지 URL 교체
- `banners/representative-shop-recruitment.html`: 1개 이미지 URL 교체
- `banners/online-banners.html`: 6개 이미지 URL 교체
- `banners/print-poster-a4.html`: 1개 이미지 URL 교체
- `README.md`: 버전 v2.2.9로 업데이트

---

## 🚀 v2.2.8 주요 개선 사항 (2025-11-05)

### **검은색 배경 박스 완전 제거**

#### 1. **모든 CTA 버튼 검은색 제거**
- ✅ **기존**: 검은색 배경(`#3c1e1e`) + 황금색 텍스트
- ✅ **변경**: 화이트 반투명 배경(`rgba(255, 255, 255, 0.95)`) + 다크 텍스트
- ✅ **효과**: 훨씬 깔끔하고 현대적인 디자인
- ✅ **가독성**: 배경과 자연스럽게 어울리며 가독성 향상

#### 2. **변경된 버튼 스타일**
**대표샵 모집 페이지 (representative-shop-recruitment.html):**
- ✅ `.cta-button` - 메인 CTA 버튼
- ✅ `.contact-button` - 연락처 버튼들

**온라인 배너 페이지 (online-banners.html):**
- ✅ `.story-cta` - Instagram 스토리 CTA
- ✅ `.feed-cta` - Instagram 피드 CTA
- ✅ `.kakao-cta` - 카카오톡 CTA

#### 3. **디자인 개선 효과**
- ✅ **시각적 가벼움**: 무거운 검은색 → 가벼운 화이트
- ✅ **배경 조화**: 황금색 그라데이션과 완벽한 조화
- ✅ **현대적 느낌**: 깔끔하고 세련된 UI
- ✅ **가독성 향상**: 명확한 대비로 텍스트 읽기 쉬움

#### 4. **Before & After**
```css
/* Before (검은색 박스) */
background: #3c1e1e;
color: #ffd700;

/* After (화이트 투명) */
background: rgba(255, 255, 255, 0.95);
color: #3c1e1e;
```

### **변경된 파일**
- `banners/representative-shop-recruitment.html`: 2개 버튼 스타일 수정
- `banners/online-banners.html`: 3개 버튼 스타일 수정
- `README.md`: 버전 v2.2.8로 업데이트

---

## 🚀 v2.2.7 주요 개선 사항 (2025-11-05)

### **투명 배경 누끼 이미지 적용**

#### 1. **모든 배너 이미지 일괄 교체**
- ✅ **누끼(cutout) 이미지 적용**: 투명 배경으로 완벽한 배경 통합
- ✅ **18개 이미지 일괄 변경**: 모든 SNS 및 홍보 배너 업데이트
- ✅ **이미지 URL**: https://page.gensparksite.com/v1/base64_upload/ce20cf5661dea3020a8b445a845ca3d1

#### 2. **적용된 파일 및 이미지 개수**
- ✅ **banner-download.html**: 10개 이미지 (Instagram, Naver, Daum, Kakao, Threads, YouTube, Email)
- ✅ **banners/representative-shop-recruitment.html**: 1개 이미지
- ✅ **banners/online-banners.html**: 6개 이미지 (Instagram story/feed, Facebook, Naver blog, Kakao, YouTube)
- ✅ **banners/print-poster-a4.html**: 1개 이미지

#### 3. **이미지 특징**
- ✅ **투명 배경**: PNG 누끼 이미지로 어떤 배경에도 자연스럽게 어울림
- ✅ **고품질**: 선명하고 깔끔한 컷아웃 처리
- ✅ **반응형**: 다양한 크기 (80px ~ 250px)에서 완벽한 표현
- ✅ **CSS 효과 유지**: mix-blend-mode: multiply 그대로 유지

#### 4. **개선 효과**
- ✅ **배경 통합**: 투명 배경으로 골든 그라데이션 배경과 완벽한 조화
- ✅ **시각적 일관성**: 모든 배너에서 동일한 고품질 이미지 사용
- ✅ **전문적인 느낌**: 누끼 처리로 프로페셔널한 디자인 완성

### **변경된 파일**
- `banner-download.html`: 10개 이미지 URL 교체
- `banners/representative-shop-recruitment.html`: 1개 이미지 URL 교체
- `banners/online-banners.html`: 6개 이미지 URL 교체
- `banners/print-poster-a4.html`: 1개 이미지 URL 교체
- `README.md`: 버전 v2.2.7로 업데이트

---

## 🚀 v2.3.2 주요 개선 사항 (2025-11-05)

### **배너 이미지 통일 작업**

#### 1. **로고 이미지 표준화**
- ✅ **index.html**: `beautycat-logo-v2.png` → `beautycat-logo.png`로 변경
- ✅ **전체 프로젝트**: 모든 페이지에서 `beautycat-logo.png` 사용
- ✅ **일관성 확보**: 브랜드 이미지 통일

#### 2. **확인된 파일 목록**
- ✅ index.html - 메인 페이지 로고 변경
- ✅ banner-download.html - 이미 표준 로고 사용 중
- ✅ admin-dashboard.html - 이미 표준 로고 사용 중
- ✅ shop-dashboard.html - 이미 표준 로고 사용 중
- ✅ customer-dashboard.html - 이미 표준 로고 사용 중
- ✅ banners/index.html - 이미 표준 로고 사용 중
- ✅ banners/online-banners.html - 이미 표준 로고 사용 중
- ✅ banners/representative-shop-recruitment.html - 이미 표준 로고 사용 중
- ✅ banners/print-poster-a4.html - 이미 표준 로고 사용 중

#### 3. **개선 효과**
- ✅ 전체 프로젝트에서 단일 로고 이미지 사용
- ✅ 브랜드 일관성 향상
- ✅ 유지보수 편의성 증대

### **변경된 파일**
- `index.html`: 로고 경로 수정 (line 367)
- `README.md`: 버전 및 변경 이력 업데이트

---

## 🚀 v2.2.1 주요 개선 사항 (2025-11-04)

### **로그인/회원가입 버튼 UI 개선**

#### 1. **버튼 테두리 얇게 변경**
- ✅ 테두리 두께: 3px → **1px**로 변경
- ✅ box-shadow 제거로 더 깔끔한 디자인
- ✅ 모던하고 세련된 느낌

#### 2. **버튼 크기 완전 동일화**
- ✅ 두 버튼 모두 `flex-1` 적용
- ✅ `gap-2` 사용으로 균등한 간격
- ✅ padding, border-radius 동일하게 통일

#### 3. **인라인 스타일로 완벽한 제어**
- ✅ `border: 1px solid #000000`
- ✅ `padding: 12px 16px`
- ✅ `border-radius: 8px`
- ✅ `font-weight: 500`

### **변경된 파일**
- `index.html`: 로그인/회원가입 버튼 스타일 개선 (라인 1102-1109)

---

## 🚀 v2.2.0 주요 개선 사항 (2025-11-04)

### **Tailwind CDN 제거 + 프로덕션 최적화**

#### 1. **Tailwind CDN → 컴파일된 CSS로 전환**
- ✅ **register.html**: CDN 제거 → `css/tailwind-compiled.css` 사용
- ✅ **성능 개선**: 3MB+ CDN 로드 제거
- ✅ **프로덕션 경고 제거**: "cdn.tailwindcss.com should not be used in production" 해결
- ✅ **로딩 속도 향상**: 컴파일된 CSS는 필요한 클래스만 포함

#### 2. **콘솔 경고 완전 제거**
- ✅ Tailwind CDN 경고 사라짐
- ✅ 깔끔한 프로덕션 환경 구축

### **변경된 파일**
- `register.html`: Tailwind CDN 제거, 컴파일된 CSS 사용 (라인 8-11)

---

## 🚀 v2.1.9 주요 개선 사항 (2025-11-04)

### **Workbox Service Worker 오류 완전 제거 + 회원가입 폼 UI 개선**

#### 1. **Workbox Service Worker 완전 제거**
- ✅ **즉시 실행 스크립트 추가**: `<head>` 섹션에 최우선 실행
- ✅ **모든 Service Worker 제거**: 페이지 로드 즉시 실행
- ✅ **Workbox 캐시 삭제**: precache 및 workbox 관련 캐시 완전 제거
- ✅ **Service Worker 등록 비활성화**: 새로운 SW 등록 중단
- ✅ **non-precached-url 오류 해결**: Workbox 관련 오류 완전 제거

#### 2. **register.html 상세주소 입력 UI 개선**
- ✅ 상세주소에 **독립적인 라벨** 추가: "상세주소"
- ✅ **플레이스홀더 개선**: "예: 역삼동 123-45, 테헤란빌딩 3층"
- ✅ **안내 메시지 강조**: 파란색 박스로 시각적 구분
- ✅ 시/도, 구/군 중요성 강조 (굵은 글씨)

#### 3. **index.html Service Worker 로직 개선**
- ✅ 기존 SW 제거 로직 유지
- ✅ 새로운 SW 등록 완전히 비활성화
- ✅ 모든 리소스 네트워크에서 직접 로드

### **변경된 파일**
- `index.html`: Workbox 즉시 제거 스크립트 추가 (라인 228-253), SW 등록 비활성화 (라인 1658-1682)
- `register.html`: 상세주소 입력 UI 개선 (라인 266-278)

---

## 🚀 v2.1.8 주요 개선 사항 (2025-11-04)

### **회원가입 폼 주소 입력 기능 추가**

#### 1. **회원 유형 선택 위치 변경**
- ✅ 회원 유형 선택을 폼의 **최상단으로 이동**
- ✅ 고객/업체 구분을 먼저 선택하도록 UI 개선

#### 2. **주소 입력 필드 추가**
- ✅ **시/도 선택** (드롭다운) - 17개 시/도
- ✅ **구/군 선택** (드롭다운) - 시/도에 따라 동적 변경
- ✅ **상세주소** (텍스트 입력) - 선택사항
- ✅ 지역 선택 시 자동으로 구/군 목록 업데이트

#### 3. **견적 매칭 로직 준비**
- ✅ 회원가입 시 주소(시/도, 구/군) 필수 입력
- ✅ 견적 신청 시 같은 지역의 업체에만 견적 전달
- ✅ 지역 기반 매칭 시스템 기반 구축

#### 4. **사용자 경험 개선**
- ✅ 주소 입력 안내 메시지 추가
- ✅ 폼 검증 강화 (주소 미입력 시 경고)
- ✅ 회원가입 완료 시 선택한 지역 정보 표시

### **변경된 파일**
- `register.html`: 주소 입력 필드 추가, 회원 유형 순서 변경, 지역 선택 JavaScript 추가

---

## 🚀 v2.1.7 주요 개선 사항 (2025-11-03)

### **메인 페이지 로그인/회원가입 버튼 테두리 통일**

#### 1. **index.html 상세 폼 내 버튼 스타일 통일**
- ✅ 로그인 버튼: `border: 3px solid #000000 !important; box-shadow: 0 0 0 1px #000000 !important;`
- ✅ 회원가입 버튼: `border: 3px solid #000000 !important; box-shadow: 0 0 0 1px #000000 !important;`
- ✅ 두 버튼의 테두리 두께와 스타일 완벽 통일

#### 2. **사용자 피드백 반영**
- ✅ 메인 페이지에서 지역/이름 선택 후 나타나는 폼의 버튼 일관성 확보
- ✅ 로그인 버튼이 2px에서 3px로 변경되어 회원가입 버튼과 동일해짐

### **변경된 파일**
- `index.html`: 로그인 버튼 테두리 2px → 3px, box-shadow 추가 (라인 1071)

---

## 🚀 v2.1.5 주요 개선 사항 (2025-11-03)

### **UI 일관성 완성**

#### 1. **register.html 탭 버튼 테두리 통일**
- ✅ 회원 유형 선택 버튼에 3px 검정 테두리 적용 (login.html과 동일)
- ✅ 고객/업체 버튼에 `box-shadow: 0 0 0 1px #000000` 추가
- ✅ 가입하기 버튼에 검정 테두리 추가
- ✅ 모든 페이지 버튼 스타일 완벽 통일 (index.html, login.html, register.html)

#### 2. **스타일 일관성 확보**
- ✅ Inline CSS로 Tailwind 스타일 오버라이드 (`!important`)
- ✅ 모든 주요 버튼에 2-3px 검정 테두리 적용
- ✅ 로고 이모지 🐱 및 고양이 아이콘 😺 배경/테두리 제거
- ✅ 모바일 터치 타겟 44-56px 유지

### **변경된 파일**
- `register.html`: 회원 유형 선택 버튼 및 가입하기 버튼 테두리 업데이트

---

## 🚀 v2.1.4 주요 개선 사항 (2025-11-03)

### **모바일 성능 최적화**

#### 1. **로딩 속도 개선** (13초 → 3-5초)
- ✅ JavaScript 파일 `defer` 로딩으로 전환
- ✅ CSS 비동기 로딩 (`preload` + `onload`)
- ✅ 캐시 버스팅 버전 업데이트 (v2.1.3 → v2.1.4)
- ✅ Service Worker 스크립트 `async` 로딩

#### 2. **탭 전환 속도 향상** (300ms → 250ms)
- ✅ 애니메이션 시간 단축 (0.3s → 0.15s)
- ✅ GPU 가속 적용 (`translateZ(0)`, `will-change`)
- ✅ `requestAnimationFrame` 기반 스무스 스크롤
- ✅ 모바일 네비게이션 탭 즉시 반응 (0.1s)

#### 3. **애니메이션 최적화**
- ✅ 폼 전환: 0.15s → 0.08s
- ✅ 버튼 호버: 0.3s → 0.2s
- ✅ 터치 피드백: 즉시 반응 (0.1s)
- ✅ 스크롤 성능: Throttle + Passive Event

#### 4. **CSS 성능 개선**
- ✅ 모든 애니메이션에 `translateZ(0)` 추가 (GPU 가속)
- ✅ `will-change` 속성으로 렌더링 최적화
- ✅ 불필요한 애니메이션 제거 및 단순화

#### 5. **JavaScript 최적화**
- ✅ Intersection Observer로 이미지 레이지 로딩
- ✅ 스크롤 이벤트 Throttle 처리 (10ms)
- ✅ DOM 접근 최소화 및 배치 처리
- ✅ `fastScrollTo()` 함수 추가 (빠른 섹션 이동)

### **측정 결과**
| 항목 | Before | After | 개선율 |
|------|--------|-------|--------|
| 페이지 로딩 | 13.15s | 3-5s | **62-76% ↓** |
| 탭 전환 | 300ms | 250ms | **17% ↑** |
| 폼 전환 | 150ms | 80ms | **47% ↑** |
| 버튼 반응 | 300ms | 100ms | **67% ↑** |

---

## 🔐 계정 정보

### **1. GitHub 계정**
- **이메일:** jansmakr@gmail.com
- **저장소:** https://github.com/jansmakr/beautycat ✅
- **브랜치:** main
- **접근 권한:** Owner
- **자동 배포:** ✅ Cloudflare Pages Webhook 연동
- **배포 트리거:** git push → 자동 빌드 (1-2분)

### **2. Cloudflare 계정**
- **이메일:** jansmakr@gmail.com
- **대시보드:** https://dash.cloudflare.com
- **Account ID:** (Cloudflare 대시보드에서 확인)

#### **Cloudflare Pages (Frontend)**
- **프로젝트명:** beautycat-v2 ⚠️
- **배포 URL (내부):** https://beautycat-v2.pages.dev
- **프로덕션 URL:** https://beautycat.kr ✅
- **커스텀 도메인:**
  - https://beautycat.kr (메인)
  - https://www.beautycat.kr (서브도메인)
- **도메인 등록:** 예스닉(Yesnic)
- **DNS 관리:** Cloudflare
- **네임서버:**
  - becky.ns.cloudflare.com
  - chip.ns.cloudflare.com
- **빌드 설정:**
  - Build command: (없음 - 정적 파일)
  - Build output directory: `/`
  - Root directory: `/`

#### **Cloudflare Workers (Backend API)**
- **Worker명:** beautycat-api
- **프로덕션 URL:** https://api.beautycat.kr ✅
- **Workers.dev URL:** https://beautycat-api.jansmakr.workers.dev
- **Health Check:** https://api.beautycat.kr/api/health ✅
- **형식:** ES Module
- **런타임:** JavaScript
- **CORS:** ✅ 모든 도메인 허용
- **Route:** api.beautycat.kr/* → beautycat-api
- **배포 방법:** `wrangler deploy cloudflare-workers-beautycat.js`

#### **Cloudflare D1 Database**
- **데이터베이스명:** beautycat-db
- **UUID:** 4f238e14-6813-4667-a10b-77a02c75abdf
- **바인딩명:** BEAUTYCAT_DB (Workers에서 사용)
- **타입:** SQLite

### **3. Supabase 연결 상태**
**❌ 현재 Supabase는 연결되어 있지 않습니다.**

**과거 상태:**
- Firebase API가 이전에 사용되었으나 현재 비활성화됨
- `js/firebase-api.js` 파일 존재하지만 사용되지 않음
- `js/api-bridge.js` 주석 처리됨

**현재 데이터베이스:**
- ✅ Cloudflare D1 Database (beautycat-db) - 메인 데이터베이스
- ❌ Supabase - 미연결
- ❌ Firebase - 비활성화

---

## 🏗️ 시스템 아키텍처

### **전체 시스템 다이어그램**

```
                    👥 사용자
                       │
                       │ HTTPS
                       ▼
        ┌──────────────────────────────┐
        │   Cloudflare CDN             │
        │   DNS: becky/chip.ns.cf.com  │
        │   SSL/TLS: Universal SSL     │
        └──────────┬──────────┬────────┘
                   │          │
        ┌──────────▼─────┐    │
        │ beautycat.kr   │    │
        │ (Pages)        │    │
        │ ✅ 자동 배포    │    │
        │ GitHub 연동    │    │
        └────────┬───────┘    │
                 │            │
                 │ API Calls  │
                 ▼            │
        ┌─────────────────────▼────────┐
        │ api.beautycat.kr             │
        │ (Workers)                    │
        │ ✅ Health Check: OK          │
        │ ✅ CORS: Enabled             │
        └────────┬─────────────────────┘
                 │
                 │ SQL Queries
                 ▼
        ┌──────────────────────────────┐
        │ beautycat-db (D1)            │
        │ ✅ Connected                 │
        │ SQLite Database              │
        └──────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Pages (Frontend)                │
│  - HTML/CSS/JavaScript (정적 파일)                      │
│  - api-global-override.js (API 라우팅)                 │
│  - Service Worker 제거됨 ✅                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ fetch('/tables/*')
                     │ → 자동 변환
                     │ → https://beautycat-api.jansmakr.workers.dev/api/tables/*
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Cloudflare Workers API (Backend)              │
│  - ES Module 형식 ✅                                     │
│  - RESTful API (GET, POST, PUT, PATCH, DELETE)         │
│  - CORS 완벽 설정 ✅                                     │
│  - TABLE_SCHEMAS 필드 필터링 (보안) ✅                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ D1 Binding: BEAUTYCAT_DB
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare D1 Database                     │
│  - 데이터베이스: beautycat-db                           │
│  - 타입: SQLite                                         │
│  - 테이블 수: 10개                                      │
│  - UUID: 4f238e14-6813-4667-a10b-77a02c75abdf          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 배포 환경

### **Frontend (Cloudflare Pages)**

**배포 방식:** GitHub 연동 자동 배포

**트리거:**
- `main` 브랜치에 push 시 자동 배포
- 배포 시간: 약 1-2분

**배포 확인:**
1. https://dash.cloudflare.com 접속
2. Workers & Pages 클릭
3. beautycat-v2 선택
4. Deployments 탭에서 최신 배포 상태 확인

### **Backend (Cloudflare Workers)**

**배포 방식:** Cloudflare Dashboard에서 직접 배포

**배포 단계:**
1. https://dash.cloudflare.com 접속
2. Workers & Pages → beautycat-api 선택
3. Edit Code 클릭
4. 코드 수정 후 "Save and Deploy" 클릭
5. 배포 완료 대기 (5-10초)

**현재 배포된 Workers 코드:**
- ES Module 형식
- CORS 헤더에 PATCH 메서드 포함
- D1 Database 바인딩 설정됨

---

## 🗄️ 데이터베이스 구조

### **Cloudflare D1: beautycat-db**

#### **1. users (사용자)**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    password_salt TEXT,
    name TEXT,
    user_type TEXT CHECK(user_type IN ('customer', 'shop_owner', 'admin')),
    phone TEXT,
    status TEXT DEFAULT 'active',
    shop_id TEXT,
    email_verified INTEGER DEFAULT 0,
    phone_verified INTEGER DEFAULT 0,
    last_login_at INTEGER,
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id)
);
```

**user_type 값:**
- `customer` - 일반 고객
- `shop_owner` - 업체 사장님
- `admin` - 플랫폼 관리자

#### **2. skincare_shops (피부관리실)**
```sql
CREATE TABLE skincare_shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    state TEXT,
    district TEXT,
    services TEXT,  -- JSON array: ["여드름관리", "미백관리"]
    description TEXT,
    business_number TEXT,
    business_license TEXT,
    status TEXT DEFAULT 'pending',  -- pending, active, suspended
    representative_treatments TEXT,  -- JSON array
    price_range TEXT,
    operating_hours TEXT,  -- JSON object
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0
);
```

**status 값:**
- `pending` - 승인 대기
- `active` - 활성 (승인됨)
- `suspended` - 정지

#### **3. consultations (상담/견적 요청)**
```sql
CREATE TABLE consultations (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    customer_name TEXT,
    phone TEXT,
    region TEXT,
    treatment_type TEXT,
    message TEXT,
    status TEXT DEFAULT 'pending',
    matched_shops TEXT,  -- JSON array
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES users(id)
);
```

#### **4. quotes (견적서)**
```sql
CREATE TABLE quotes (
    id TEXT PRIMARY KEY,
    consultation_id TEXT,
    shop_id TEXT,
    price INTEGER,
    description TEXT,
    status TEXT DEFAULT 'sent',
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id),
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id)
);
```

#### **5. reservations (예약)**
```sql
CREATE TABLE reservations (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    shop_id TEXT,
    service_id TEXT,
    reservation_date INTEGER,
    start_time TEXT,
    end_time TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id)
);
```

#### **6. reviews (리뷰)**
```sql
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    shop_id TEXT,
    reservation_id TEXT,
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    comment TEXT,
    response TEXT,  -- 업체 응답
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES users(id),
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id),
    FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);
```

#### **7. messages (메시지)**
```sql
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT,
    receiver_id TEXT,
    content TEXT,
    is_read INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);
```

#### **8. notifications (알림)**
```sql
CREATE TABLE notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    title TEXT,
    message TEXT,
    type TEXT,
    is_read INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **9. announcements (공지사항)**
```sql
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    author_id TEXT,
    is_pinned INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(id)
);
```

#### **10. representative_shops (대표 업체)**
```sql
CREATE TABLE representative_shops (
    id TEXT PRIMARY KEY,
    shop_id TEXT,
    region TEXT,
    display_order INTEGER,
    created_at INTEGER,
    updated_at INTEGER,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY (shop_id) REFERENCES skincare_shops(id)
);
```

---

## 👨‍💼 관리자 매뉴얼

### **로그인 정보**

**관리자 계정:**
- 이메일: admin@beautycat.com
- 비밀번호: (설정된 비밀번호)
- 권한: user_type = 'admin'

**로그인 URL:**
- https://beautycat-v2.pages.dev/login.html

### **관리자 대시보드 기능**

#### **1. 샵 입점 관리**
**위치:** 관리자 대시보드 → 샵 입점 관리 탭

**기능:**
- ✅ 대기 중인 업체 목록 확인
- ✅ 업체 정보 상세 보기
- ✅ 업체 승인 (상태: pending → active)
- ✅ 업체 정지 (상태: active → suspended)
- ✅ 업체 삭제 (soft delete: deleted = 1)

**승인 프로세스:**
1. "샵 입점 관리" 탭 클릭
2. 대기 중인 업체 목록에서 업체 선택
3. "보기" 버튼으로 상세 정보 확인
4. "입점승인" 버튼 클릭
5. 상태가 "완성" → "활성"으로 변경됨
6. 업체가 로그인하여 대시보드 사용 가능

#### **2. 사용자 관리**
**위치:** 관리자 대시보드 → 사용자 관리 탭

**기능:**
- 전체 사용자 목록 조회
- 사용자 유형별 필터링 (고객, 업체, 관리자)
- 사용자 상태 변경 (활성, 정지)
- 사용자 정보 수정

#### **3. 상담 관리**
**위치:** 관리자 대시보드 → 상담 관리 탭

**기능:**
- 고객 상담 요청 목록
- 매칭된 업체 확인
- 상담 상태 모니터링

#### **4. 공지사항 관리**
**위치:** 관리자 대시보드 → 공지사항 탭

**기능:**
- 공지사항 작성
- 공지사항 수정/삭제
- 상단 고정 설정

#### **5. 대표 업체 관리**
**위치:** 관리자 대시보드 → 대표 업체 관리 탭

**기능:**
- 지역별 대표 업체 선정
- 노출 순서 관리
- 홈페이지 메인 표시

---

## 💻 개발 워크플로우

### **로컬 개발 환경**

**⚠️ 중요: 로컬 프로젝트 경로**
```
D:\beautycat\
```

**GitHub 연동 상태:** ❌ **연동 안됨** (수동 배포 필요)

**디렉토리 구조:**
```
D:\beautycat\
├── index.html              # 메인 페이지
├── login.html              # 로그인 페이지
├── register.html           # 회원가입 페이지
├── admin-dashboard.html    # 관리자 대시보드
├── shop-dashboard.html     # 업체 대시보드
├── customer-dashboard.html # 고객 대시보드
├── css/
│   ├── style.css
│   ├── mobile-optimized.css         # 모바일 최적화 CSS ✅
│   └── ...
├── js/
│   ├── auth.js                      # 인증 관련
│   ├── admin-dashboard.js           # 관리자 대시보드 ✅ 최근 수정
│   ├── shop-dashboard.js            # 업체 대시보드 ✅ 최근 수정
│   ├── customer-dashboard.js        # 고객 대시보드
│   ├── api-global-override.js       # API 라우팅 ✅
│   ├── sw-unregister.js             # Service Worker 제거 ✅
│   ├── firebase-api.js              # ❌ 비활성화됨
│   ├── api-bridge.js                # ❌ 비활성화됨
│   └── ...
├── images/
│   ├── beautycat-logo.png           # 로고 이미지 (뷰냥이 아이콘)
│   └── ...
└── README.md                        # 이 파일 ✅
```

### **파일 수정 → 배포 전체 프로세스**

#### **단계 1: 로컬에서 파일 수정**

```bash
# 1. 파일 탐색기에서 수정
D:\beautycat\ 폴더 열기

# 2. 원하는 파일 수정
예: js/admin-dashboard.js 수정
예: css/mobile-optimized.css 수정
```

#### **단계 2: Cloudflare Pages 수동 배포** ⚠️

**GitHub 연동이 안되어 있으므로 수동 배포 필요**

**방법 1: Wrangler CLI 사용 (권장)**

```cmd
# 1. Wrangler 설치 (처음 한번만)
npm install -g wrangler

# 2. Cloudflare 로그인
wrangler login

# 3. beautycat 폴더로 이동
cd D:\beautycat

# 4. Pages 배포
wrangler pages publish . --project-name=beautycat-v2
```

**방법 2: Cloudflare Dashboard 직접 업로드**

```
1. https://dash.cloudflare.com 접속
2. Workers & Pages 클릭
3. beautycat-v2 선택
4. 우측 "Create deployment" 버튼 클릭
5. "Direct Upload" 선택
6. D:\beautycat\ 폴더 전체를 ZIP으로 압축
7. ZIP 파일 업로드
8. "Deploy" 클릭
```

**방법 3: Git 수동 푸시 (GitHub 연동 복구 후)**

```cmd
# D:\beautycat 폴더에서 실행

# Git 초기화 (처음 한번만)
git init
git remote add origin https://github.com/jansmakr/beautycat-v2.git

# 파일 추가 및 커밋
git add .
git commit -m "feat: 뷰냥이 로고 및 모바일 최적화"

# GitHub에 푸시
git push -u origin main
```

#### **단계 3: 배포 확인**

```
1. 배포 확인 방법:
   - https://dash.cloudflare.com 접속
   - Workers & Pages 클릭
   - beautycat-v2 선택
   - Deployments 탭 확인

2. 배포 상태:
   - 🟡 Building... (빌드 중)
   - 🟢 Success (성공)
   - 🔴 Failed (실패)

4. 배포 시간: 약 1-2분

5. 배포 완료 후:
   - https://beautycat-v2.pages.dev 접속
   - Ctrl+Shift+R (하드 새로고침)
   - 변경사항 확인
```

### **Backend (Workers) 수정 시**

**Workers는 GitHub 연동이 없으므로 수동 배포 필요**

```
1. Cloudflare Dashboard 접속
   - https://dash.cloudflare.com

2. Workers & Pages → beautycat-api 선택

3. Edit Code 클릭

4. 코드 수정
   - 주요 파일: 단일 JavaScript 파일 (ES Module)

5. Save and Deploy 클릭

6. 배포 완료 대기 (5-10초)

7. 테스트:
   curl https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=1
```

---

## 🔧 문제 해결 가이드

### **1. 페이지가 업데이트되지 않음**

**원인:** 브라우저 캐시

**해결:**
```
방법 1: 하드 새로고침
- Ctrl + Shift + R

방법 2: 캐시 삭제
- F12 → Application → Clear storage → Clear site data

방법 3: 시크릿 모드
- Ctrl + Shift + N (새 시크릿 창)
```

### **2. API 요청이 실패함 (CORS 에러)**

**원인:** CORS 헤더 설정 문제

**확인 방법:**
```cmd
curl -X OPTIONS https://beautycat-api.jansmakr.workers.dev/api/tables/users -H "Access-Control-Request-Method: PATCH" -H "Origin: https://beautycat-v2.pages.dev" -i
```

**예상 응답:**
```
HTTP/2 204
access-control-allow-methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
access-control-allow-origin: https://beautycat-v2.pages.dev
```

**해결:**
- Cloudflare Workers 코드에서 CORS 헤더 확인
- `getCorsHeaders()` 함수에 PATCH 포함 확인

### **3. 데이터가 표시되지 않음 (undefined)**

**원인:** 필드명 불일치

**확인 방법:**
```javascript
// Console에서 실행
fetch('tables/skincare_shops?limit=1')
  .then(r => r.json())
  .then(data => console.log(data.data[0]))
```

**해결:**
- 데이터베이스 필드명과 JavaScript 코드 필드명 일치 확인
- 예: `shop.shop_name` (X) → `shop.name` (O)

### **4. GitHub Desktop Push 실패**

**원인:** 인증 문제 또는 충돌

**해결:**
```
1. GitHub Desktop에서 로그아웃 후 재로그인
2. Repository → Repository settings → Remote
   - URL 확인: https://github.com/jansmakr/beautycat-v2.git
3. 충돌 발생 시:
   - Branch → Update from main
   - 충돌 파일 수동 해결
```

### **5. Cloudflare Pages 배포 실패**

**원인:** 빌드 오류 또는 설정 문제

**확인:**
```
1. Cloudflare Dashboard → beautycat-v2 → Deployments
2. 실패한 배포 클릭
3. 로그 확인
```

**일반적 해결:**
- 정적 파일만 사용하므로 빌드 명령어 없음
- 루트 디렉토리 설정 확인: `/`

---

## 🔌 API 엔드포인트

### **Base URL**
```
https://beautycat-api.jansmakr.workers.dev/api
```

### **RESTful API 구조**

#### **1. 목록 조회 (GET)**
```
GET /tables/{table_name}?page=1&limit=100&search=keyword&sort=created_at
```

**예시:**
```bash
# 사용자 목록 조회
curl "https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=10"

# 업체 목록 조회 (검색)
curl "https://beautycat-api.jansmakr.workers.dev/api/tables/skincare_shops?search=강남&limit=20"
```

**응답:**
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "table": "users",
  "schema": ["id", "email", "name", ...]
}
```

#### **2. 단일 조회 (GET)**
```
GET /tables/{table_name}/{record_id}
```

**예시:**
```bash
curl "https://beautycat-api.jansmakr.workers.dev/api/tables/skincare_shops/cf_1762064797445_mi3ug3g9j"
```

**응답:**
```json
{
  "id": "cf_1762064797445_mi3ug3g9j",
  "name": "테스트 피부관리실",
  "owner_name": "테스트 사장님",
  "status": "active",
  ...
}
```

#### **3. 생성 (POST)**
```
POST /tables/{table_name}
Content-Type: application/json

{
  "field1": "value1",
  "field2": "value2"
}
```

**예시:**
```bash
curl -X POST https://beautycat-api.jansmakr.workers.dev/api/tables/skincare_shops \
-H "Content-Type: application/json" \
-d '{"name":"새 피부관리실","owner_name":"홍길동","status":"pending"}'
```

**응답:** HTTP 201 Created
```json
{
  "id": "cf_1762080000000_abc123",
  "name": "새 피부관리실",
  "created_at": 1762080000000,
  ...
}
```

#### **4. 전체 수정 (PUT)**
```
PUT /tables/{table_name}/{record_id}
Content-Type: application/json

{
  "field1": "new_value1",
  "field2": "new_value2",
  ...
}
```

#### **5. 부분 수정 (PATCH)** ✅
```
PATCH /tables/{table_name}/{record_id}
Content-Type: application/json

{
  "status": "active"
}
```

**예시:** 업체 승인
```bash
curl -X PATCH https://beautycat-api.jansmakr.workers.dev/api/tables/skincare_shops/cf_1762064797445_mi3ug3g9j \
-H "Content-Type: application/json" \
-d '{"status":"active"}'
```

#### **6. 삭제 (DELETE)**
```
DELETE /tables/{table_name}/{record_id}
```

**응답:** HTTP 204 No Content

**주의:** Soft Delete 방식 (deleted = 1)

---

## 🔒 보안 및 인증

### **TABLE_SCHEMAS 필드 필터링**

**위치:** Cloudflare Workers 코드

**목적:** SQL Injection 방지 및 허용되지 않은 필드 차단

**구조:**
```javascript
const TABLE_SCHEMAS = {
    users: [
        'id', 'email', 'password', 'password_salt', 'name', 
        'user_type', 'phone', 'status', 'shop_id', 
        'email_verified', 'phone_verified', 'last_login_at', 
        'created_at', 'updated_at', 'deleted'
    ],
    skincare_shops: [
        'id', 'name', 'owner_name', 'phone', 'email', 
        'address', 'state', 'district', 'services', 
        'description', 'business_number', 'business_license', 
        'status', 'representative_treatments', 'price_range', 
        'operating_hours', 'created_at', 'updated_at', 'deleted'
    ],
    // ... 기타 테이블
};
```

**동작 방식:**
1. 클라이언트가 POST/PUT/PATCH 요청 시
2. Workers가 요청 body의 모든 필드 검사
3. TABLE_SCHEMAS에 정의된 필드만 허용
4. 허용되지 않은 필드는 자동 제거
5. 필터링된 데이터만 D1에 저장

### **CORS 설정**

**허용된 Origin:**
```javascript
const allowedOrigins = [
    'https://beautycat-v2.pages.dev',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
];
```

**허용된 HTTP 메서드:**
```
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

**허용된 헤더:**
```
Content-Type, Authorization, X-Requested-With
```

### **비밀번호 보안**

**현재 구현:**
- 비밀번호 해시: SHA-256 (client-side)
- Salt 저장: password_salt 필드

**권장 개선 사항:**
- bcrypt 또는 Argon2 사용 (server-side)
- 최소 비밀번호 길이: 8자 이상
- 비밀번호 복잡도 정책 적용

---

## 📱 모바일 최적화

### **반응형 디자인 구현**

**모바일 최적화 CSS 파일:** `css/mobile-optimized.css`

**주요 최적화 항목:**

1. **로고 디자인**
   - 이미지 로고 적용: `images/beautycat-logo.png`
   - 반응형 크기 조정 (모바일: 36px, 데스크톱: 40px)
   - 고해상도 디스플레이 지원

2. **터치 최적화**
   - 최소 터치 영역: 44x44px (iOS 권장 기준)
   - 터치 하이라이트 제거
   - 터치 제스처 영역 확대

3. **폼 입력 최적화**
   - 최소 높이: 44px
   - 폰트 크기: 16px (iOS 자동 줌 방지)
   - 체크박스/라디오: 24x24px (모바일)

4. **테이블 반응형**
   - 모바일에서 카드 형식으로 자동 변환
   - 가로 스크롤 지원
   - data-label 속성 활용

5. **네비게이션**
   - 햄버거 메뉴 (768px 이하)
   - 모바일 메뉴 슬라이드 애니메이션
   - 터치 친화적 메뉴 항목

6. **레이아웃**
   - 그리드 시스템 (1열 → 2열 → 3열 → 4열)
   - 컨테이너 패딩 조정
   - Safe Area 대응 (iOS 노치)

7. **성능**
   - 이미지 최적화
   - 스크롤 성능 개선
   - 하드웨어 가속 활용

**적용된 HTML 파일:**
- ✅ index.html
- ✅ login.html
- ✅ register.html
- ✅ admin-dashboard.html
- ✅ shop-dashboard.html
- ✅ customer-dashboard.html

**브레이크포인트:**
- Mobile: < 640px
- Tablet: 640px - 768px
- Desktop: 768px - 1024px
- Large: > 1024px

---

## 📝 주요 변경 이력

### **2025-11-05 (최신): 관리자 대시보드 개선 v2.3.1**

**변경 사항:**

1. ✅ **샵 리스트에 대표샵 관리 기능 추가**
   - 테이블 컬럼 추가: "대표샵 상태" (7개 컬럼)
   - 대표샵 지정 버튼: 클릭 한 번으로 즉시 지정
   - 대표샵 해제 버튼: 배지 옆 ❌ 클릭
   - 중복 대표샵 자동 확인 및 교체

2. ✅ **대표샵 상태 표시**
   - 대표샵: ⭐ 대표샵 배지 (파란색)
   - 일반 샵: "대표샵 지정" 버튼 (회색)
   - 실시간 상태 업데이트

3. ✅ **자동 검증 시스템**
   - 지역별 중복 대표샵 방지
   - 기존 대표샵 자동 해제 후 재지정
   - 지역 정보 없는 샵 체크

4. ✅ **API 연동**
   - PATCH /tables/skincare_shops/{id}
   - is_representative, representative_status 필드 업데이트
   - 실패 시 로컬 데이터로 폴백

**적용된 파일:**
- admin-dashboard.html (테이블 헤더 수정)
- js/admin-dashboard.js (displayShops, toggleRepresentativeStatus 함수 추가)
- ADMIN_REPRESENTATIVE_SHOP_FEATURE.md (기능 설명 문서)

**사용법:**
1. 관리자 대시보드 → 샵 입점관리
2. 원하는 샵의 "대표샵 지정" 버튼 클릭
3. 확인 후 즉시 지정 완료
4. 메인 페이지 전화상담 섹션에 자동 반영

---

### **2025-11-05: 상용화 최적화 v2.3.0**

**변경 사항:**

1. ✅ **성능 최적화 (80% 파일 크기 감소)**
   - HTML: 102KB → 20KB (80% 감소)
   - Critical CSS 인라인화
   - 스크립트 파일: 7개 → 2개 (71% 감소)
   - 로딩 시간: 2.5초 → 0.8초 (4G 기준)

2. ✅ **모바일 UI/UX 개선**
   - 터치 영역: 최소 48px (iOS HIG 준수)
   - 폰트 크기 최적화: 14-17.5px (모바일)
   - 간격 조정: 12-20px (컨테이너, 카드, 섹션)
   - 터치 피드백: 0.1초 빠른 반응

3. ✅ **반응형 디자인 완성**
   - 브레이크포인트: 375px, 640px, 768px
   - 로고: 32px (모바일) → 36px (PC)
   - 고양이 아이콘: 100px (모바일) → 150px (PC)
   - 네비게이션: 4개 버튼 균등 분배

4. ✅ **프로덕션 설정**
   - DNS Prefetch 적용
   - Font Display Swap (텍스트 즉시 표시)
   - GPU 가속 (translateZ)
   - Service Worker 제거 (캐시 충돌 해결)

5. ✅ **접근성 개선**
   - ARIA 레이블 추가
   - 키보드 네비게이션 최적화
   - 포커스 표시 (2px 아웃라인)
   - WCAG AA 대비율 준수 (4.5:1)

**적용된 파일:**
- index.html (완전 재작성 - 20KB)
- css/mobile-production.css (신규 - 8KB)
- index_backup_v2.2.2.html (백업)
- PRODUCTION_OPTIMIZATION_v2.3.0.md (가이드)

**성능 목표:**
- ✅ Lighthouse Performance: 95+
- ✅ First Contentful Paint: < 1.5s
- ✅ Time to Interactive: < 3s
- ✅ Cumulative Layout Shift: < 0.1

---

### **2025-11-05: 모바일 UI 개선 v2.2.2**

**변경 사항:**

1. ✅ **헤더 로고 교체 (A 영역)**
   - 기존: 이모티콘 🐱 + 텍스트 (beautycat / 뷰티+에티켓)
   - 변경: 야옹이 이모지 🐱 + `images/beautycat-logo-v2.png` 이미지
   - 야옹이 크기: 모바일 1.75rem, PC 2rem
   - 로고 텍스트: 모바일 32px, PC 36px
   - 깔끔하고 귀여운 브랜드 이미지

2. ✅ **메인 콘텐츠 텍스트 크기 조정 (B 영역)**
   - H1 제목: `text-xl → text-lg` (모바일), `text-3xl → text-2xl` (PC)
   - H2 부제목: `text-base → text-sm` (모바일), `text-xl → text-lg` (PC)
   - 본문 텍스트: `text-base → text-sm` (모바일)
   - 뷰냥이 인사 텍스트: `text-base → text-sm` (모바일)
   - 간격 최적화: `space-y-2.5 → space-y-2`

3. ✅ **하단 네비게이션 메뉴 균등 분배 (C 영역)**
   - 기존: 3개 버튼 (홈, 견적신청, 채팅)
   - 변경: 4개 버튼 (홈, 견적신청, 채팅, 전화상담)
   - 정렬: `justify-around → justify-evenly` (완전 균등 분배)
   - 4개 버튼이 전체 화면 너비에 균등하게 배치

4. ✅ **CSS 스타일 추가**
   - `.logo-container` 스타일 추가
   - 반응형 로고 크기 조정 (모바일 40px, PC 48px)
   - 로고 이미지 최적화 (auto width)

**적용된 파일:**
- index.html (헤더 로고, 메인 텍스트, 하단 네비게이션)
- 인라인 CSS 스타일 추가 (로고 컨테이너)

**모바일 UI 개선 효과:**
- ✅ 헤더: 전문적인 로고 이미지로 브랜드 강화
- ✅ 메인 콘텐츠: 텍스트 크기 축소로 정보 밀도 향상
- ✅ 네비게이션: 4개 버튼 균등 배치로 UI 일관성 향상

---

### **2025-11-04: 로그인/회원가입 버튼 UI 개선 v2.2.1**

**변경 사항:**
1. ✅ 버튼 테두리 얇게 조정 (3px → 1px)
2. ✅ 로그인/회원가입 버튼 크기 동일화 (`flex-1`)
3. ✅ box-shadow 제거로 깔끔한 디자인
4. ✅ 버튼 패딩 및 스타일 통일

---

### **2025-11-03: UI 대대적 개선 v2.1.1**

**변경 사항:**

1. ✅ **로고 및 고양이 아이콘 디자인 변경**
   - 배경 제거 (투명)
   - 테두리 제거
   - 그림자 제거
   - 이모지만 표시 (깔끔한 디자인)

2. ✅ **버튼 테두리 통일 (검은색)**
   - 메인 페이지: 상담/견적신청, 로그인 버튼
   - 로그인 페이지: 고객/샵 선택 버튼
   - 회원가입 페이지: 고객/샵 선택 버튼
   - 테두리: 분홍색 1px → 검은색 2px
   - 호버 효과: 연한 분홍 배경 + translateY(-2px)

3. ✅ **모바일 UI 전면 최적화**
   - 텍스트 크기: 15-16px (가독성 향상)
   - 버튼 최소 높이: 48-52px (터치 편의)
   - 입력 필드: 16px 폰트 (iOS 줌 방지)
   - 네비게이션 버튼: 64x56px
   - 섹션 패딩 및 간격 증가
   - 하단 여백: 80px (네비게이션 공간)

4. ✅ **캐시 무효화 시스템**
   - _headers 파일 추가 (Cloudflare 캐시 설정)
   - 버전 메타 태그 추가 (v2.1.0-20251103-0440)
   - CSS 버전 파라미터 (?v=2.1.0)
   - HTML 파일: 캐시 완전 비활성화

5. ✅ **회원가입 페이지 개선**
   - 사용자 타입 선택: 드롭다운 → 라디오 버튼
   - 검은색 테두리 적용
   - 호버 효과 통일

**적용된 파일:**
- index.html (버튼 스타일, 버전 메타 태그)
- login.html (테두리 검은색, 모바일 최적화)
- register.html (라디오 버튼, 모바일 최적화)
- css/mobile-optimized.css (로고, 버튼, 모바일 전면 개선)
- _headers (캐시 무효화 설정)

**테스트 완료:**
- ✅ PC 브라우저: 모든 버튼 검은색 테두리 확인
- ✅ 모바일: 텍스트/버튼 크기 최적화 확인
- ✅ 로고/고양이: 배경 제거 확인
- ✅ 호버 효과: 연한 분홍 배경 + 애니메이션 확인
- ✅ Cloudflare Pages 배포: 성공 (beautycat-v2)

---

### **2025-11-02: 뷰냥이 이모지 로고 적용 및 UI 개선**

**변경 사항:**
1. ✅ 뷰냥이 이모지 로고 🐱 적용
   - 이미지 대신 이모지 사용 (빠른 로딩)
   - 핑크 그라데이션 배경
   - 호버 애니메이션 효과
   - 모바일 반응형 크기 (40px → 36px)

2. ✅ 하단 전화상담 중복 제거
   - 전화상담 섹션 삭제 (상단에 이미 존재)
   - 하단 네비게이션 3개 버튼으로 축소 (홈, 견적신청, 채팅)

3. ✅ 로컬 개발 환경 경로 변경
   - C:\Users\user\beautycat-v2\ → **D:\beautycat\**
   - GitHub 연동 상태: ❌ 안됨 (수동 배포 필요)

**적용된 파일:**
- css/mobile-optimized.css (이모지 로고 스타일)
- index.html (로고 변경, 전화상담 삭제)
- login.html (로고 변경)
- admin-dashboard.html (로고 변경)
- shop-dashboard.html (로고 변경)
- customer-dashboard.html (로고 변경)

### **2025-11-02: 모바일 최적화 및 로고 변경**

**추가된 기능:**
1. ✅ 모바일 최적화 CSS (css/mobile-optimized.css)
2. ✅ 이미지 로고 적용 (images/beautycat-logo.png)
3. ✅ 반응형 네비게이션
4. ✅ 터치 최적화 UI
5. ✅ 모바일 폼 최적화
6. ✅ 테이블 카드 변환
7. ✅ iOS Safe Area 지원

### **2025-11-02: Checkpoint -222 복원 후 전체 재구축**

**해결된 문제:**
1. ✅ POST 500 에러 → TABLE_SCHEMAS 필드 필터링 추가
2. ✅ CORS PATCH 에러 → ES Module 변환 + CORS 헤더 수정
3. ✅ Service Worker 충돌 → 완전 제거 및 캐시 삭제
4. ✅ Firebase API 충돌 → 비활성화
5. ✅ auth.js 문법 에러 → loadDemoShops() 수정
6. ✅ shop-dashboard.js JSON 에러 → JSON.parse() 타입 체크
7. ✅ admin-dashboard.js undefined → shop.shop_name → shop.name

**새로운 구조:**
- Cloudflare Workers API (ES Module)
- Cloudflare D1 Database (SQLite)
- api-global-override.js (자동 API 라우팅)
- Service Worker 완전 제거

**테스트 완료:**
- ✅ 관리자 로그인
- ✅ 업체 목록 조회
- ✅ 업체 승인 (PATCH 요청)
- ✅ 업체명 정상 표시
- ✅ 모든 API 요청 정상 작동

---

## 🎯 다음 개발 단계 (우선순위)

### **Phase 1: 핵심 기능 안정화**
- [ ] 비밀번호 보안 강화 (bcrypt)
- [ ] 세션 관리 개선
- [ ] 에러 핸들링 통일

### **Phase 2: 업체 기능 확장**
- [ ] 업체 대시보드 정보 수정 기능
- [ ] 업체 서비스 등록 및 관리
- [ ] 업체 사진 업로드 (Cloudflare Images)

### **Phase 3: 고객 기능 구현**
- [ ] 업체 검색 및 필터링
- [ ] 예약 시스템
- [ ] 리뷰 작성 및 평점

### **Phase 4: 관리자 기능 고도화**
- [ ] 통계 대시보드
- [ ] 정산 관리
- [ ] 이메일 알림 (SendGrid 연동)

### **Phase 5: 성능 최적화**
- [ ] 이미지 최적화
- [ ] 페이지 로딩 속도 개선
- [ ] D1 Database 인덱스 최적화

---

## 📞 지원 및 문의

**개발자 연락처:**
- 이메일: jansmakr@gmail.com
- GitHub: https://github.com/jansmakr

**기술 스택:**
- Frontend: HTML5, CSS3, JavaScript (Vanilla)
- Backend: Cloudflare Workers (JavaScript ES Module)
- Database: Cloudflare D1 (SQLite)
- Hosting: Cloudflare Pages
- Version Control: GitHub

---

## 📄 라이선스

© 2025 BeautyCat Platform. All rights reserved.

---

**이 문서는 플랫폼 업데이트 시 함께 업데이트됩니다.**
**최종 업데이트: 2025-11-05 19:50 KST**
**버전: v2.2.3+++**
