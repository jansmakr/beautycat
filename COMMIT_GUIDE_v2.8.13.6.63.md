# 🚀 배포 가이드: v2.8.13.6.63 - 견적 폼 복원 & 마퀴 속도 수정

## 📦 변경 사항

### 1. ✅ 견적서 신청 폼 복원 (상세 버전)
**목적**: 사용자 피드백 반영 - 입력 항목이 많은 버전으로 복원

#### 복원된 입력 항목:
1. **기본 정보**: 이름, 전화번호
2. **피부 사진 업로드** 📸 (선택)
3. **지역 선택**: 시/도 (17개 전체), 시/군/구
4. **관심 관리**: 9가지 옵션 (체크박스)
   - 트러블관리, 베이직관리, 여드름, 미백/톤업, 주름개선, 모공관리, 리프팅, 바디관리, 모름/기타
5. **예산 범위**: 5단계 선택
   - 5만원 이하 ~ 30만원 이상
6. **피부 상태**: 자유 기술 (textarea)
7. **추가 요청사항**: 자유 기술 (textarea)
8. **긴급 예약 옵션** ⚡: 오늘/내일 빠른 매칭

#### 버튼 변경:
- ❌ 삭제: "무료 견적 받기"
- ✅ 복원: "상담 신청하기" (20px, padding 20px 60px)

---

### 2. 🐛 샵공지 마퀴 배너 속도 수정
**문제**: 속도가 0.1초로 너무 빠름
**해결**: `css/fast-transitions.css`에서 마퀴 예외 처리 강화

#### 수정 내용:
```css
/* @media (prefers-reduced-motion: no-preference) */
.marquee-content,
.announcement-marquee .marquee-content,
#announcement-marquee .marquee-content {
    animation-duration: 90s !important;  /* 90초로 천천히 */
}

/* @media (prefers-reduced-motion: reduce) */
/* 마퀴 배너는 예외 - 항상 느리게 */
.marquee-content,
.announcement-marquee .marquee-content,
#announcement-marquee .marquee-content {
    animation-duration: 90s !important;
}
```

---

## 🔧 수정된 파일

1. **index.html** - 견적 폼 복원 (간소화 → 상세)
2. **css/fast-transitions.css** - 마퀴 속도 예외 처리 강화

---

## 📋 Git 커밋 & 푸시 명령어

```bash
# 1. 변경 사항 추가
git add index.html css/fast-transitions.css

# 2. 커밋
git commit -m "🔧 v2.8.13.6.63: 견적 폼 복원 & 마퀴 속도 수정

✅ 견적서 신청 폼 복원 (상세 버전)
- 입력 항목 복원: 피부사진, 예산, 피부상태, 추가요청사항, 긴급예약
- 관심 관리: 9가지 체크박스 옵션
- 지역 선택: 17개 시/도 전체
- 버튼 텍스트: '상담 신청하기' (font-size: 20px)

🐛 샵공지 마퀴 배너 속도 수정 완료
- fast-transitions.css에서 마퀴 예외 처리 강화
- @media 쿼리 내부에도 90s 예외 추가
- 문제: 0.1초 → 해결: 90초 천천히

🎯 목적: 사용자 피드백 반영 & 견적서 수발신 문제 해결"

# 3. 푸시
git push origin main
```

---

## ✅ 배포 후 확인사항

### 1단계: GitHub Pages 빌드 확인 (5~10분 대기)
- GitHub 저장소 → **Actions** 탭
- 최신 워크플로우 상태 확인: 🟢 Success

### 2단계: 브라우저 캐시 클리어
```
https://beautycat.kr/?v=20251221_v2.8.13.6.63&nocache=true
```

### 3단계: 기능 검증 체크리스트

#### ✅ 마퀴 배너 속도
- [ ] 샵공지 배너가 **90초 동안 천천히** 스크롤되는지 확인
- [ ] 브라우저 콘솔에서 확인:
```javascript
console.log(window.getComputedStyle(document.querySelector('.marquee-content')).animationDuration);
// 결과: "90s" (✅ 정상) / "0.15s" (❌ 문제)
```
- [ ] 샵공지 배너 클릭 시 `announcements.html`로 이동

#### ✅ 견적 신청 폼
1. **폼 항목 확인**:
   - [ ] 기본 정보 (이름, 전화번호)
   - [ ] 피부 사진 업로드 영역 표시
   - [ ] 지역 선택: 17개 시/도 전체 표시
   - [ ] 관심 관리: 9개 체크박스
   - [ ] 예산 범위: 5단계 선택
   - [ ] 피부 상태 textarea
   - [ ] 추가 요청사항 textarea
   - [ ] 긴급 예약 체크박스

2. **버튼 확인**:
   - [ ] 제출 버튼 텍스트: "상담 신청하기"
   - [ ] 버튼 크기: 20px, padding 20px 60px

3. **기능 테스트**:
   - [ ] 시/도 선택 → 시/군/구 활성화
   - [ ] 체크박스 클릭 시 선택/해제
   - [ ] 피부 사진 업로드 동작
   - [ ] 폼 제출 → 데이터베이스 저장 확인

#### ✅ 샵 대시보드
- [ ] 샵 계정 로그인 → 마이페이지 클릭
- [ ] `shop-dashboard.html` 정상 이동
- [ ] 새로운 견적 요청 확인 가능

---

## 🚨 문제 발생 시 대응

### 마퀴 속도가 여전히 빠른 경우
```bash
# Cloudflare 캐시 퍼지
Cloudflare Dashboard → Caching → Purge Everything

# 또는 브라우저 강력 캐시 삭제
Ctrl + Shift + Delete → "캐시된 이미지 및 파일" 삭제
```

### 견적 폼이 표시되지 않는 경우
```bash
# 브라우저 콘솔(F12)에서 확인
console.log(document.getElementById('consultationForm'));
# null이면 JavaScript 로딩 오류 → js/main.js 확인
```

---

## 📌 버전 정보

- **이전 버전**: v2.8.13.6.62.1 (CTA 버튼 최적화)
- **현재 버전**: v2.8.13.6.63 (견적 폼 복원 & 마퀴 속도 수정)
- **배포 시간**: 2025-12-21
- **주요 변경**: 견적서 수발신 개선, 사용자 피드백 반영

---

## 📞 문의

문제가 지속될 경우:
1. GitHub Actions 로그 확인
2. 브라우저 콘솔 에러 메시지 캡처
3. 테스트 URL 및 에러 상황 공유
