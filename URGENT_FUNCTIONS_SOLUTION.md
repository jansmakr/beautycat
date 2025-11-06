# 🚨 긴급 해결: Cloudflare Pages Functions 사용

## 문제
`_redirects` 파일이 Cloudflare Pages에서 제대로 작동하지 않음

## 해결책: Functions 사용

Cloudflare Pages는 `functions/` 폴더에 있는 JavaScript 파일을 자동으로 서버리스 함수로 실행합니다.

### 생성된 파일:
```
functions/
├── api/
│   └── [[path]].js      (모든 /api/* 요청 처리)
└── tables/
    └── [[path]].js      (모든 /tables/* 요청 처리)
```

### 작동 방식:
1. 사용자가 `/tables/users` 요청
2. Pages가 `functions/tables/[[path]].js` 실행
3. 함수가 Workers API로 프록시: `https://beautycat-api.jansmakr.workers.dev/api/tables/users`
4. Workers 응답을 사용자에게 반환

### 장점:
✅ _redirects보다 더 확실함
✅ 동적 라우팅 지원 ([[path]] = catch-all)
✅ CORS 헤더 자동 추가
✅ GET, POST, PUT, DELETE 모두 지원

## 배포 방법

### 1. 로컬 폴더 구조 확인
```
BeautyCat/
├── functions/
│   ├── api/
│   │   └── [[path]].js
│   └── tables/
│       └── [[path]].js
├── _redirects
├── _headers
└── index.html
```

### 2. GitHub Push
```bash
git add functions/
git commit -m "Add: Cloudflare Pages Functions for API proxy"
git push origin main
```

### 3. 배포 후 테스트
```
1. 배포 완료 (1-3분)
2. 캐시 클리어
3. beautycat-v2.pages.dev/tables/users 테스트
4. JSON 응답 확인
```

## 예상 결과
✅ /tables/users → Workers API 프록시 성공
✅ /tables/skincare_shops → Workers API 프록시 성공
✅ /api/health → Workers API 프록시 성공
✅ HTML 페이지 반환 에러 사라짐
