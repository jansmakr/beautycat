# 🌐 플랫폼 등록 가이드 (포워딩 도메인)

## 📊 **네이버 웹마스터도구 등록**

### **1단계: 사이트 등록**
```
네이버 웹마스터도구 (https://searchadvisor.naver.com/)
→ 웹마스터 도구 → 사이트 등록
→ URL: https://beautycat.kr 입력
```

### **2단계: 소유권 확인**
```
방법 1: HTML 파일 업로드 (추천)
- naver*.html 파일 다운로드
- GitHub 레포지토리에 업로드
- 확인 클릭

방법 2: HTML 태그 삽입
- 메타태그를 index.html <head>에 추가
```

### **3단계: 사이트맵 등록**
```
sitemap.xml 등록:
https://beautycat.kr/sitemap.xml

RSS 피드 (있다면):
https://beautycat.kr/feed.xml
```

## 📱 **카카오톡 링크 최적화**

### **Open Graph 메타태그 설정**
```html
<!-- index.html <head>에 추가 -->
<meta property="og:url" content="https://beautycat.kr">
<meta property="og:type" content="website">
<meta property="og:title" content="beautycat - 피부관리실 견적 플랫폼">
<meta property="og:description" content="우리 동네 피부관리실 견적을 한번에 비교하세요">
<meta property="og:image" content="https://beautycat.kr/icons/icon-512x512.png">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">

<!-- 트위터 카드 -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="beautycat - 피부관리실 견적 플랫폼">
<meta name="twitter:description" content="우리 동네 피부관리실 견적을 한번에 비교하세요">
<meta name="twitter:image" content="https://beautycat.kr/icons/icon-512x512.png">
```

### **카카오톡 미리보기 테스트**
```
테스트 도구:
1. Facebook Sharing Debugger: https://developers.facebook.com/tools/debug/
2. 카카오톡에 직접 링크 전송해서 확인
```

## 🔍 **구글 Search Console**

### **등록 방법**
```
Google Search Console (https://search.google.com/search-console)
→ 속성 추가 → URL 접두어
→ https://beautycat.kr 입력
→ 소유권 확인 (HTML 파일 또는 메타태그)
```

### **사이트맵 제출**
```
좌측 메뉴 → Sitemaps
→ 새 사이트맵 추가: sitemap.xml
```

## 📈 **네이버 블로그/카페 연동**

### **네이버 플레이스 등록**
```
네이버 플레이스 (https://business.naver.com/places/)
→ 업체 등록 시 홈페이지: https://beautycat.kr 입력
→ 포워딩이어도 정상 인식됨
```

### **네이버 쇼핑 등록**
```
네이버 쇼핑파트너 센터
→ 쇼핑몰 등록 시 도메인: beautycat.kr
→ 301 리다이렉트 자동 추적
```

## 💼 **비즈니스 플랫폼 등록들**

### **Google My Business**
```
Google 비즈니스 프로필
→ 웹사이트: https://beautycat.kr
→ 포워딩 도메인도 정상 인식
```

### **페이스북 비즈니스**
```
Facebook 페이지 생성
→ 웹사이트: https://beautycat.kr
→ Open Graph 메타태그로 미리보기 최적화
```

### **인스타그램 비즈니스**
```
프로필 편집
→ 웹사이트: beautycat.kr
→ 바이오에 링크 추가
```

## ⚠️ **주의사항 및 팁들**

### **1. 일관성 유지**
```
모든 플랫폼에서 동일하게:
- beautycat.kr (https:// 없이)
- 또는 https://beautycat.kr (전체 URL)

혼용하지 말기:
❌ 어떤 곳은 beautycat.kr, 어떤 곳은 jansmakr.github.io
```

### **2. 메타데이터 최적화**
```html
<!-- 모든 페이지에 일관된 메타데이터 -->
<title>beautycat - 피부관리실 견적 플랫폼</title>
<meta name="description" content="우리 동네 피부관리실 견적 비교">
<link rel="canonical" href="https://beautycat.kr/">
```

### **3. 포워딩 검증**
```bash
# 301 리다이렉트 확인
curl -I https://beautycat.kr

# 기대 결과:
HTTP/1.1 301 Moved Permanently
Location: https://jansmakr.github.io/beautycat
```

## 🎯 **포워딩의 SEO 이점들**

### **검색엔진 관점**
- ✅ **301 리다이렉트**: 영구 이동으로 인식 (SEO 점수 전달)
- ✅ **도메인 권한**: beautycat.kr의 도메인 권한 유지
- ✅ **브랜드 인식**: 검색결과에 beautycat.kr로 표시
- ✅ **백링크**: 다른 사이트가 beautycat.kr로 링크 시 점수 누적

### **소셜 미디어 관점**
- ✅ **브랜딩**: 공유 시 beautycat.kr로 표시
- ✅ **신뢰도**: github.io보다 자체 도메인이 전문적
- ✅ **기억하기 쉬움**: 사용자가 도메인 기억하기 용이

## 📊 **실제 성공 사례들**

많은 기업들이 포워딩으로 운영 중:
- 스타트업들의 임시 도메인 전략
- 대기업의 캠페인 사이트들
- 정부 기관의 단축 URL들

**결론**: 포워딩으로도 모든 플랫폼 등록이 완벽하게 가능하며, 오히려 더 안정적입니다!