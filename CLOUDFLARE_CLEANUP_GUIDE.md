# 🧹 Cloudflare 프로젝트 정리 가이드

> **작성일**: 2024년 10월 31일  
> **목적**: 불필요한 프로젝트 정리 및 최적화

---

## 🎯 정리 목표

- **BeautyCat 프로젝트만 최신 버전 유지**
- **구버전 및 미사용 프로젝트 삭제**
- **깔끔한 Cloudflare 환경 구축**

---

## 📊 현재 상태 (총 11개 프로젝트)

### **Workers (3개)**
- ✅ beautycat-api-v3 (최신, 유지)
- ❌ beautycat-api (구버전, 삭제 권장)
- ⚠️ 기타 Workers (확인 필요)

### **Pages (8개)**
- ✅ beautycat-v2 (최신, 유지)
- ❌ beautycat (구버전, 삭제 권장)
- ⚠️ carejoa-web (CareJoa 프로젝트, 필요시 유지)
- ⚠️ carejoa-pages (CareJoa 프로젝트, 필요시 유지)
- ❌ carejoa-kr (Git 연결 없음, 삭제 권장)
- ❌ carejoa-webapp (Git 연결 없음, 삭제 권장)
- ❌ beautykok (구 프로젝트, 삭제 권장)
- ❌ beautyshop-ingredients (구 프로젝트, 삭제 권장)

---

## 🔴 삭제 권장 프로젝트

### **Workers**

#### **1. beautycat-api (구버전)**
```
이유: beautycat-api-v3가 최신 버전
생성: 1일 전
요청: 771개 (이미 사용량 있음)
바인딩: 1개

⚠️ 주의: 삭제 전 beautycat-api-v3 정상 작동 확인 필수!
```

**삭제 절차**:
```
1. Cloudflare Dashboard → Workers & Pages
2. beautycat-api 클릭
3. Settings → 맨 하단 "Delete Worker"
4. Worker 이름 입력하여 확인
5. Delete 클릭
```

---

### **Pages**

#### **1. beautycat (구버전)**
```
이유: beautycat-v2가 최신 버전
생성: 6시간 전
Git: jansmakr/beautycat 연결

⚠️ 주의: beautycat-v2가 정상 작동하는지 확인 후 삭제!
⚠️ Custom Domain이 연결되어 있다면 먼저 제거 필요!
```

**삭제 전 확인**:
```
1. beautycat-v2.pages.dev 접속 확인
2. beautycat.kr 도메인이 beautycat-v2에 연결되었는지 확인
3. 모든 기능 정상 작동 확인
```

**삭제 절차**:
```
1. Cloudflare Dashboard → Workers & Pages
2. beautycat 클릭
3. Settings → 맨 하단 "Delete project"
4. 프로젝트 이름 입력하여 확인
5. Delete 클릭
```

---

#### **2. carejoa-kr (Git 연결 없음)**
```
이유: Git 연결이 없어 자동 배포 불가
생성: 8일 전
상태: 정체됨

⚠️ 질문: CareJoa 프로젝트를 계속 사용하시나요?
- 예: carejoa-web 또는 carejoa-pages만 유지
- 아니오: 모두 삭제
```

**삭제 절차**:
```
1. Workers & Pages → carejoa-kr
2. Settings → Delete project
```

---

#### **3. carejoa-webapp (Git 연결 없음)**
```
이유: Git 연결이 없고 13일 전 마지막 업데이트
생성: 13일 전
상태: 정체됨
```

**삭제 절차**: 위와 동일

---

#### **4. beautykok (구 프로젝트, Git 연결 없음)**
```
이유: 27일 전 마지막 업데이트, BeautyCat으로 리브랜딩
생성: 27일 전
상태: 구 브랜드

❓ 질문: beautykok 프로젝트를 아직 사용하시나요?
```

**삭제 절차**: 위와 동일

---

#### **5. beautyshop-ingredients (구 프로젝트, Git 연결 없음)**
```
이유: 27일 전 마지막 업데이트, 성분 관련 별도 프로젝트
생성: 27일 전
상태: 사용 여부 불명

❓ 질문: 성분 분석 기능을 따로 운영하시나요?
```

**삭제 절차**: 위와 동일

---

## ✅ 유지할 프로젝트

### **BeautyCat 프로젝트 (필수)**

#### **Workers: beautycat-api-v3**
```
생성: 46분 전 (최신)
URL: https://beautycat-api-v3.jansmakr.workers.dev
바인딩: 0개 → 1개로 수정 필요 (BEAUTYCAT_DB)
상태: ✅ 유지
```

