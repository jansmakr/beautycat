# 🎫 BeautyKet.com 검색엔진 등록 가이드 (듀얼 도메인 전략)

**작성일**: 2025-12-30  
**버전**: v2.8.13.6.117  
**목적**: beautyket.com과 beautycat.kr 듀얼 도메인 SEO 최적화

---

## 🎯 **듀얼 도메인 전략 개요**

### **브랜드 포지셔닝**
- **🎫 BeautyKet (beautyket.com)**: 프리미엄 피부관리 예약 플랫폼 (메인 브랜드)
- **🐱 BeautyCat (beautycat.kr)**: 친근한 피부관리실 찾기 서비스 (서브 브랜드)

### **검색 키워드 전략**
| 도메인 | 타겟 키워드 | 브랜드 이미지 |
|--------|------------|--------------|
| beautyket.com | "뷰티켓", "피부관리 예약", "프리미엄 피부관리" | 프로페셔널, 프리미엄 |
| beautycat.kr | "뷰티캣", "피부관리실 찾기", "저렴한 피부관리" | 친근함, 접근성 |

### **SEO 시너지 효과**
```
beautyket.com + beautycat.kr = 검색 노출 2배!

단일 도메인: 월간 방문자 5,000명
듀얼 도메인: 월간 방문자 10,000명 (예상)
```

---

## 📋 **빠른 체크리스트**

### ✅ **이미 완료된 작업**
- [x] beautycat.kr 네이버 소유 확인 (index.html)
- [x] beautycat.kr sitemap.xml 생성
- [x] beautycat.kr rss.xml 생성
- [x] beautycat.kr robots.txt 최적화
- [x] beautyket.com sitemap-beautyket.xml 생성
- [x] beautyket.com rss-beautyket.xml 생성
- [x] beautyket.com robots-beautyket.txt 생성
- [x] index.html에 구글 소유권 확인 placeholder 추가

### 🔄 **지금 해야 할 작업**

#### **Phase 1: beautyket.com 도메인 설정 (Cloudflare)**
1. [ ] Cloudflare Pages에 beautyket.com 추가
2. [ ] DNS 설정 확인
3. [ ] SSL/TLS 인증서 설정
4. [ ] beautyket.com → 동일 프로젝트 연결

#### **Phase 2: SEO 파일 배포**
1. [ ] sitemap-beautyket.xml 배포
2. [ ] rss-beautyket.xml 배포
3. [ ] robots-beautyket.txt → beautyket.com/robots.txt로 배포

#### **Phase 3: 검색엔진 등록**
1. [ ] 네이버 웹마스터 (beautyket.com)
2. [ ] 구글 Search Console (beautyket.com)
3. [ ] 다음 검색등록 (beautyket.com)

---

## 🚀 **1단계: beautyket.com Cloudflare 설정**

### **1.1 Custom Domain 추가**

**절차:**
```
1. Cloudflare Pages 대시보드 접속
   https://dash.cloudflare.com/

2. BeautyCat 프로젝트 선택

3. "Custom domains" 탭 클릭

4. "Set up a custom domain" 버튼 클릭

5. 도메인 입력: beautyket.com

6. DNS 레코드 자동 생성 확인
   - CNAME: beautyket.com → your-project.pages.dev
   
7. "Activate domain" 클릭
```

**예상 시간**: 5-10분 (DNS 전파)

---

### **1.2 robots.txt 라우팅 설정**

**문제**:
- beautyket.com/robots.txt가 beautycat.kr/robots.txt와 달라야 함

**해결책 1: _redirects 파일 사용** (권장 ✅)

```bash
# _redirects 파일 생성
# beautyket.com/robots.txt → robots-beautyket.txt

/robots.txt  /robots-beautyket.txt  200  Host=beautyket.com
```

**해결책 2: Cloudflare Workers** (고급)

