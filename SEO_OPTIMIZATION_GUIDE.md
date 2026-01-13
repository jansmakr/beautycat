# 🔍 Beautyket SEO 최적화 가이드

## 📅 업데이트: 2026-01-13

---

## 🎯 목표

Beautyket의 모든 샵 리스트를 **네이버**와 **구글** 검색 결과에 노출시키기

---

## 📝 완료된 작업

### ✅ 1. 사이트맵 파일 생성
- `shop-sitemap.xml` - 기본 사이트맵
- `generate-shop-sitemap.html` - 동적 사이트맵 생성 도구

### ✅ 2. robots.txt 업데이트
- 크롤러 허용 설정
- 사이트맵 위치 지정
- 크롤링 제외 페이지 설정

### ✅ 3. 메타 태그 최적화 (index.html에 이미 적용됨)
```html
<meta name="description" content="전국 피부관리실 견적 무료비교...">
<meta name="keywords" content="피부관리실, 피부관리 예약...">
<meta property="og:title" content="Beautyket - 피부관리실 예약">
```

---

## 🚀 실행 단계

### Step 1: 동적 사이트맵 생성

1. **브라우저에서 열기**
   ```
   https://beautyket.kr/generate-shop-sitemap.html
   ```

2. **"사이트맵 생성하기" 버튼 클릭**
   - 모든 샵 데이터를 자동으로 가져옴
   - XML 사이트맵 자동 생성

3. **"다운로드 (XML)" 버튼 클릭**
   - `shop-sitemap.xml` 파일 저장

4. **GitHub에 Push**
   ```bash
   git add shop-sitemap.xml
   git add robots.txt
   git add generate-shop-sitemap.html
   git add SEO_OPTIMIZATION_GUIDE.md
   git commit -m "🔍 SEO: 샵 사이트맵 추가 및 robots.txt 업데이트"
   git push origin main
   ```

---

### Step 2: 네이버 서치어드바이저 등록

#### 2-1. 접속
- URL: https://searchadvisor.naver.com/

#### 2-2. 사이트 등록
1. "사이트 등록" 버튼 클릭
2. URL 입력: `https://beautyket.kr`
3. 소유권 확인 (이미 완료됨)
   ```html
   <meta name="naver-site-verification" content="ecbb75ac..." />
   ```

#### 2-3. 사이트맵 제출
1. 좌측 메뉴 > **"요청"** > **"사이트맵 제출"**
2. 사이트맵 URL 입력:
   ```
   https://beautyket.kr/sitemap.xml
   https://beautyket.kr/shop-sitemap.xml
   ```
3. "확인" 버튼 클릭

#### 2-4. RSS 제출 (선택사항)
```
https://beautyket.kr/rss.xml
```

---

### Step 3: Google Search Console 등록

#### 3-1. 접속
- URL: https://search.google.com/search-console/

#### 3-2. 속성 추가
1. "속성 추가" 버튼 클릭
2. **"URL 접두어"** 선택
3. URL 입력: `https://beautyket.kr`

#### 3-3. 소유권 확인
**방법 1: HTML 태그** (권장)
```html
<!-- index.html의 <head>에 추가 -->
<meta name="google-site-verification" content="[구글에서 제공하는 코드]" />
```

**방법 2: HTML 파일 업로드**
- 구글이 제공하는 파일을 루트에 업로드

#### 3-4. 사이트맵 제출
1. 좌측 메뉴 > **"Sitemaps"**
2. "새 사이트맵 추가" 입력:
   ```
   sitemap.xml
   shop-sitemap.xml
   ```
3. "제출" 버튼 클릭

#### 3-5. URL 검사
1. 상단 검색바에 URL 입력:
   ```
   https://beautyket.kr/
   https://beautyket.kr/shop-detail.html?id=xxx
   ```
2. "색인 생성 요청" 클릭

---

## 📊 검색 엔진별 샵 노출 최적화

### 🔵 네이버 검색 최적화