#### **Pages: beautycat-v2**
```
생성: 1시간 전 (최신)
URL: https://beautycat-v2.pages.dev
Git: jansmakr/beautycat ✅
Custom Domain: beautycat.kr 연결 확인 필요
상태: ✅ 유지
```

#### **D1 Database: beautycat-db**
```
Tables: 10개
상태: ✅ 유지
```

---

### **CareJoa 프로젝트 (필요시 유지)**

**선택 1: CareJoa 계속 사용 중**
```
유지:
  - carejoa-web (또는 carejoa-pages 중 하나)

삭제:
  - carejoa-pages (또는 carejoa-web 중 하나)
  - carejoa-kr
  - carejoa-webapp
```

**선택 2: CareJoa 사용 안함**
```
삭제:
  - carejoa-web
  - carejoa-pages
  - carejoa-kr
  - carejoa-webapp
```

---

## 📋 단계별 정리 프로세스

### **Phase 1: 정리 계획 수립 (5분)**

1. **CareJoa 프로젝트 사용 여부 결정**
   - [ ] 계속 사용 → carejoa-web 또는 carejoa-pages 중 하나만 유지
   - [ ] 사용 안함 → 모두 삭제

2. **구 프로젝트 사용 여부 확인**
   - [ ] beautykok 사용 여부
   - [ ] beautyshop-ingredients 사용 여부

3. **삭제 대상 프로젝트 리스트 작성**
   ```
   삭제 예정:
   - [ ] beautycat-api (Workers)
   - [ ] beautycat (Pages)
   - [ ] carejoa-kr (Pages)
   - [ ] carejoa-webapp (Pages)
   - [ ] beautykok (Pages)
   - [ ] beautyshop-ingredients (Pages)
   ```

---

### **Phase 2: 백업 (선택, 10분)**

**중요 데이터가 있다면 백업 필수!**

#### **Pages 프로젝트 백업**
```
백업 불필요:
- Git 연결된 프로젝트 (GitHub에 코드 보관)
  → beautycat, carejoa-web, carejoa-pages

백업 필요:
- Git 연결 없는 프로젝트 (코드 유실 위험)
  → carejoa-kr, carejoa-webapp, beautykok, beautyshop-ingredients
```

**백업 방법**:
```
1. Pages 프로젝트 클릭
2. Deployments → 최신 배포 클릭
3. "View deployment" 클릭
4. 브라우저에서 전체 페이지 저장 (Ctrl+S)
또는
5. 배포 로그에서 소스 확인 및 다운로드
```

#### **Workers 백업**
```
1. Workers 클릭
2. Quick edit 버튼
3. 전체 코드 복사 후 로컬에 저장
```

---

### **Phase 3: beautycat-v2 안정화 (10분)**

**삭제 전 반드시 최신 버전 안정화!**

1. **beautycat-api-v3 D1 바인딩 추가**
   ```
   Workers → beautycat-api-v3 → Settings → Variables
   → D1 database bindings → Add binding
   → BEAUTYCAT_DB → beautycat-db
   → Save
   ```

2. **beautycat-v2 Custom Domain 연결**
   ```
   Pages → beautycat-v2 → Custom domains
   → Add a custom domain
   → beautycat.kr
   → Add domain
   ```

3. **API 엔드포인트 업데이트**
   ```javascript
   // GitHub 저장소에서 js/config.js 또는 js/global-config.js 수정
   apiBaseUrl: 'https://beautycat-api-v3.jansmakr.workers.dev/api'
   ```

4. **전체 기능 테스트**
   ```
   - [ ] https://beautycat-v2.pages.dev 접속
   - [ ] 회원가입 테스트
   - [ ] 로그인 테스트
   - [ ] 상담 신청 테스트
   - [ ] API 호출 오류 확인
   ```

---

### **Phase 4: 구버전 삭제 (5분)**

**⚠️ 주의: beautycat-v2가 정상 작동 확인 후에만 삭제!**

1. **beautycat (Pages) 삭제**
   ```
   조건: beautycat-v2 완전 정상 작동
   
   1. Workers & Pages → beautycat
   2. Custom domains 탭 확인 (있다면 먼저 제거)
   3. Settings → Delete project
   4. 프로젝트 이름 입력: beautycat
   5. Delete
   ```

