# 네이버 웹마스터 도구 등록 가이드

## 📋 개요

beautycat 사이트를 네이버 검색에 최적화하고 노출하기 위한 가이드입니다.

## 🎉 최신 업데이트 (v2.4.8 - 2024-11-16)

### ✅ 회사 정보 업데이트 완료

**변경 사항:**
- 상호: `k-beautics` → **케이뷰틱스** (K-beautics)
- 대표: **박대수** 추가
- Schema.org 법인 정보 구조화 (legalName, founder, address)

### ✅ 네이버 웹마스터 도구 검사 완료 (v2.4.7)

**검사 결과:**
- ✅ HTTP 규약 통과
- ✅ robots.txt 통과
- ✅ 로봇 메타 태그 통과
- ✅ 사이트 설명 통과
- ✅ Open Graph 제목/설명 통과
- ✅ **사이트 제목 최적화 완료** (51자 → 24자)

**타이틀 최적화:**
```html
<!-- Before (51자) - 네이버 권장 초과 ❌ -->
<title>beautycat - 피부관리실 견적비교 | 전국 강남 홍대 피부케어 예약</title>

<!-- After (24자) - 네이버 권장 준수 ✅ -->
<title>beautycat - 전국 피부관리실 견적 비교 예약</title>
```

**개선 효과:**
- 네이버 검색 최적화 완료 (40자 이내 권장사항 준수)
- 모바일 검색 결과에서 제목 잘림 방지
- 핵심 키워드 집중 (전국, 피부관리실, 견적 비교, 예약)

## 🎯 네이버 웹마스터 도구 등록

### 1. 사이트 소유 확인

**이미 완료됨 ✅**
```html
<!-- index.html Line 22 -->
<meta name="naver-site-verification" content="ecbb75ac901ff3f51ff1b93e6238b027fb82089c" />
```

### 2. 사이트맵 제출

**URL:** https://searchadvisor.naver.com/console/board

**제출할 사이트맵:**
```
https://beautycat.kr/sitemap.xml
```

### 3. RSS 피드 제출 (선택사항)

현재 RSS 피드는 없지만, 향후 블로그/뉴스 섹션 추가 시 제출 가능

## 📊 추가된 구조화 데이터 (Schema.org)

### 1. Organization (조직 정보) ⭐ v2.4.8 업데이트
```json
{
  "@type": "Organization",
  "name": "케이뷰틱스",
  "alternateName": ["K-beautics", "beautycat", "뷰티캣"],
  "legalName": "케이뷰틱스",
  "url": "https://beautycat.kr",
  "logo": "https://beautycat.kr/images/beautycat-logo-v3.png",
  "founder": {
    "@type": "Person",
    "name": "박대수"
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "서울 강서구 허준로198, 가양프라자 4층 406-03호 10호"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+82-70-7004-5902",
    "email": "utuber@kakao.com"
  }
}
```

**효과:**
- 네이버 검색 결과에 로고 표시
- 브랜드 신뢰도 향상
- 법인 정보 정확성으로 검색 순위 개선
- 사업자등록증과 정보 일치
- 지식패널 생성 가능

### 2. Article (메인 콘텐츠)
```json
{
  "@type": "Article",
  "headline": "전국 피부관리실 견적 비교 - beautycat",
  "description": "강남, 홍대, 잠실 피부관리실 무료 견적 비교...",
  "datePublished": "2024-01-01",
  "dateModified": "2024-11-16"
}
```

**효과:**
- 검색 결과에 게시일/수정일 표시
- 콘텐츠 신선도 강조
- 뉴스/블로그 섹션에 노출 가능

### 3. Service (서비스 정보)
```json
{
  "@type": "Service",
  "serviceType": "피부관리 예약 중개 서비스",
  "hasOfferCatalog": {
    "itemListElement": [
      {
        "name": "기본 피부관리",
        "itemListElement": [
          {"name": "딥클렌징"},
          {"name": "수분관리"}
        ]
      },
      {
        "name": "트러블 케어",
        "itemListElement": [
          {"name": "여드름 관리"},
          {"name": "모공축소"}
        ]
      },
      {
        "name": "안티에이징",
        "itemListElement": [
          {"name": "리프팅 관리"},
          {"name": "미백케어"}
        ]
      }
    ]
  }
}
```

**효과:**
- 서비스 카테고리 구조화
- "피부관리", "여드름 관리" 등 키워드 최적화
- 서비스별 검색 결과 노출

### 4. BreadcrumbList (네비게이션 경로)
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"position": 1, "name": "홈"},
    {"position": 2, "name": "피부관리 예약"},
    {"position": 3, "name": "지역별 업체"}
  ]
}
```

**효과:**
- 검색 결과에 경로 표시 (홈 > 피부관리 예약)
- 사이트 구조 명확화
- 클릭률(CTR) 향상

### 5. FAQPage (자주 묻는 질문)
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {"name": "beautycat은 무료인가요?"},
    {"name": "어떤 지역에서 서비스를 이용할 수 있나요?"},
    {"name": "견적은 얼마나 빨리 받을 수 있나요?"},
    {"name": "어떤 피부관리 서비스를 제공하나요?"},
    {"name": "업체 신뢰도는 어떻게 확인하나요?"}
  ]
}
```

**효과:**
- 검색 결과에 FAQ 직접 표시
- 리치 스니펫(Rich Snippet) 생성
- 검색 노출 영역 확대

## 🔍 네이버 검색 최적화 키워드

### 주요 타겟 키워드
1. **지역 + 서비스**
   - "강남 피부관리실"
   - "홍대 피부관리"
   - "잠실 피부관리"

