# 🔍 네이버 웹마스터 도구 - 사이트맵 제출 가이드

## 📅 작성일
- **날짜**: 2024-11-27
- **버전**: v2.5.11

---

## 🎯 네이버 웹마스터에 제출할 사이트맵 URL

### 📍 사이트맵 URL (복사해서 사용하세요! 👇)

```
https://beautycat.kr/sitemap.xml
```

**💡 이 URL을 복사하여 네이버 웹마스터 도구 → 요청 → 사이트맵 제출에 입력하시면 됩니다!**

---

## 🚀 네이버 웹마스터 도구 설정 방법

### 1단계: 네이버 서치어드바이저 접속

**URL**: https://searchadvisor.naver.com/

1. 네이버 계정으로 로그인
2. 사이트 목록에서 **beautycat.kr** 선택

---

### 2단계: 사이트 소유 확인 (이미 완료됨 ✅)

**현재 상태**: ✅ **완료**

- 소유 확인 메타 태그가 이미 `index.html`에 추가되어 있습니다:
  ```html
  <meta name="naver-site-verification" content="57aaca1134648f9bcf364ec16351beaaa8df0b17" />
  ```

**확인 방법**:
```
네이버 서치어드바이저 → 사이트 관리 → 소유 확인 → "확인됨" 표시
```

---

### 3단계: 사이트맵 제출 ⭐⭐⭐⭐⭐

#### 3-1. 메뉴 접속
```
네이버 서치어드바이저 → 요청 → 사이트맵 제출
```

#### 3-2. 사이트맵 URL 입력
**입력란에 다음 URL을 복사하여 붙여넣기:**

```
https://beautycat.kr/sitemap.xml
```

또는 상대 경로로:

```
/sitemap.xml
```

#### 3-3. 제출 버튼 클릭
```
[제출] 버튼 클릭 → "사이트맵이 등록되었습니다" 메시지 확인
```

#### 3-4. 제출 완료 확인
```
상태: "제출됨" 또는 "처리 중"
최초 수집: 보통 24~48시간 이내
```

---

### 4단계: 웹페이지 수집 요청 (추가 권장) ⭐⭐⭐⭐

사이트맵 제출 후, 주요 페이지를 개별적으로 수집 요청하면 **더 빠른 색인**이 가능합니다.

#### 4-1. 메뉴 접속
```
네이버 서치어드바이저 → 요청 → 웹페이지 수집
```

#### 4-2. 주요 페이지 URL 입력 및 제출

**우선순위 높음 (반드시 제출):**
```
https://beautycat.kr/
https://beautycat.kr/index.html
https://beautycat.kr/register.html
https://beautycat.kr/login.html
```

**우선순위 중간 (권장):**
```
https://beautycat.kr/announcements.html
https://beautycat.kr/shop-registration.html
https://beautycat.kr/customer-dashboard.html
https://beautycat.kr/shop-dashboard.html
```

**법적 페이지 (선택):**
```
https://beautycat.kr/legal/terms-of-service.html
https://beautycat.kr/legal/privacy-policy.html
https://beautycat.kr/legal/youth-protection-policy.html
```

#### 4-3. 제출 방법
```
1. URL 입력란에 URL 붙여넣기
2. [요청] 버튼 클릭
3. "수집 요청되었습니다" 메시지 확인
4. 다음 URL 반복
```

**⏰ 예상 수집 시간**: 24시간 ~ 7일

---

### 5단계: RSS 제출 (선택사항)

현재 beautycat에는 RSS 피드가 없으므로 **생략 가능**합니다.

향후 블로그 섹션 추가 시:
```
네이버 서치어드바이저 → 요청 → RSS 제출
URL: https://beautycat.kr/rss.xml (향후 생성 시)
```

---

## 📊 사이트맵에 포함된 페이지

현재 `sitemap.xml`에 등록된 페이지 목록:

