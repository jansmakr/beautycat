# ✅ 저장지점 -222 빠른 복원 체크리스트

> **목표**: 5-10분 내 복원 시점 설정 확인 및 수정  
> **작성일**: 2024년 10월 31일

---

## 🎯 핵심 요약

**저장지점 -222 (10월 23일)의 올바른 구성:**

```
Frontend: beautycat-v2 (Cloudflare Pages)
Backend:  beautycat-api (Cloudflare Workers) ← beautycat-api-v3 아님!
Database: beautycat-db (Cloudflare D1)
Domain:   beautycat.kr
```

---

## 🔴 필수 확인 사항 (5분)

### **1. GitHub (자동 복원됨) ✅**
```
✅ 저장지점 -222로 자동 복원됨
✅ 추가 조치 불필요
```

### **2. Cloudflare Workers - 중요!**

#### **확인: beautycat-api 사용 중인지**
```bash
# API 테스트
curl https://beautycat-api.jansmakr.workers.dev/api/health

✅ 정상 응답: JSON 반환
❌ 오류: 3번 확인
```

#### **확인: D1 바인딩**
```
1. https://dash.cloudflare.com
2. Workers & Pages → beautycat-api
3. Settings → Variables → D1 database bindings

✅ 확인: BEAUTYCAT_DB → beautycat-db 연결됨
```

### **3. 프론트엔드 API 경로 - 중요!**

#### **GitHub에서 확인**
```javascript
// 파일: js/config.js 또는 js/global-config.js

// ✅ 올바른 설정 (복원 시점)
apiBaseUrl: 'https://beautycat-api.jansmakr.workers.dev/api'

// ❌ 잘못된 설정 (최근 변경)
apiBaseUrl: 'https://beautycat-api-v3.jansmakr.workers.dev/api'
```

#### **잘못 설정된 경우 수정**
```bash
# 1. GitHub에서 js/config.js 수정
# 2. beautycat-api URL로 변경
# 3. Commit & Push
# 4. 자동 배포 대기 (3-5분)
```

---

## 🟡 권장 확인 사항 (5분)

### **4. Cloudflare Pages Custom Domain**
```
1. Workers & Pages → beautycat-v2
2. Custom domains 탭
3. beautycat.kr 연결 확인

❌ 없다면:
   - Add a custom domain
   - beautycat.kr 입력
   - Add domain
```

### **5. 웹사이트 테스트**
```
1. https://beautycat-v2.pages.dev 접속
2. 또는 https://beautycat.kr
3. 브라우저 콘솔 열기 (F12)
4. 회원가입/로그인 테스트
5. API 오류 확인
```

---

## 📋 체크리스트

### **필수 (5분)**
- [ ] beautycat-api D1 바인딩 확인
  ```
  Workers → beautycat-api → Settings → Variables
  D1 bindings: BEAUTYCAT_DB → beautycat-db
  ```
  
- [ ] beautycat-api API 테스트
  ```bash
  curl https://beautycat-api.jansmakr.workers.dev/api/health
  ```
  
- [ ] 프론트엔드 API 경로 확인
  ```
  GitHub: js/config.js
  beautycat-api 경로인지 확인
  beautycat-api-v3 아닌지 확인
  ```

### **권장 (5분)**
- [ ] beautycat-v2 Custom Domain
  ```
  Pages → beautycat-v2 → Custom domains
  beautycat.kr 연결 확인
  ```
  
- [ ] 웹사이트 전체 테스트
  ```
  https://beautycat.kr 접속
  회원가입/로그인 테스트
  상담 신청 테스트
  콘솔 오류 확인
  ```

---

## 🚫 하지 말아야 할 것

### **❌ beautycat-api-v3 사용**
```
이유: 복원 시점 이후에 생성됨 (46분 전)
결과: 복원 시점 데이터 없을 수 있음
```

### **❌ beautycat-api 삭제**
```
이유: 복원 시점의 올바른 Workers
결과: 서비스 중단
```

### **❌ D1 바인딩 변경**
```
이유: 복원 시점 설정이 올바름
결과: 데이터베이스 접근 불가
```

---

## 🆘 빠른 문제 해결

### **문제: API 호출 실패**
```
증상: 회원가입, 로그인 작동 안함

해결:
1. js/config.js 확인
2. beautycat-api-v3 → beautycat-api로 수정
3. Commit & Push
```

### **문제: 웹사이트 접속 안됨**
```
증상: beautycat.kr 접속 불가

해결:
1. beautycat-v2.pages.dev 접속 테스트
2. 작동하면 DNS 전파 대기
3. Custom Domain 설정 확인
```

### **문제: Database 오류**
```
증상: "Database not found"

해결:
1. beautycat-api → Settings → Variables
2. D1 bindings 확인
3. BEAUTYCAT_DB → beautycat-db 연결 확인
```

---

## 📚 상세 문서

더 자세한 내용은:
- **EXTERNAL_SERVICES_CHECKPOINT_222.md** - 전체 외부 서비스 상태
- **CLOUDFLARE_CORRECT_RESTORATION_GUIDE.md** - Cloudflare 복원 가이드
- **CLOUDFLARE_DB_VERSION_CHECK.md** - DB 버전 확인

---

## ✅ 완료 확인

### **모든 것이 정상이면:**
```
✅ beautycat-api API 정상 응답
✅ 프론트엔드가 beautycat-api 사용
✅ beautycat.kr 접속 가능
✅ 회원가입/로그인 작동
✅ 콘솔 오류 없음

→ 복원 완료! 🎉
```

---

**🎯 3가지만 확인하세요:**
1. beautycat-api D1 바인딩 ✅
2. 프론트엔드 API 경로 = beautycat-api ✅
3. 웹사이트 작동 테스트 ✅

*5-10분이면 충분합니다!*
