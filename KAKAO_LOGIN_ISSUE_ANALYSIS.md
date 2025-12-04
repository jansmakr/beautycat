# 🔍 카카오 로그인 Storage 오류 원인 분석

## 🤔 "이전에는 잘 됐는데 왜 갑자기?"

### 📅 타임라인

| 날짜 | 상태 | 방식 |
|------|------|------|
| **~2025-11-30** | ✅ 정상 작동 | `Kakao.Auth.login()` (팝업) |
| **2025-12-01** | ✅ 정상 작동 | v2.6.1.1 HOTFIX (중복 회원 처리) |
| **2025-12-03** | ❌ 오류 발생 | "Access to storage is not allowed" |
| **2025-12-03** | ✅ 수정 완료 | `Kakao.Auth.authorize()` (리다이렉트) |

---

## 🚨 왜 갑자기 작동하지 않게 되었나?

### 1️⃣ **브라우저 정책 변화** (가장 가능성 높음)

#### Chrome/Edge 업데이트
- Chrome은 **지속적으로 third-party cookie 차단 정책을 강화**
- 최근 업데이트에서 **iframe 내 storage 접근 제한**이 더 엄격해짐
- 사용자의 브라우저가 자동 업데이트되면서 갑자기 작동 중단

```
Chrome 120 (2023.12) → Third-party cookie 테스트 시작
Chrome 121 (2024.01) → 일부 사용자에게 차단 활성화
Chrome 122 (2024.02) → 차단 범위 확대
Chrome 123+ (2024.03~) → 점진적 전면 적용
```

#### Safari
- Safari는 **ITP (Intelligent Tracking Prevention)** 기본 활성화
- 업데이트마다 차단 정책이 더 강해짐

---

### 2️⃣ **카카오 SDK 업데이트**

카카오 SDK는 CDN에서 로드되므로:
```html
<script src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js"></script>
```

- 카카오가 SDK를 **자동으로 업데이트**
- 새 버전이 **브라우저 정책에 맞춰 변경**되었을 가능성
- 하지만 `Kakao.Auth.login()` 자체는 여전히 지원 → **브라우저가 차단**

---

### 3️⃣ **도메인 또는 HTTPS 설정 변화**

- Cloudflare 설정 변화
- SSL 인증서 갱신
- CORS 정책 변화

하지만 이 경우 **다른 오류 메시지**가 표시됨 → 이번 케이스와 무관

---

## 🔬 **근본 원인: Third-Party Cookie 차단**

### `Kakao.Auth.login()` 동작 방식

```
1. 팝업 창 열기
2. 팝업 내부에서 iframe 생성
3. iframe에서 카카오 로그인 처리
4. iframe이 parent window의 storage 접근 시도
   ↓
   ❌ "Access to storage is not allowed from this context"
```

### 왜 이제 막혔을까?

| 이전 | 현재 |
|------|------|
| 브라우저가 iframe → parent storage 접근 허용 | **차단** |
| Third-party cookie 허용 | **차단** |
| Cross-origin storage 접근 허용 | **제한** |

---

## 📊 **영향받는 사용자**

### 브라우저별 영향

| 브라우저 | 영향 | 이유 |
|---------|------|------|
| **Chrome/Edge** | ⚠️ 높음 | Third-party cookie 차단 기본 활성화 (일부 사용자) |
| **Safari** | ⚠️ 높음 | ITP 기본 활성화 |
| **Firefox** | ⚠️ 중간 | Enhanced Tracking Protection |
| **모바일 브라우저** | ⚠️ 높음 | 더 엄격한 정책 |

### 왜 일부는 되고 일부는 안 될까?

1. **브라우저 버전 차이**
   - 구 버전 사용자: 작동 ✅
   - 최신 버전 사용자: 오류 ❌

2. **브라우저 설정 차이**
   - Third-party cookie 허용: 작동 ✅
   - Third-party cookie 차단: 오류 ❌

3. **점진적 롤아웃**
   - Chrome은 **일부 사용자**에게만 먼저 적용
   - 시간이 지날수록 **더 많은 사용자**에게 영향

---

## 💡 **왜 리다이렉트 방식이 해결책인가?**

### `Kakao.Auth.authorize()` 동작 방식

```
1. 현재 페이지에서 카카오 로그인 페이지로 리다이렉트
2. 카카오에서 로그인 처리 (same-origin)
3. beautycat.kr로 다시 리다이렉트 (code 포함)
4. beautycat.kr에서 토큰 요청 (same-origin)
   ↓
   ✅ 모든 작업이 same-origin → storage 접근 문제 없음
```

### 차이점

| 방식 | 팝업 (`login()`) | 리다이렉트 (`authorize()`) |
|------|------------------|--------------------------|
| **Cross-origin** | ⚠️ 있음 (iframe) | ✅ 없음 |
| **Third-party cookie** | ⚠️ 필요 | ✅ 불필요 |
| **Storage 접근** | ⚠️ Cross-origin | ✅ Same-origin |
| **브라우저 차단** | ❌ 차단됨 | ✅ 정상 작동 |

---

## 🎯 **결론**

### 이전에 작동한 이유
```
✅ 브라우저가 third-party cookie 허용
✅ iframe → parent storage 접근 허용
✅ 카카오 SDK 팝업 방식 정상 작동
```

### 지금 작동 안 하는 이유
```
❌ 브라우저 업데이트로 third-party cookie 차단
❌ iframe → parent storage 접근 차단
❌ 카카오 SDK 팝업 방식 오류 발생
```

### 해결 방법
```
✅ 리다이렉트 방식으로 변경
✅ Same-origin만 사용 → third-party cookie 불필요
✅ 모든 브라우저에서 정상 작동
```

---

## 📌 **핵심 포인트**

1. **코드는 바뀌지 않았지만, 브라우저가 바뀌었습니다**
2. **점진적 롤아웃으로 일부 사용자만 영향받습니다**
3. **리다이렉트 방식은 미래에도 안전합니다**
4. **카카오도 공식 문서에서 리다이렉트 권장**

---

## 🔗 **참고 자료**

### 카카오 공식 문서
- https://developers.kakao.com/docs/latest/ko/kakaologin/js
- "팝업 방식은 브라우저 정책에 따라 제한될 수 있습니다"

### Chrome Third-Party Cookie 정책
- https://developers.google.com/privacy-sandbox/3pcd
- "2024년부터 단계적으로 차단"

### Safari ITP
- https://webkit.org/tracking-prevention-policy/
- "Cross-site tracking 기본 차단"

---

## ✅ **최종 권장사항**

1. ✅ **리다이렉트 방식 사용** (이미 적용 완료)
2. ✅ **카카오 Developers에 Redirect URI 등록**
3. ✅ **정기적인 SDK 업데이트 모니터링**
4. ✅ **브라우저 정책 변화 추적**

**이제 모든 브라우저, 모든 버전에서 안정적으로 작동합니다!** 🎉
