# 🔐 카카오 로그인 설정 체크리스트

## ✅ 완료된 설정

### 1. 코드 수정 완료
- ✅ **동적 Redirect URI 지원** 추가
- ✅ `login.html`과 `register.html` 모두 지원
- ✅ Storage 오류 해결 (리다이렉트 방식)
- ✅ 콜백 처리 로직 구현

---

## 🚨 **필수: 카카오 Developers 설정 확인**

### 📍 Redirect URI 등록 확인

카카오 로그인이 **로그인 페이지와 회원가입 페이지 모두**에서 작동하려면, 카카오 Developers 콘솔에 **두 개의 Redirect URI**를 모두 등록해야 합니다.

#### 1. 카카오 Developers 콘솔 접속
- URL: https://developers.kakao.com
- 앱 선택: **BeautyCat** (앱 키: `99ef9d9c5749328463929a91d7c4fb8a`)

#### 2. Redirect URI 등록 확인
**경로**: `내 애플리케이션` → `앱 설정` → `플랫폼` → `Web` → `Redirect URI`

**등록되어야 할 URI (2개):**
```
https://beautycat.kr/login.html
https://beautycat.kr/register.html
```

#### 3. 등록 방법 (등록되지 않은 경우)
1. `Redirect URI` 섹션에서 **[+ Redirect URI 등록]** 클릭
2. 다음 URI를 **각각** 등록:
   - `https://beautycat.kr/login.html`
   - `https://beautycat.kr/register.html`
3. **[저장]** 클릭

---

## 🧪 테스트 방법

### 로그인 페이지에서 테스트
1. https://beautycat.kr/login.html 접속
2. "카카오로 3초만에 시작하기" 버튼 클릭
3. 카카오 로그인 완료 후 콜백 확인
4. 정상적으로 로그인 처리 확인

### 회원가입 페이지에서 테스트
1. https://beautycat.kr/register.html 접속
2. "카카오로 3초만에 시작하기" 버튼 클릭
3. 카카오 로그인 완료 후 콜백 확인
4. 정상적으로 회원가입 처리 확인

---

## 🐛 문제 발생 시

### 증상: "redirect_uri mismatch" 오류
**원인**: 카카오 Developers에 해당 URI가 등록되지 않음

**해결**:
1. 카카오 Developers 콘솔에서 Redirect URI 등록 확인
2. 정확히 `https://beautycat.kr/login.html`과 `https://beautycat.kr/register.html` 등록
3. **http://** (x) → **https://** (o) 확인
4. 마지막 슬래시 없음 확인 (예: `/login.html/` ❌)

### 증상: "Storage access denied" 오류
**원인**: 이전 팝업 방식 캐시

**해결**:
1. 브라우저 캐시 완전 삭제 (Ctrl + Shift + Delete)
2. 시크릿/인코그니토 모드에서 테스트
3. 페이지 새로고침 (Ctrl + F5)

---

## 📊 동작 플로우

### 로그인 페이지
```
login.html
  ↓ (카카오 버튼 클릭)
kauth.kakao.com (카카오 로그인)
  ↓ (로그인 완료)
login.html?code=XXXXX (콜백)
  ↓ (토큰 요청 → 사용자 정보)
customer-dashboard.html or shop-dashboard.html
```

### 회원가입 페이지
```
register.html
  ↓ (카카오 버튼 클릭)
kauth.kakao.com (카카오 로그인)
  ↓ (로그인 완료)
register.html?code=XXXXX (콜백)
  ↓ (토큰 요청 → 사용자 정보)
customer-dashboard.html or shop-dashboard.html
```

---

## 🔍 디버깅 팁

### 브라우저 콘솔에서 확인할 로그
```javascript
🚀 [Kakao] 로그인 시작
🔗 [Kakao] Redirect URI: https://beautycat.kr/login.html (또는 register.html)
🔄 [Kakao] 콜백 처리 시작
✅ [Kakao] 인증 코드 수신: xxxxxxxxxx...
🔗 [Kakao] 토큰 요청 Redirect URI: https://beautycat.kr/login.html
✅ [Kakao] 액세스 토큰 획득
✅ [Kakao] 사용자 정보 수신
✅ [Kakao] 로그인 완료
```

### 오류 발생 시 확인 사항
1. **콘솔 로그 확인**: F12 → Console 탭
2. **Network 탭 확인**: 토큰 요청 실패 여부
3. **Redirect URI 일치 여부**: 로그에서 URI 확인
4. **카카오 앱 상태**: 앱이 활성화되어 있는지 확인

---

## ✅ 최종 체크리스트

배포 전 확인:
- [ ] 카카오 Developers에 `login.html` Redirect URI 등록
- [ ] 카카오 Developers에 `register.html` Redirect URI 등록
- [ ] 로그인 페이지 카카오 버튼 테스트 완료
- [ ] 회원가입 페이지 카카오 버튼 테스트 완료
- [ ] 콘솔 오류 없음 확인
- [ ] 실제 로그인/가입 처리 정상 작동 확인

---

## 📝 변경 이력

### v2.6.2.3 (2025-12-03)
- ✅ 동적 Redirect URI 지원 추가
- ✅ `getRedirectUri()` 함수 구현
- ✅ 로그인/회원가입 페이지 모두 지원
- ✅ Storage 오류 해결 (리다이렉트 방식)

### v2.6.2.2 (2025-12-03)
- ✅ Google AdSense 코드 추가

### v2.6.2.1 (2025-12-03)
- ✅ 카카오 버튼 `min-height` 문제 해결
