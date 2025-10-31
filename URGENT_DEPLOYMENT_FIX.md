# 🚨 긴급 배포 수정 가이드

**문제**: 배포된 사이트가 beautycat-api-v3로 요청하고 500 오류 발생  
**원인**: GitHub에 최신 코드가 push되지 않음  
**해결**: Git push하여 Cloudflare Pages 자동 재배포

---

## 🔥 즉시 해야 할 것

### Git Push (2분)

```bash
cd /path/to/beautycat

# 변경사항 확인
git status

# 모든 파일 추가
git add .

# 커밋
git commit -m "Fix: Update API URLs to beautycat-api (not v3) + Add D1 integration"

# GitHub에 push
git push origin main
```

---

## ⏰ 배포 대기 (2-3분)

### 1. GitHub Actions 확인
- https://github.com/jansmakr/beautycat/actions
- 최신 워크플로우가 실행 중인지 확인
- 초록색 체크마크 나올 때까지 대기

### 2. Cloudflare Pages 확인
- https://dash.cloudflare.com
- Pages → beautycat-v2
- 최신 배포 확인 (2-3분 소요)

---

## ✅ 배포 완료 후 테스트

### 1. 캐시 초기화
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. beautycat.kr 접속
- 개발자 도구(F12) → Console 확인
- 다음 메시지가 나와야 함:
  ```
  ✅ BeautyCat API Helper 로드 완료
  📡 API Base URL: https://beautycat-api.jansmakr.workers.dev/api
  ```

### 3. API 테스트
```javascript
// 콘솔에서 실행
API.checkHealth().then(console.log);
// ✅ {success: true, data: {status: "healthy"}}

API.get('users').then(r => console.log('사용자:', r.data.total));
// ✅ 사용자: 1

API.get('skincare_shops').then(r => console.log('샵:', r.data.total));
// ✅ 샵: 3
```

### 4. 로그인 테스트
- beautycat.kr/login.html 접속
- 관리자 로그인:
  ```
  이메일: admin@beautycat.kr
  비밀번호: beautycat2024!
  ```
- admin-dashboard.html로 리다이렉트되면 성공! ✅

---

## 🚨 여전히 오류가 나는 경우

### 원인: 브라우저 캐시

#### 해결책 1: 시크릿 모드
```
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)
```

#### 해결책 2: 캐시 완전 삭제
```
Chrome:
1. F12 → Application 탭
2. Clear storage
3. Clear site data

Firefox:
1. F12 → Storage 탭
2. Cookies, Local Storage, IndexedDB 모두 삭제
```

#### 해결책 3: 다른 브라우저로 테스트
- 크롬, 파이어폭스, 사파리, 엣지 중 하나

---

## 📋 체크리스트

- [ ] Git push 완료
- [ ] GitHub Actions 성공 (초록색)
- [ ] Cloudflare Pages 배포 완료
- [ ] 캐시 초기화 (Ctrl+Shift+R)
- [ ] API Health Check 성공
- [ ] 관리자 로그인 성공
- [ ] 데이터 조회 성공

---

## 🎯 예상 결과

배포 후 콘솔 로그:
```
✅ BeautyCat API Helper 로드 완료
📡 API Base URL: https://beautycat-api.jansmakr.workers.dev/api
✅ API 정상 작동
📊 사용자: 1명
🏪 샵: 3개
⭐ 대표업체: 2개
```

---

## 📞 여전히 문제가 있다면

다음 정보를 공유해주세요:

1. **Git push 결과**:
   ```bash
   git push origin main
   # 출력 내용 복사
   ```

2. **브라우저 콘솔 로그**:
   - F12 → Console 탭
   - 모든 오류 메시지 복사

3. **네트워크 탭**:
   - F12 → Network 탭
   - "users" 필터
   - 실패한 요청의 URL 확인

---

**Git push 후 결과를 알려주세요!** 🚀