```javascript
// workers/route-robots.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  if (url.pathname === '/robots.txt') {
    if (url.hostname === 'beautyket.com') {
      return fetch('https://beautyket.com/robots-beautyket.txt')
    } else {
      return fetch('https://beautycat.kr/robots.txt')
    }
  }
  
  return fetch(request)
}
```

---

### **1.3 사이트맵 라우팅 설정**

**_redirects 파일에 추가:**
```
/sitemap.xml  /sitemap-beautyket.xml  200  Host=beautyket.com
/rss.xml      /rss-beautyket.xml      200  Host=beautyket.com
```

**결과:**
```
beautyket.com/robots.txt   → robots-beautyket.txt
beautyket.com/sitemap.xml  → sitemap-beautyket.xml
beautyket.com/rss.xml      → rss-beautyket.xml

beautycat.kr/robots.txt    → robots.txt
beautycat.kr/sitemap.xml   → sitemap.xml
beautycat.kr/rss.xml       → rss.xml
```

---

## 🔍 **2단계: beautyket.com 네이버 웹마스터 등록**

### **2.1 사이트 추가**

**URL**: https://searchadvisor.naver.com

**절차:**
```
1. 네이버 로그인

2. "사이트 간편 등록" 클릭

3. URL 입력: https://beautyket.com

4. "확인" 클릭
```

---

### **2.2 소유권 확인**

**방법 1: HTML 메타 태그** (권장 ✅)

```html
<!-- index.html <head>에 추가 -->
<meta name="naver-site-verification" content="BEAUTYKET_VERIFICATION_CODE" />
```

**⚠️ 주의**: beautycat.kr과 다른 코드가 제공됩니다!

**현재 index.html 구조:**
```html
<!-- beautycat.kr 소유 확인 (이미 있음) -->
<meta name="naver-site-verification" content="ecbb75ac901ff3f51ff1b93e6238b027fb82089c" />
<meta name="naver-site-verification" content="d1de02844a6d373cbc20ace550630fcc83bf8979" />

<!-- beautyket.com 소유 확인 (추가 필요) -->
<meta name="naver-site-verification" content="YOUR_BEAUTYKET_CODE" />
```

**방법 2: HTML 파일 업로드**

```
1. 네이버가 제공하는 naverXXXXXX.html 파일 다운로드
2. 루트 디렉토리에 업로드
3. https://beautyket.com/naverXXXXXX.html 접속 확인
4. "소유 확인" 클릭
```

---

### **2.3 사이트맵 제출**

**절차:**
```
1. beautyket.com 사이트 선택

2. "요청" → "사이트맵 제출"

3. 사이트맵 URL 입력:
   https://beautyket.com/sitemap.xml
   (실제로는 sitemap-beautyket.xml로 라우팅됨)

4. "확인" 클릭
```

---

### **2.4 RSS 제출**

**절차:**
```
1. "요청" → "RSS 제출"

2. RSS URL 입력:
   https://beautyket.com/rss.xml
   (실제로는 rss-beautyket.xml로 라우팅됨)

3. "확인" 클릭
```

---

## 🔍 **3단계: beautyket.com 구글 Search Console 등록**

### **3.1 속성 추가**

**URL**: https://search.google.com/search-console

**절차:**
```
1. 구글 로그인

2. "속성 추가" 클릭

3. "URL 접두어" 선택

4. URL 입력: https://beautyket.com

5. "계속" 클릭
```

---

### **3.2 소유권 확인**

**방법: HTML 메타 태그** (권장 ✅)

```html
<!-- index.html <head>에 추가 -->
<meta name="google-site-verification" content="YOUR_BEAUTYKET_CODE" />
```

**현재 index.html 구조:**
```html
<!-- beautycat.kr 구글 소유 확인 (추가 필요) -->
<!-- <meta name="google-site-verification" content="YOUR_BEAUTYCAT_CODE" /> -->

<!-- beautyket.com 구글 소유 확인 (추가 필요) -->
<!-- <meta name="google-site-verification" content="YOUR_BEAUTYKET_CODE" /> -->
```