#### 1. 구조화된 데이터 (Schema.org)
각 샵 상세 페이지(`shop-detail.html`)에 추가:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "샵 이름",
  "image": "샵 이미지 URL",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "서울특별시 강남구",
    "addressCountry": "KR"
  },
  "telephone": "02-1234-5678",
  "priceRange": "₩₩",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "reviewCount": "120"
  }
}
</script>
```

#### 2. 메타 태그 최적화
```html
<meta name="description" content="[샵명] - 서울 강남 피부관리실 | 여드름/모공/미백 전문">
<meta property="og:title" content="[샵명] | Beautyket">
<meta property="og:description" content="...">
<meta property="og:image" content="샵 대표 이미지">
```

---

### 🔴 구글 검색 최적화

#### 1. 리치 스니펫 (Rich Snippets)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "name": "샵 이름",
  "url": "https://beautyket.kr/shop-detail.html?id=xxx",
  "image": "이미지 URL",
  "priceRange": "₩₩-₩₩₩",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "상세 주소",
    "addressLocality": "강남구",
    "addressRegion": "서울특별시",
    "addressCountry": "KR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "37.4979",
    "longitude": "127.0276"
  },
  "telephone": "02-1234-5678",
  "openingHours": "Mo-Fr 10:00-20:00, Sa 10:00-18:00"
}
</script>
```

#### 2. 구글 마이 비즈니스 연동
- 각 샵이 구글 마이 비즈니스에 등록되어 있다면 연동

---

## 🎯 검색 키워드 최적화

### 지역별 키워드
```
서울 강남 피부관리실
강남역 피부관리
서초구 피부케어
홍대 피부관리실 추천
```

### 시술별 키워드
```
여드름 관리 잘하는 곳
모공 관리 피부과
미백 관리 추천
리프팅 관리 샵
```

### 가격대 키워드
```
저렴한 피부관리실
가성비 피부케어
피부관리 할인
피부관리 쿠폰
```

---

## 📈 모니터링 및 분석

### 1. 네이버 서치어드바이저
- **수집 현황**: 크롤링된 페이지 수
- **검색 반영**: 실제 검색 결과 노출 수
- **유입 키워드**: 어떤 검색어로 유입되는지

### 2. Google Search Console
- **Coverage**: 색인 생성된 페이지
- **Performance**: 노출수, 클릭수, CTR
- **Search queries**: 검색어 분석

### 3. Google Analytics (선택)
- 유입 경로 분석
- 사용자 행동 분석
- 전환율 측정

---

## ⏰ 예상 소요 시간

| 작업 | 소요 시간 | 결과 확인 |
|------|----------|----------|
| 사이트맵 생성 및 제출 | 10분 | 즉시 |
| 네이버 사이트맵 처리 | 1-3일 | 3-7일 |
| 구글 사이트맵 처리 | 1-7일 | 7-14일 |
| 검색 결과 노출 시작 | 7-14일 | 14-30일 |
| 상위 노출 (SEO 최적화) | 1-3개월 | 지속적 |

---

## 🔔 주의사항

### ✅ 해야 할 것
1. 사이트맵을 정기적으로 업데이트 (주 1회)
2. 새로운 샵 등록 시 사이트맵 재생성
3. 메타 태그를 각 페이지마다 최적화
4. 양질의 콘텐츠 지속적으로 추가
5. 모바일 최적화 유지

### ❌ 하지 말아야 할 것
1. 키워드 스팸 (과도한 키워드 반복)
2. 숨겨진 텍스트 사용
3. 중복 콘텐츠 생성
4. 자동화된 링크 생성
5. 클로킹 (크롤러와 사용자에게 다른 콘텐츠)

---

## 📞 문제 해결

### Q1: 사이트맵이 제출되지 않아요
**A**: `robots.txt`에 사이트맵 경로가 올바른지 확인하세요.

### Q2: 검색 결과에 안 나와요
**A**: 최소 1-2주 기다려주세요. 크롤링과 색인 생성에 시간이 걸립니다.

### Q3: 특정 페이지만 안 나와요
**A**: 
- URL 검사 도구로 해당 페이지 수동 제출
- `robots.txt`에서 해당 경로가 차단되었는지 확인
- 메타 태그에 `noindex`가 없는지 확인

---

## 🎊 완료 체크리스트

- [ ] `generate-shop-sitemap.html` 접속
- [ ] 사이트맵 생성 및 다운로드
- [ ] `shop-sitemap.xml`, `robots.txt` GitHub Push
- [ ] 네이버 서치어드바이저에 사이트맵 제출
- [ ] Google Search Console에 사이트맵 제출
- [ ] 주요 페이지 URL 검사 및 색인 요청
- [ ] 1주일 후 수집 현황 확인
- [ ] 2주일 후 검색 결과 확인

---

**작성일**: 2026-01-13  
**작성자**: AI Assistant  
**버전**: v1.0.0  
**태그**: `SEO`, `사이트맵`, `검색 엔진`, `네이버`, `구글`
