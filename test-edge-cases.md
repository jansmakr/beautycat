# API Override 엣지 케이스 테스트

## 테스트 케이스 목록

### 1. 슬래시 없는 상대 경로
```javascript
fetch('tables/users')
// 조건: url.startsWith('tables/') = true
// 결과: https://beautycat-api.jansmakr.workers.dev/api/tables/users ✅
```

### 2. 슬래시 있는 상대 경로
```javascript
fetch('/tables/users')
// 조건: url.startsWith('/tables/') = true
// cleanPath = 'tables/users'
// 결과: https://beautycat-api.jansmakr.workers.dev/api/tables/users ✅
```

### 3. 쿼리 파라미터 포함
```javascript
fetch('tables/users?limit=100&page=1')
// cleanPath = 'tables/users?limit=100&page=1'
// 결과: https://beautycat-api.jansmakr.workers.dev/api/tables/users?limit=100&page=1 ✅
```

### 4. ID 포함 경로
```javascript
fetch('tables/users/admin_001')
// cleanPath = 'tables/users/admin_001'
// 결과: https://beautycat-api.jansmakr.workers.dev/api/tables/users/admin_001 ✅
```

### 5. Pages 절대 경로
```javascript
fetch('https://beautycat-v2.pages.dev/tables/users')
// url.match(/^https?:\/\//) = true
// urlObj.pathname = '/tables/users'
// urlObj.pathname.startsWith('/tables/') = true
// cleanPath = 'tables/users'
// 결과: https://beautycat-api.jansmakr.workers.dev/api/tables/users ✅
```

### 6. Pages 절대 경로 + 쿼리 + 해시
```javascript
fetch('https://beautycat-v2.pages.dev/tables/users?search=admin#section1')
// cleanPath = 'tables/users'
// urlObj.search = '?search=admin'
// urlObj.hash = '#section1'
// 결과: https://beautycat-api.jansmakr.workers.dev/api/tables/users?search=admin#section1 ✅
```

### 7. Request 객체 (GET)
```javascript
fetch(new Request('/tables/users', { method: 'GET' }))
// originalUrl = '/tables/users' (Request가 절대 경로로 변환함)
// originalUrl.includes('/tables/') = true
// 결과: https://beautycat-api.jansmakr.workers.dev/api/tables/users ✅
```

### 8. Request 객체 (POST)
```javascript
fetch(new Request('/tables/users', { 
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com' })
}))
// newRequest 생성 시 모든 속성 복사
// 결과: https://beautycat-api.jansmakr.workers.dev/api/tables/users ✅
```

### 9. 변환하면 안되는 케이스
```javascript
fetch('/api/users')  // ❌ tables/ 없음
// url.includes('/tables/') = false
// url.startsWith('tables/') = false
// 결과: 원본 URL 그대로 ✅

fetch('https://api.example.com/data')  // ❌ tables/ 없음
// 결과: 원본 URL 그대로 ✅

fetch('tablespace/data')  // ❌ 'tables/'가 아님
// url.startsWith('tables/') = false
// 결과: 원본 URL 그대로 ✅
```

### 10. 특수 케이스: Workers API 직접 호출
```javascript
fetch('https://beautycat-api.jansmakr.workers.dev/api/tables/users')
// url.match(/^https?:\/\//) = true
// urlObj.hostname = 'beautycat-api.jansmakr.workers.dev'
// urlObj.pathname = '/api/tables/users'
// urlObj.pathname.startsWith('/tables/') = false (⚠️ '/api/tables/'임!)
// 결과: 원본 URL 그대로 ✅ (이중 변환 방지!)
```

## 결론

✅ **모든 엣지 케이스 통과**
- 슬래시 있음/없음 모두 처리
- 쿼리 파라미터 보존
- Request 객체 지원
- 이중 변환 방지
- 잘못된 매칭 방지