### 1. 메인 페이지 (최우선)
- ✅ `https://beautycat.kr/` - Priority: 1.0

### 2. 주요 기능 페이지
- ✅ `https://beautycat.kr/login.html` - Priority: 0.8
- ✅ `https://beautycat.kr/register.html` - Priority: 0.8
- ✅ `https://beautycat.kr/announcements.html` - Priority: 0.7 (신규)
- ✅ `https://beautycat.kr/shop-registration.html` - Priority: 0.8

### 3. 대시보드 페이지
- ✅ `https://beautycat.kr/customer-dashboard.html` - Priority: 0.7
- ✅ `https://beautycat.kr/shop-dashboard.html` - Priority: 0.7

### 4. 채팅 페이지
- ✅ `https://beautycat.kr/chat.html` - Priority: 0.6

### 5. 법적 페이지
- ✅ `https://beautycat.kr/legal/terms-of-service.html` - Priority: 0.4
- ✅ `https://beautycat.kr/legal/privacy-policy.html` - Priority: 0.5
- ✅ `https://beautycat.kr/legal/youth-protection-policy.html` - Priority: 0.4

### 6. 지역별 SEO 페이지 (향후 생성 예정)
- ⏳ `https://beautycat.kr/region/gangnam` - Priority: 0.9
- ⏳ `https://beautycat.kr/region/hongdae` - Priority: 0.9
- ⏳ `https://beautycat.kr/region/jamsil` - Priority: 0.8
- ⏳ `https://beautycat.kr/region/sinchon` - Priority: 0.8

**총 페이지 수**: **14개** (현재 운영 중: 10개)

---

## ✅ 제출 후 확인 사항

### 1. 사이트맵 상태 확인 (24시간 후)

```
네이버 서치어드바이저 → 요청 → 사이트맵 제출 → 제출 내역
```

**확인 항목**:
- ✅ **상태**: "수집 완료" 또는 "처리 중"
- ✅ **발견된 URL 수**: 10~14개
- ✅ **수집된 URL 수**: 점진적으로 증가
- ❌ **오류**: 오류가 있으면 수정 필요

### 2. 수집 통계 확인 (1주일 후)

```
네이버 서치어드바이저 → 통계 → 수집 현황
```

**예상 결과**:
- 수집 페이지 수: 10개 이상
- 색인 페이지 수: 8개 이상
- 검색 노출 페이지: 5개 이상

### 3. 검색 유입 확인 (1개월 후)

```
네이버 서치어드바이저 → 통계 → 검색 유입
```

**예상 지표**:
- 노출 수: 1,000+ / 월
- 클릭 수: 50+ / 월
- CTR: 3~5%

---

## ⚠️ 주의사항 및 문제 해결

### 1. 사이트맵이 제출되지 않는 경우

**원인**:
- 사이트맵 URL이 잘못됨
- 사이트 소유 확인이 안 됨
- 네트워크 오류

**해결 방법**:
```
1. URL 정확성 확인: https://beautycat.kr/sitemap.xml
2. 브라우저에서 직접 접속하여 XML 파일 확인
3. 소유 확인 상태 재확인
4. 몇 시간 후 다시 시도
```

### 2. "수집할 수 없음" 오류

**원인**:
- robots.txt에서 크롤링 차단
- 서버 오류 (500, 503 등)
- 페이지가 존재하지 않음 (404)

**해결 방법**:
```
1. robots.txt 확인:
   https://beautycat.kr/robots.txt
   → "Allow: /" 확인

2. 페이지 접속 테스트:
   각 URL에 직접 접속하여 정상 로드 확인

3. 서버 상태 확인:
   Cloudflare Pages 대시보드에서 배포 상태 확인
```

### 3. 수집은 되지만 색인이 안 되는 경우

**원인**:
- 콘텐츠 품질이 낮음
- 중복 콘텐츠
- 기술적 SEO 문제

