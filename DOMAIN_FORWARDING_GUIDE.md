# 🚀 도메인 포워딩 설정 가이드

## 📋 **추천: 포워딩 방식으로 전환**

### **1단계: GitHub Pages 커스텀 도메인 제거**
```
GitHub Repository → Settings → Pages → Custom domain 필드 비우기 → Save
```

### **2단계: 도메인 업체에서 포워딩 설정**

#### **가비아 설정 예시**
```
DNS 관리 → URL 포워딩 설정
- beautycat.kr → https://jansmakr.github.io/beautycat
- www.beautycat.kr → https://jansmakr.github.io/beautycat
- 포워딩 타입: 301 Redirect (영구 이동)
- 프레임 사용: X (SEO에 불리)
```

#### **후이즈 설정 예시**
```
도메인 관리 → 포워딩 서비스
- 원본: beautycat.kr
- 목적지: https://jansmakr.github.io/beautycat  
- 포워딩 방식: 301 리다이렉트
```

#### **CloudFlare 설정 예시** (고급)
```
Page Rules 설정:
- beautycat.kr/* → https://jansmakr.github.io/beautycat/$1
- Status Code: 301 - Permanent Redirect
```

## ✅ **포워딩의 장점들**

### **1. 즉시 안정성**
- DNS 전파 시간: 5-30분 (vs 24-48시간)
- SSL 문제 없음 (GitHub Pages가 처리)
- Service Worker redirect 오류 없음

### **2. 간단한 관리**
```
유지보수 작업:
❌ DNS A/CNAME 레코드 관리 필요 없음
❌ GitHub Pages SSL 재발급 기다리기 필요 없음
❌ CNAME 파일 관리 필요 없음
✅ 도메인 업체에서 URL만 변경하면 됨
```

### **3. 높은 가용성**
- GitHub Pages 장애 시에도 도메인은 살아있음
- 필요시 다른 호스팅으로 즉시 변경 가능
- 백업 서버로 쉽게 전환 가능

### **4. SEO 영향 최소**
```
301 Redirect는 SEO에 안전함:
- 검색엔진이 beautycat.kr → jansmakr.github.io로 권한 전달
- 기존 검색 순위 유지
- 브랜드 도메인 인식 지속
```

## 🎨 **사용자 경험 개선**

### **주소창 표시 개선**
JavaScript로 브랜드 도메인 표시:
```javascript
// 포워딩된 경우 원래 도메인 표시
if (document.referrer.includes('beautycat.kr')) {
    document.title = 'beautycat.kr - ' + document.title;
}
```

### **소셜 공유 최적화**
```html
<!-- Open Graph 태그로 브랜드 도메인 표시 -->
<meta property="og:url" content="https://beautycat.kr">
<meta property="og:site_name" content="beautycat.kr">
```

## 🔄 **설정 후 확인사항**

### **1. 포워딩 테스트**
```bash
# HTTP 응답 헤더 확인
curl -I https://beautycat.kr

# 기대 결과:
HTTP/1.1 301 Moved Permanently
Location: https://jansmakr.github.io/beautycat
```

### **2. 속도 테스트**
- 포워딩으로 인한 추가 지연: 보통 50-200ms
- 사용자가 느끼지 못할 정도
- 안정성 대비 충분히 감수할만함

### **3. SEO 도구 확인**
```
Google Search Console:
- beautycat.kr로 속성 등록
- 301 리다이렉트 정상 인식 확인

Google PageSpeed Insights:
- beautycat.kr URL로 테스트
- 포워딩 영향 미미함 확인
```

## 🚀 **즉시 실행 체크리스트**

### **오늘 바로 할 수 있는 것들**
- [ ] GitHub Pages Custom domain 제거
- [ ] 도메인 업체 로그인  
- [ ] URL 포워딩 설정 (301 redirect)
- [ ] 5-30분 후 beautycat.kr 접속 테스트
- [ ] 모든 기능 정상 작동 확인

### **예상 결과**
```
✅ beautycat.kr → 즉시 사이트 접속 가능
✅ 안정적인 연결 (더 이상 ERR_FAILED 없음)
✅ 모든 기능 정상 작동
✅ 빠른 로딩 속도 유지
✅ SEO 영향 없음
```

---

## 💡 **결론: 포워딩 추천 이유**

현재 상황에서는 **포워딩 방식이 압도적으로 유리**합니다:

1. **즉시 해결**: 오늘 바로 안정적인 도메인 연결
2. **장기 안정성**: GitHub Pages 변경사항 영향 받지 않음  
3. **관리 편의**: 복잡한 DNS 설정 불필요
4. **확장성**: 추후 다른 호스팅으로 쉽게 이전 가능

**추천**: 포워딩으로 당장 안정화하고, 서비스가 성장하면 전용 호스팅 고려!