# 🔄 저장지점 -222 복원 시 외부 사이트 변경 가이드

> **복원 시점**: 2024년 10월 23일 (저장지점 -222)  
> **작성일**: 2024년 10월 31일

---

## ⚠️ 중요 안내

저장지점 -222로 복원했을 때, **GitHub 저장소의 코드는 자동으로 복원**되지만, **외부 연동 사이트들의 설정은 수동으로 확인/변경**해야 합니다.

---

## 📋 체크해야 할 외부 사이트 목록

1. ✅ **GitHub** (자동 복원됨)
2. ⚠️ **Cloudflare Pages** (확인 필요)
3. ⚠️ **Cloudflare Workers** (확인 필요)
4. ⚠️ **Cloudflare D1** (확인 필요)
5. ⚠️ **Cloudflare DNS** (확인 필요)
6. ⚠️ **예스닉 도메인** (확인 필요)

---

## 1️⃣ GitHub (자동 복원됨) ✅

### **확인 사항**
```
Repository: jansmakr/beautycat
Branch: main
상태: ✅ 저장지점 -222로 자동 복원됨
```

### **추가 확인 필요**
```bash
# GitHub에 접속하여 확인
1. https://github.com/jansmakr/beautycat 접속
2. 최신 커밋 날짜가 2024년 10월 23일인지 확인
3. Settings → Pages에서 GitHub Pages 활성화 확인
```

### **GitHub Pages 재설정 (필요시)**
```
1. Repository → Settings → Pages
2. Source: Deploy from a branch
3. Branch: main, Folder: / (root)
4. Custom domain: beautycat.kr
5. ✅ Enforce HTTPS 체크
6. Save 클릭
```

---

## 2️⃣ Cloudflare Pages ⚠️

### **현재 상태 확인 필요**
```
계정: jansmakr@gmail.com
프로젝트: beautycat-kr
연동: GitHub (jansmakr/beautycat)
```

### **✅ 확인 절차**

#### **Step 1: Cloudflare 대시보드 접속**
```
URL: https://dash.cloudflare.com
계정: jansmakr@gmail.com
```

#### **Step 2: Pages 프로젝트 확인**
```
1. 좌측 메뉴 → "Workers & Pages"
2. "beautycat-kr" 프로젝트 클릭
3. Deployments 탭 확인
```

#### **Step 3: GitHub 연동 확인**
```
Settings → Builds & deployments

✅ 확인사항:
- GitHub Repository: jansmakr/beautycat
- Production branch: main
- Build command: (비워둠 - 정적 사이트)
- Build output directory: / (root)
```

### **🔄 재배포 필요 시**
```
1. Deployments 탭
2. "Retry deployment" 클릭
또는
3. "Create deployment" → Production branch (main) 선택
```

### **⚠️ 설정이 다른 경우**
```
만약 GitHub 연동이 다른 저장소로 되어 있다면:

1. Settings → Builds & deployments
2. "Configure Production deployments" 클릭
3. GitHub Repository 변경: jansmakr/beautycat
4. Branch: main
5. Save
```

---

## 3️⃣ Cloudflare Workers ⚠️

### **현재 상태 확인 필요**
```
Worker명: beautycat-api
배포 URL: https://beautycat-api.jansmakr.workers.dev
```

### **✅ 확인 절차**

#### **Step 1: Workers 확인**
```
1. Cloudflare 대시보드
2. Workers & Pages → beautycat-api
3. "Quick edit" 버튼 클릭
```

#### **Step 2: 코드 확인**
```
현재 배포된 코드가 저장지점 -222의 코드인지 확인:

파일: cloudflare-workers-beautycat.js
첫 줄: /** beautycat.kr Cloudflare Workers API ... */
```

### **🔄 코드 재배포 필요 시**

#### **방법 1: Quick Edit (간단)**
```
1. Workers → beautycat-api → Quick edit
2. 프로젝트의 cloudflare-workers-beautycat.js 내용 복사
3. 전체 코드 교체
4. "Save and deploy" 클릭
```

#### **방법 2: Wrangler CLI (권장)**
```bash
# Wrangler 설치 (미설치 시)
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# Workers 코드 배포
wrangler deploy cloudflare-workers-beautycat.js --name beautycat-api
```

### **⚠️ D1 바인딩 확인 필수**
```
Settings → Variables → D1 database bindings

확인사항:
Variable name: BEAUTYCAT_DB
D1 database: beautycat-db

없다면 추가:
1. "Add binding" 클릭
2. Variable name: BEAUTYCAT_DB
3. D1 database: beautycat-db 선택
4. Save
```

---

## 4️⃣ Cloudflare D1 Database ⚠️

### **현재 상태 확인 필요**
```
Database명: beautycat-db
Type: D1 (SQLite)
Tables: 10개
```

### **✅ 확인 절차**

#### **Step 1: D1 데이터베이스 확인**
```
1. Cloudflare 대시보드
2. Workers & Pages → D1 SQL Database
3. "beautycat-db" 클릭
```