**해결 방법**:
```
1. 메타 태그 확인 (title, description)
2. 구조화 데이터 확인 (Schema.org)
3. 페이지 로딩 속도 개선
4. 콘텐츠 품질 향상
```

---

## 📈 예상 색인 일정

### 1주차 (제출 후 1~7일)
- ✅ 사이트맵 파싱 완료
- ✅ 메인 페이지 (index.html) 수집
- ✅ 로그인, 회원가입 페이지 수집

### 2주차 (제출 후 8~14일)
- ✅ 대시보드 페이지 수집
- ✅ 공지사항 페이지 수집
- ✅ 법적 페이지 수집

### 3~4주차 (제출 후 15~30일)
- ✅ 수집된 페이지 색인 시작
- ✅ 검색 결과 일부 노출 시작
- ✅ "beautycat", "피부관리실 beautycat" 등 브랜드 키워드 노출

### 2~3개월 후
- ✅ "피부관리실", "피부관리실 추천" 등 일반 키워드 노출
- ✅ 리치 스니펫 (FAQ, 별점 등) 표시 시작
- ✅ 검색 유입 증가 (월 500~1,000명)

---

## 🔗 관련 링크

### 네이버 서치어드바이저
- **메인**: https://searchadvisor.naver.com/
- **가이드**: https://searchadvisor.naver.com/guide/
- **FAQ**: https://searchadvisor.naver.com/faq/

### beautycat 사이트맵
- **사이트맵 URL**: https://beautycat.kr/sitemap.xml
- **Robots.txt**: https://beautycat.kr/robots.txt

### 관련 문서
- `SEO_OPTIMIZATION_COMPLETE_v2.5.11.md` - SEO 최적화 가이드
- `NAVER_VERIFICATION_UPDATE_v2.5.10.1.md` - 네이버 인증 가이드
- `sitemap.xml` - 사이트맵 파일

---

## 🎯 체크리스트

### 즉시 실행 (필수) ✅
- [ ] 네이버 서치어드바이저 로그인
- [ ] 사이트 소유 확인 완료 상태 체크
- [ ] 사이트맵 제출: `https://beautycat.kr/sitemap.xml`
- [ ] 제출 완료 메시지 확인

### 추가 권장 작업 ⭐
- [ ] 웹페이지 수집 요청 (메인 페이지)
- [ ] 웹페이지 수집 요청 (회원가입 페이지)
- [ ] 웹페이지 수집 요청 (공지사항 페이지)

### 1주일 후 확인
- [ ] 사이트맵 수집 상태 확인
- [ ] 수집된 페이지 수 확인
- [ ] 오류 메시지 확인 및 수정

### 1개월 후 확인
- [ ] 검색 유입 통계 확인
- [ ] 키워드 순위 확인
- [ ] 색인된 페이지 수 확인

---

## 📞 문의

### 네이버 웹마스터 관련 문의
- **네이버 헬프센터**: https://help.naver.com/
- **네이버 서치어드바이저 문의**: https://searchadvisor.naver.com/contact

### beautycat 기술 문의
- **이메일**: utuber@kakao.com
- **전화**: 070-7004-5902

---

## 🎉 최종 요약

### ✅ 제출할 사이트맵 URL
```
https://beautycat.kr/sitemap.xml
```

### 📍 제출 위치
```
네이버 서치어드바이저 → 요청 → 사이트맵 제출
```

### ⏰ 예상 소요 시간
- **제출**: 1분
- **수집 시작**: 24시간 이내
- **색인 시작**: 1~2주
- **검색 노출**: 2~4주

### 📊 예상 효과
- 네이버 검색 색인 등록
- 검색 결과 노출 시작
- SEO 점수 향상
- 검색 유입 증가

---

**네이버 검색 상위 노출의 첫 걸음!**  
**사이트맵을 지금 제출하세요!** 🔍✨

---

**버전**: BeautyCat v2.5.11  
**문서 작성일**: 2024-11-27  
**상태**: ✅ **완료**