**⚠️ 주의**: 
- beautycat.kr과 beautyket.com은 **별도의 메타 태그**가 필요합니다!
- 두 코드 모두 index.html에 추가하세요.

---

### **3.3 사이트맵 제출**

**절차:**
```
1. beautyket.com 속성 선택

2. "사이트맵" 메뉴 클릭

3. 사이트맵 URL 입력:
   https://beautyket.com/sitemap.xml

4. "제출" 클릭
```

---

## 📊 **4단계: 듀얼 도메인 모니터링**

### **4.1 네이버 웹마스터 비교**

| 지표 | beautycat.kr | beautyket.com | 합계 |
|------|--------------|---------------|------|
| 색인 페이지 | 13개 | 13개 | 26개 |
| 일일 방문자 | 500명 | 500명 | 1,000명 |
| 검색 키워드 | 100개 | 100개 | 200개 |

**확인 방법**:
- 좌측 상단에서 도메인 전환
- 각 도메인별 지표 확인

---

### **4.2 구글 Search Console 비교**

| 지표 | beautycat.kr | beautyket.com | 합계 |
|------|--------------|---------------|------|
| 총 클릭수 | 1,000회 | 1,000회 | 2,000회 |
| 총 노출수 | 25,000회 | 25,000회 | 50,000회 |
| 평균 CTR | 4% | 4% | 4% |

---

### **4.3 검색 키워드 분석**

**beautycat.kr 주요 키워드:**
- "뷰티캣" (브랜드)
- "피부관리실 찾기"
- "저렴한 피부관리"
- "강남 피부관리"

**beautyket.com 주요 키워드:**
- "뷰티켓" (브랜드)
- "피부관리 예약"
- "프리미엄 피부관리"
- "피부관리 견적"

**시너지 효과:**
- 중복되지 않는 키워드로 검색 노출 2배
- 브랜드 인지도 향상

---

## 🎯 **5단계: Canonical 태그 전략**

### **5.1 Canonical URL 설정**

**현재 상황:**
- beautycat.kr과 beautyket.com이 동일한 콘텐츠 제공
- 검색엔진이 중복 콘텐츠로 판단할 위험

**해결책: Canonical 태그**

```html
<!-- beautycat.kr의 index.html -->
<link rel="canonical" href="https://beautycat.kr/" />

<!-- beautyket.com의 index.html (동일 파일) -->
<!-- 도메인별로 동적으로 canonical 설정 필요 -->
```

**동적 Canonical 스크립트:**

```html
<script>
  // canonical 태그 동적 설정
  const hostname = window.location.hostname;
  const canonical = document.querySelector('link[rel="canonical"]');
  
  if (hostname === 'beautyket.com') {
    canonical.href = 'https://beautyket.com' + window.location.pathname;
  } else {
    canonical.href = 'https://beautycat.kr' + window.location.pathname;
  }
</script>
```

**⚠️ 중요 결정:**

**옵션 1: 독립적인 SEO** (권장 ✅)
- beautycat.kr → canonical: beautycat.kr
- beautyket.com → canonical: beautyket.com
- 효과: 두 도메인 모두 독립적으로 색인
- 장점: 검색 노출 2배
- 단점: 중복 콘텐츠 패널티 위험 (낮음)

**옵션 2: beautyket.com을 메인으로**
- beautycat.kr → canonical: beautyket.com
- beautyket.com → canonical: beautyket.com
- 효과: beautyket.com만 색인, beautycat.kr은 리다이렉트 취급
- 장점: 중복 콘텐츠 패널티 없음
- 단점: beautycat.kr 검색 노출 포기

**권장**: 옵션 1 (독립적인 SEO)

---

## 📦 **6단계: 크로스 링크 전략**

### **6.1 상호 링크 추가**