#### **Step 2: 테이블 구조 확인**
```
Console 탭 클릭

쿼리 실행:
SELECT name FROM sqlite_master WHERE type='table';

✅ 확인해야 할 테이블 (10개):
1. users
2. skincare_shops
3. consultations
4. quotes
5. messages
6. representative_shops
7. announcements
8. reviews
9. call_statistics
10. user_sessions
```

### **🔄 테이블이 없거나 다른 경우**

#### **데이터베이스 재생성**
```
1. D1 SQL Database → "Create database"
2. Database name: beautycat-db
3. Create 클릭
```

#### **스키마 적용**
```
1. beautycat-db → Console 탭
2. 프로젝트의 cloudflare-d1-schema.sql 파일 열기
3. 전체 SQL 복사
4. Console에 붙여넣기
5. "Execute" 클릭
```

### **⚠️ 데이터 백업 확인**
```
저장지점 -222 시점의 데이터가 중요하다면:

옵션 1: 기존 데이터베이스 유지
- 새 데이터베이스를 beautycat-db-backup으로 생성
- 기존 beautycat-db는 그대로 사용

옵션 2: 데이터 내보내기 후 재생성
- Console에서 SELECT * FROM [table] 실행
- 데이터 백업 후 재생성
```

---

## 5️⃣ Cloudflare DNS ⚠️

### **현재 상태 확인 필요**
```
Domain: beautycat.kr
Nameservers: Cloudflare
```

### **✅ 확인 절차**

#### **Step 1: DNS 레코드 확인**
```
1. Cloudflare 대시보드
2. beautycat.kr 도메인 선택
3. DNS → Records 탭
```

#### **Step 2: 필수 레코드 확인**

**CNAME 레코드 (Pages 연동)**
```
Type: CNAME
Name: beautycat.kr 또는 @
Target: beautycat-kr.pages.dev
Proxy status: ✅ Proxied (주황색 구름)
```

**CNAME 레코드 (www 서브도메인)**
```
Type: CNAME
Name: www
Target: beautycat-kr.pages.dev
Proxy status: ✅ Proxied
```

**또는 A 레코드 (GitHub Pages용)**
```
Type: A
Name: @
IPv4 address: 
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
```

### **🔄 DNS 레코드 수정 필요 시**

#### **Cloudflare Pages 연동 (권장)**
```
1. DNS → Records → Add record
2. Type: CNAME
3. Name: beautycat.kr (또는 @)
4. Target: beautycat-kr.pages.dev
5. Proxy status: Proxied ✅
6. Save
```

#### **SSL/TLS 설정 확인**
```
SSL/TLS 탭 확인:
- Encryption mode: Full (strict) 권장
- Edge Certificates: Universal SSL 활성화
- Always Use HTTPS: On
```

---

## 6️⃣ 예스닉 도메인 ⚠️

### **현재 상태 확인 필요**
```
등록기관: yesnic.com
도메인: beautycat.kr
```

### **✅ 확인 절차**

#### **Step 1: 예스닉 관리페이지 접속**
```
URL: https://www.yesnic.com
로그인 후 도메인 관리
```

#### **Step 2: 네임서버 확인**
```
beautycat.kr → 네임서버 설정

✅ Cloudflare 네임서버 (확인):
- NS: xxx.ns.cloudflare.com
- NS: yyy.ns.cloudflare.com

(Cloudflare 대시보드에서 확인 가능)
```

### **🔄 네임서버가 다른 경우**

#### **Cloudflare 네임서버로 변경**
```
1. Cloudflare 대시보드 → beautycat.kr
2. DNS → 하단에 네임서버 확인
   예: mike.ns.cloudflare.com, sara.ns.cloudflare.com

3. 예스닉 도메인 관리
4. 네임서버 변경:
   - 네임서버 1: [Cloudflare NS 1]
   - 네임서버 2: [Cloudflare NS 2]
5. 저장

⏰ DNS 전파: 최대 24-48시간 소요
```

### **⚠️ 도메인 포워딩 사용 중인 경우**
```
도메인 포워딩 사용 시:
1. 포워딩 설정 제거
2. 네임서버를 Cloudflare로 변경
3. Cloudflare에서 DNS 레코드 설정
```

---

## 7️⃣ API 커스텀 도메인 (선택사항) 🔄

### **현재 상태**
```
현재 URL: https://beautycat-api.jansmakr.workers.dev/api
목표 URL: https://api.beautycat.kr/api (미설정)
```

### **✅ 설정 방법 (필요시)**

#### **Step 1: Workers 커스텀 도메인 추가**
```
1. Cloudflare Workers → beautycat-api
2. Settings → Triggers → Custom Domains
3. "Add Custom Domain" 클릭
4. Domain: api.beautycat.kr
5. Add Custom Domain
```

#### **Step 2: DNS 자동 설정 확인**
```
Cloudflare가 자동으로 DNS 레코드 생성:
Type: CNAME
Name: api
Target: beautycat-api.jansmakr.workers.dev
```

#### **Step 3: 코드 수정**
```
js/cloudflare-api.js 파일 수정:

기존:
baseUrl: 'https://beautycat-api.jansmakr.workers.dev/api'

변경:
baseUrl: 'https://api.beautycat.kr/api'
```