2. **beautycat-api (Workers) 삭제**
   ```
   조건: beautycat-api-v3 완전 정상 작동
   
   1. Workers & Pages → beautycat-api
   2. Settings → Delete Worker
   3. Worker 이름 입력: beautycat-api
   4. Delete
   ```

---

### **Phase 5: 미사용 프로젝트 삭제 (10분)**

#### **Git 연결 없는 프로젝트들**
```
삭제 순서:
1. carejoa-kr
2. carejoa-webapp
3. beautykok
4. beautyshop-ingredients

각 프로젝트:
1. Workers & Pages → [프로젝트명]
2. Settings → Delete project
3. 프로젝트 이름 확인 입력
4. Delete
```

#### **CareJoa 프로젝트 정리 (선택)**
```
CareJoa 사용 안함:
1. carejoa-web 삭제
2. carejoa-pages 삭제

CareJoa 계속 사용:
1. carejoa-web 또는 carejoa-pages 중 하나만 유지
2. 나머지 삭제
```

---

### **Phase 6: 최종 확인 (5분)**

1. **남은 프로젝트 확인**
   ```
   Workers & Pages 목록:
   - [ ] beautycat-api-v3 (Workers) ✅
   - [ ] beautycat-v2 (Pages) ✅
   - [ ] beautycat-db (D1) ✅
   - [ ] carejoa-web 또는 carejoa-pages (필요시) ✅
   ```

2. **최종 동작 테스트**
   ```
   - [ ] https://beautycat.kr 접속 (또는 beautycat-v2.pages.dev)
   - [ ] 전체 기능 정상 작동
   - [ ] API 호출 정상
   - [ ] 오류 없음
   ```

3. **문서 업데이트**
   ```
   - [ ] PROJECT_STATUS.md 업데이트
   - [ ] CLOUDFLARE_CURRENT_STATUS.md 업데이트
   ```

---

## ✅ 정리 후 최종 구조

### **Cloudflare 프로젝트 (3-4개)**
```
Workers (1개):
  ✅ beautycat-api-v3
     - URL: https://beautycat-api-v3.jansmakr.workers.dev
     - Custom: https://api.beautycat.kr (선택)
     - D1 Binding: BEAUTYCAT_DB

Pages (1-2개):
  ✅ beautycat-v2
     - URL: https://beautycat-v2.pages.dev
     - Custom: https://beautycat.kr
     - Git: jansmakr/beautycat
  
  ✅ carejoa-web (필요시)
     - URL: https://carejoa-web.pages.dev
     - Git: jansmakr/sandbox

D1 Database (1개):
  ✅ beautycat-db
     - Tables: 10개
```

---

## 🆘 삭제 중 문제 발생 시

### **문제 1: Custom Domain 제거 안됨**
```
증상: "Custom domain in use" 오류

해결:
1. DNS → Records에서 해당 도메인의 CNAME 레코드 확인
2. 다른 프로젝트에서 사용 중인지 확인
3. 해당 프로젝트에서 먼저 제거
4. 다시 삭제 시도
```

### **문제 2: 프로젝트 삭제 불가**
```
증상: "Cannot delete project" 오류

해결:
1. Custom domains 모두 제거
2. 연결된 GitHub Repository 해제
3. 배포 중인 경우 완료 대기
4. 다시 삭제 시도
```

### **문제 3: 잘못 삭제한 경우**
```
대처:
1. Git 연결된 프로젝트: 새로 생성하여 Git 재연결
2. Git 연결 없는 프로젝트: 백업에서 복구
3. Workers: 코드 백업에서 재배포
```

---

## 💡 정리 팁

### **안전한 정리 순서**
```
1. 백업 먼저 (Git 연결 없는 프로젝트)
2. 최신 버전 안정화 (beautycat-v2, beautycat-api-v3)
3. 구버전 삭제 (beautycat, beautycat-api)
4. 미사용 프로젝트 삭제
```

### **삭제 전 체크리스트**
```
- [ ] 백업 완료
- [ ] 최신 버전 정상 작동
- [ ] Custom Domain 다른 프로젝트로 이동
- [ ] 삭제할 프로젝트 목록 작성
- [ ] 복구 계획 준비
```

---

## 📞 다음 단계

1. **즉시**: beautycat-v2 안정화 (D1 바인딩, Custom Domain)
2. **확인 후**: 구버전 삭제 (beautycat, beautycat-api)
3. **선택**: 미사용 프로젝트 정리
4. **완료**: 문서 업데이트

---

*정리 작업 전 반드시 백업하세요!*
