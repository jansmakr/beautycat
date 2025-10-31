# 🧪 BeautyCat API 테스트 가이드

**복원 시점 API**: beautycat-api (Checkpoint -222)  
**테스트 일시**: 2024년 10월 31일  
**목적**: beautycat-api가 정상 작동하는지 확인

---

## 📡 API 엔드포인트 정보

### **Base URL**
```
https://beautycat-api.jansmakr.workers.dev/api
```

### **Custom Domain** (설정 완료)
```
https://api.beautycat.kr/api
```

### **D1 Database**
```
Database: beautycat-db
Binding: beautycat-db ✅ (연결 확인 완료)
Tables: 10개
```

---

## 🚀 즉시 테스트 가능한 명령어

### 1. Health Check (가장 기본)
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/health
```

**예상 응답**:
```json
{
  "status": "ok",
  "timestamp": "2024-10-31T...",
  "database": "connected"
}
```

---

### 2. 테이블 목록 조회
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/tables
```

**예상 응답**:
```json
{
  "tables": [
    "users",
    "skincare_shops",
    "consultations",
    "quotes",
    "messages",
    "representative_shops",
    "announcements",
    "reviews",
    "call_statistics",
    "user_sessions"
  ]
}
```

---

### 3. Users 테이블 조회
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users
```

**예상 응답**:
```json
{
  "data": [...],
  "total": 10,
  "page": 1,
  "limit": 100,
  "table": "users",
  "schema": {...}
}
```

---

### 4. 제품 목록 조회 (페이징)
```bash
curl "https://beautycat-api.jansmakr.workers.dev/api/tables/products?page=1&limit=10"
```

---

### 5. 특정 레코드 조회 (ID 필요)
```bash
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users/{record_id}
```

---

### 6. 새 레코드 생성 (POST)
```bash
curl -X POST \
  https://beautycat-api.jansmakr.workers.dev/api/tables/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "테스트 사용자",
    "email": "test@example.com",
    "phone": "010-1234-5678"
  }'
```

**예상 응답**:
```json
{
  "id": "uuid-generated",
  "name": "테스트 사용자",
  "email": "test@example.com",
  "phone": "010-1234-5678",
  "created_at": 1730368800000,
  "updated_at": 1730368800000,
  "gs_project_id": "...",
  "gs_table_name": "users"
}
```

---

### 7. 레코드 업데이트 (PUT)
```bash
curl -X PUT \
  https://beautycat-api.jansmakr.workers.dev/api/tables/users/{record_id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "수정된 이름",
    "email": "updated@example.com"
  }'
```

---

### 8. 레코드 삭제 (DELETE)
```bash
curl -X DELETE \
  https://beautycat-api.jansmakr.workers.dev/api/tables/users/{record_id}
```

**예상 응답**: HTTP 204 No Content

---

## 🌐 브라우저에서 테스트

### 브라우저 콘솔에서 실행 (개발자 도구 F12)

```javascript
// Health Check
fetch('https://beautycat-api.jansmakr.workers.dev/api/health')
  .then(r => r.json())
  .then(data => console.log('Health:', data));

// Users 조회
fetch('https://beautycat-api.jansmakr.workers.dev/api/tables/users')
  .then(r => r.json())
  .then(data => console.log('Users:', data));

// 새 사용자 생성
fetch('https://beautycat-api.jansmakr.workers.dev/api/tables/users', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: '테스트',
    email: 'test@test.com',
    phone: '010-0000-0000'
  })
})
  .then(r => r.json())
  .then(data => console.log('Created:', data));
```

---

## 📊 10개 테이블 목록

1. **users** - 사용자 관리
2. **skincare_shops** - 피부관리실 정보
3. **consultations** - 상담 신청 내역
4. **quotes** - 견적서 관리
5. **messages** - 채팅 메시지
6. **representative_shops** - 대표샵 지정
7. **announcements** - 공지사항
8. **reviews** - 리뷰 및 평가
9. **call_statistics** - 통화 통계
10. **user_sessions** - 세션 관리

---

## ✅ 테스트 체크리스트

### 기본 연결 테스트
- [ ] Health Check 응답 확인
- [ ] 테이블 목록 조회 성공
- [ ] 응답 시간 측정 (0.5ms 예상)

### CRUD 작업 테스트
- [ ] GET - 레코드 조회
- [ ] POST - 레코드 생성
- [ ] PUT - 레코드 수정
- [ ] DELETE - 레코드 삭제

### D1 Database 확인
- [ ] 10개 테이블 존재 확인
- [ ] 각 테이블 스키마 확인
- [ ] 데이터 읽기/쓰기 정상 작동

### Custom Domain 테스트
- [ ] api.beautycat.kr 접속 확인
- [ ] SSL 인증서 정상 작동
- [ ] 응답 속도 비교 (workers.dev vs custom domain)

---

## 🚨 오류 발생 시 확인 사항

### 502 Bad Gateway
- Workers가 중단되었을 가능성
- Cloudflare Dashboard에서 beautycat-api 상태 확인

### 500 Internal Server Error
- D1 바인딩 문제
- Variables and Secrets에서 beautycat-db 바인딩 확인

### 404 Not Found
- 잘못된 엔드포인트 경로
- `/api` prefix 확인

### CORS 오류
- 브라우저에서 요청 시 CORS 설정 확인
- Workers 코드에서 CORS 헤더 확인

---

## 📈 성능 모니터링

### Cloudflare Dashboard에서 확인 가능
1. Workers & Pages → beautycat-api
2. Metrics 탭 클릭
3. 확인 항목:
   - **Requests**: 총 요청 수 (현재 771개)
   - **Errors**: 오류 발생 건수
   - **CPU Time**: 평균 처리 시간
   - **Success Rate**: 성공률

---

## 🎯 다음 단계

### API가 정상 작동하면:
1. ✅ Frontend 코드에서 API URL 확인
2. ✅ js/config.js 또는 js/global-config.js에서 `apiBaseUrl` 확인
3. ✅ beautycat-api (not beautycat-api-v3) 사용 여부 확인

### 문제가 발견되면:
1. Workers 로그 확인 (Real-time logs)
2. D1 Database 쿼리 로그 확인
3. CLOUDFLARE_CORRECT_RESTORATION_GUIDE.md 참조

---

**테스트 완료 후 결과를 공유해주시면 추가 조치를 안내드리겠습니다!** 🚀