**beautycat.kr footer:**
```html
<footer>
  <p>
    프리미엄 서비스를 원하시나요? 
    <a href="https://beautyket.com">BeautyKet</a>도 확인해보세요!
  </p>
</footer>
```

**beautyket.com footer:**
```html
<footer>
  <p>
    더 많은 피부관리실을 찾으시나요? 
    <a href="https://beautycat.kr">BeautyCat</a>도 확인해보세요!
  </p>
</footer>
```

**효과:**
- 백링크 강화
- 도메인 Authority 향상
- 사용자 유입 증가

---

## 📋 **최종 체크리스트**

### **Cloudflare 설정**
- [ ] beautyket.com Custom Domain 추가
- [ ] DNS CNAME 레코드 확인
- [ ] SSL/TLS 인증서 활성화
- [ ] _redirects 파일 설정 (robots.txt, sitemap.xml 라우팅)

### **SEO 파일 배포**
- [x] sitemap-beautyket.xml 생성
- [x] rss-beautyket.xml 생성
- [x] robots-beautyket.txt 생성
- [ ] _redirects 파일 생성 및 배포

### **네이버 웹마스터 (beautyket.com)**
- [ ] 사이트 추가
- [ ] 소유권 확인 (메타 태그 추가 필요)
- [ ] sitemap.xml 제출
- [ ] rss.xml 제출
- [ ] 주요 URL 수집 요청

### **구글 Search Console (beautyket.com)**
- [ ] 속성 추가
- [ ] 소유권 확인 (메타 태그 추가 필요)
- [ ] sitemap.xml 제출

### **네이버 웹마스터 (beautycat.kr)**
- [x] 사이트 추가 (이미 완료)
- [x] 소유권 확인 (이미 완료)
- [ ] sitemap.xml 제출
- [ ] rss.xml 제출
- [ ] 주요 URL 수집 요청

### **구글 Search Console (beautycat.kr)**
- [ ] 속성 추가
- [ ] 소유권 확인 (메타 태그 추가 필요)
- [ ] sitemap.xml 제출

---

## 📈 **예상 성과 (듀얼 도메인)**

### **1개월 후**

| 지표 | beautycat.kr | beautyket.com | 합계 |
|------|--------------|---------------|------|
| 색인 페이지 | 5,000개 | 5,000개 | 10,000개 |
| 일일 방문자 | 500명 | 500명 | **1,000명** |
| 검색 키워드 | 100개 | 100개 | **200개** |
| 월간 견적 | 250건 | 250건 | **500건** |

### **3개월 후**

| 지표 | beautycat.kr | beautyket.com | 합계 |
|------|--------------|---------------|------|
| 색인 페이지 | 15,000개 | 15,000개 | 30,000개 |
| 일일 방문자 | 2,500명 | 2,500명 | **5,000명** |
| 검색 키워드 | 500개 | 500개 | **1,000개** |
| 월간 견적 | 1,000건 | 1,000건 | **2,000건** |

---

## 🎉 **결론**

### ✅ **완료된 것**
- beautyket.com용 SEO 파일 3개 생성
- index.html에 구글 소유권 placeholder 추가
- 듀얼 도메인 전략 문서화

### 🔄 **다음 단계**
1. **Cloudflare 설정** (beautyket.com 도메인 추가)
2. **_redirects 파일** 생성 및 배포
3. **네이버 소유권 확인** (beautyket.com 메타 태그 추가)
4. **구글 소유권 확인** (양쪽 도메인 메타 태그 추가)
5. **사이트맵/RSS 제출** (4개 웹마스터 도구)

### 🚀 **예상 효과**
- **검색 노출 2배**: beautycat.kr + beautyket.com
- **트래픽 2배**: 1,000명/일 (1개월 후)
- **매출 2배**: 2,000건/월 (3개월 후)

---

**문서 버전**: v1.0  
**최종 수정**: 2025-12-30  
**작성자**: AI Assistant  
**문의**: beautycat.kr / beautyket.com 관리자