2. **서비스명**
   - "피부관리 견적"
   - "피부관리 예약"
   - "여드름 관리"
   - "리프팅 관리"
   - "미백케어"

3. **롱테일 키워드**
   - "강남 피부관리실 추천"
   - "피부관리 견적 비교"
   - "여드름 관리 잘하는 곳"
   - "저렴한 피부관리실"

## 📈 네이버 웹마스터 도구 활용

### 1. 검색 반영 현황
- 메뉴: 검색 반영 > 웹 페이지 수집
- 확인 항목:
  - 수집 요청 페이지 수
  - 수집된 페이지 수
  - 검색 반영 페이지 수

### 2. 검색어 분석
- 메뉴: 검색 통계 > 검색어
- 확인 항목:
  - 유입 검색어
  - 클릭수
  - 노출수
  - 클릭률(CTR)

### 3. 사이트 간편 등록
- 메뉴: 사이트 간편 등록
- 제출 URL: https://beautycat.kr

### 4. 수집 요청
주요 페이지 수집 요청:
```
https://beautycat.kr
https://beautycat.kr/index.html
https://beautycat.kr/login.html
https://beautycat.kr/register.html
https://beautycat.kr/customer-dashboard.html
https://beautycat.kr/shop-dashboard.html
```

## ✅ 체크리스트

### 필수 항목
- [x] 사이트 소유 확인 (meta 태그)
- [x] 구조화 데이터 추가 (Organization, Article, Service, FAQ)
- [x] sitemap.xml 생성
- [x] robots.txt 생성
- [ ] 네이버 웹마스터 도구에 사이트맵 제출
- [ ] 주요 페이지 수집 요청
- [ ] 검색 반영 확인 (1-2주 소요)

### 권장 항목
- [x] 메타 설명(description) 최적화
- [x] 제목(title) 최적화
- [x] Open Graph 태그 추가
- [x] Twitter Card 추가
- [ ] 네이버 블로그/카페 연동
- [ ] 네이버 플레이스 등록 (오프라인 매장용)

## 🎯 예상 효과

### 검색 노출 개선
**Before:**
- 네이버 검색 시 노출 안됨 ❌

**After:**
- "강남 피부관리실" 검색 시 상위 노출 가능 ✅
- "피부관리 견적" 검색 시 리치 스니펫 표시 ✅
- FAQ 직접 노출로 클릭률 향상 ✅

### 검색 결과 표시 예시

```
beautycat - 전국 피부관리실 견적 비교
https://beautycat.kr
전국 피부관리실 견적을 한번에 비교하고 예약하는 플랫폼. 강남, 홍대, 잠실 등...
홈 > 피부관리 예약 > 지역별 업체

▼ 자주 묻는 질문
Q. beautycat은 무료인가요?
A. 네, beautycat 플랫폼 이용은 완전 무료입니다...

Q. 어떤 지역에서 서비스를 이용할 수 있나요?
A. 서울(강남, 홍대, 잠실 등), 경기도, 부산, 대구 등...
```

## 🔧 추가 최적화 방안

### 1. 블로그 콘텐츠 작성
**주제 예시:**
- "강남 피부관리실 TOP 10"
- "여드름 관리 방법과 추천 업체"
- "피부 타입별 맞춤 관리법"
- "계절별 피부 관리 가이드"

### 2. 네이버 플레이스 등록
- 실제 오프라인 매장이 있다면 등록
- 리뷰 수집으로 신뢰도 향상

### 3. 네이버 쇼핑 등록 (선택)
- 피부관리 상품권 판매 시 활용

### 4. 네이버 예약 연동
- API 연동으로 직접 예약 가능

## 📊 모니터링

### 주간 체크 항목
- [ ] 네이버 웹마스터 도구 > 검색 반영 현황
- [ ] 유입 검색어 top 10
- [ ] 페이지별 노출/클릭 수

### 월간 체크 항목
- [ ] 주요 키워드 순위 변화
- [ ] 신규 유입 검색어 분석
- [ ] 경쟁사 분석

## 🚀 실행 단계

### Step 1: 네이버 웹마스터 도구 접속
```
https://searchadvisor.naver.com
```

### Step 2: 사이트 추가
1. "사이트 추가" 클릭
2. URL 입력: https://beautycat.kr
3. 소유 확인 (이미 완료됨)

### Step 3: 사이트맵 제출
1. 메뉴: 요청 > 사이트맵 제출
2. URL 입력: https://beautycat.kr/sitemap.xml
3. "확인" 클릭

### Step 4: 주요 페이지 수집 요청
1. 메뉴: 요청 > 웹 페이지 수집
2. URL 입력 (한 줄에 하나씩):
```
https://beautycat.kr
https://beautycat.kr/index.html
https://beautycat.kr/login.html
https://beautycat.kr/register.html
```
3. "확인" 클릭

### Step 5: 검색 반영 확인
- 1-2주 후 네이버에서 "site:beautycat.kr" 검색
- 페이지가 검색되면 성공 ✅

## 💡 팁

### 빠른 검색 반영
1. **신규 콘텐츠 정기 업데이트**
   - 주 1회 이상 콘텐츠 추가
   - 최신 정보 유지

2. **외부 링크 확보**
   - 네이버 블로그에 소개글 작성
   - 네이버 카페에 링크 공유
   - SNS 공유 (페이스북, 인스타그램)

3. **내부 링크 구조화**
   - 페이지 간 연결 강화
   - 명확한 네비게이션

## 📞 문의

네이버 검색 등록 관련 문의:
- 네이버 웹마스터 도구 고객센터
- https://help.naver.com/service/5640/contents/18217

---

**작성일:** 2024-11-16  
**버전:** v2.4.6  
**상태:** ✅ 구조화 데이터 추가 완료
