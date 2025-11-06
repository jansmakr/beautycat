# 🚨 긴급 수정: _redirects 업데이트

## 문제 발견
콘솔 로그 분석 결과:
```
❌ https://beautycat-v2.pages.dev/tables/users
❌ https://beautycat-v2.pages.dev/tables/skincare_shops
```

**원인:** `/tables/*` 경로가 Workers로 리디렉션되지 않음

## 해결 조치

### 1. `_redirects` 파일 수정
```
/api/* https://beautycat-api.jansmakr.workers.dev/api/:splat 200
/tables/* https://beautycat-api.jansmakr.workers.dev/api/tables/:splat 200
```

### 2. `_headers` 파일 수정
```
/api/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Max-Age: 86400

/tables/*
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
  Access-Control-Allow-Headers: Content-Type, Authorization
  Access-Control-Max-Age: 86400
```

## 즉시 재배포 필요

### GitHub Push
```bash
git add _redirects _headers
git commit -m "Fix: Add /tables/* redirect to Workers API"
git push origin main
```

### 배포 후 예상 결과
✅ `/tables/users` → Workers API 호출
✅ `/tables/skincare_shops` → Workers API 호출
✅ JSON 응답 정상 반환
✅ 로그인 성공

## 테스트
1. 배포 완료 후 (1-3분)
2. Ctrl + Shift + Delete (캐시 클리어)
3. beautycat-v2.pages.dev 재접속
4. F12 콘솔 확인:
   - ✅ "HTML 페이지 반환" 에러 사라짐
   - ✅ JSON 응답 정상 수신