---

## 🔍 전체 시스템 연동 확인 절차

### **1단계: 기본 연결 확인**
```bash
# 도메인 접속 테스트
curl -I https://beautycat.kr
curl -I https://www.beautycat.kr

# API 헬스체크
curl https://beautycat-api.jansmakr.workers.dev/api/health
```

### **2단계: GitHub 자동 배포 확인**
```
1. GitHub Repository에 README.md 수정 (작은 변경)
2. Commit & Push
3. GitHub Actions 탭에서 배포 상태 확인
4. Cloudflare Pages에서 자동 배포 확인
5. 3-5분 후 beautycat.kr 접속하여 변경 확인
```

### **3단계: API 연동 테스트**
```bash
# 사용자 목록 조회
curl https://beautycat-api.jansmakr.workers.dev/api/tables/users

# 상담 목록 조회
curl https://beautycat-api.jansmakr.workers.dev/api/tables/consultations
```

### **4단계: 웹사이트 기능 테스트**
```
1. https://beautycat.kr 접속
2. 회원가입 테스트
3. 로그인 테스트
4. 상담 신청 테스트
5. 브라우저 콘솔에서 API 호출 오류 확인
```

---

## 🆘 문제 해결 가이드

### **문제 1: 도메인 접속 안됨**
```
증상: beautycat.kr 접속 불가

해결:
1. DNS 전파 확인 (24-48시간 대기)
2. Cloudflare DNS 레코드 확인
3. 예스닉 네임서버 확인
4. 임시로 beautycat-kr.pages.dev 사용
```

### **문제 2: API 오류 (404, 500)**
```
증상: API 호출 시 오류

해결:
1. Cloudflare Workers 배포 상태 확인
2. D1 데이터베이스 바인딩 확인
3. 스키마가 올바르게 적용되었는지 확인
4. Workers 로그 확인 (Real-time Logs)
```

### **문제 3: GitHub Pages 빌드 실패**
```
증상: GitHub Actions에서 빌드 실패

해결:
1. GitHub Actions 로그 확인
2. CNAME 파일 존재 확인 (내용: beautycat.kr)
3. index.html 파일 존재 확인
4. 파일 경로 오류 확인
```

### **문제 4: Cloudflare Pages 자동 배포 안됨**
```
증상: GitHub에 push해도 배포 안됨

해결:
1. Cloudflare Pages → Settings → Builds & deployments
2. GitHub 연동 상태 확인
3. Production branch가 main인지 확인
4. "Retry deployment" 시도
```

---

## 📋 변경 체크리스트

저장지점 -222 복원 후 **반드시 확인**해야 할 사항:

### **필수 확인 (Must Check)**
- [ ] GitHub 저장소 코드 복원 확인
- [ ] GitHub Pages 활성화 확인
- [ ] Cloudflare Pages GitHub 연동 확인
- [ ] Cloudflare Workers 배포 상태 확인
- [ ] Cloudflare D1 바인딩 확인
- [ ] Cloudflare DNS 레코드 확인
- [ ] beautycat.kr 도메인 접속 확인
- [ ] API 헬스체크 확인

### **선택 확인 (Optional)**
- [ ] 예스닉 네임서버 설정
- [ ] API 커스텀 도메인 설정
- [ ] D1 데이터베이스 데이터 백업
- [ ] SSL/TLS 설정 최적화
- [ ] CDN 캐시 정리

### **기능 테스트 (Testing)**
- [ ] 회원가입 기능 테스트
- [ ] 로그인 기능 테스트
- [ ] 상담 신청 기능 테스트
- [ ] 관리자 대시보드 접근 테스트
- [ ] API 데이터 CRUD 테스트

---

## 🚀 빠른 복원 가이드

### **최소 변경으로 즉시 작동시키기**

#### **1단계: GitHub만 복원된 경우 (현재 상태)**
```
✅ 이미 완료:
- GitHub 저장소 코드 복원됨
- GitHub Pages 자동 배포됨

✅ 작동하는 URL:
- https://jansmakr.github.io/beautycat
```

#### **2단계: Cloudflare Pages 확인**
```
접속: https://dash.cloudflare.com
확인: beautycat-kr 프로젝트 → Deployments
```

만약 최신 배포가 없다면:
```
"Retry deployment" 클릭
또는
GitHub에 작은 변경사항 push
```

#### **3단계: 도메인 확인**
```
https://beautycat.kr 접속 테스트
```

만약 접속 안된다면:
```
임시로 https://beautycat-kr.pages.dev 사용
DNS 전파 대기 (최대 48시간)
```

---

## 📞 추가 지원

막히는 부분이 있다면:
1. `PROJECT_STATUS.md` 파일에서 최신 상태 확인
2. `CHECKPOINT_-222_STATUS_REPORT.md` 상세 리포트 확인
3. 디버깅 도구 사용 (`system-check.html` 등)

---

*최종 업데이트: 2024-10-31*  
*저장지점: -222 (2024-10-23)*
