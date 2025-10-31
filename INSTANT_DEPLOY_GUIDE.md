# 🚀 beautycat 즉시 배포 가이드

## ⏰ 목표: 30분 내 https://beautycat.kr 접속 가능!

### 🎯 1단계: GitHub Repository 생성 (5분)

#### A. GitHub 로그인/가입
1. https://github.com 접속
2. 계정이 없다면 "Sign up" (무료)
3. 계정이 있다면 "Sign in"

#### B. Repository 생성
1. 우측 상단 "+" → "New repository"
2. Repository name: `beautycat`
3. Description: `beautycat 피부관리실 견적 플랫폼`
4. Public 선택 (중요!)
5. "Create repository" 클릭

### 🔧 2단계: 파일 업로드 (10분)

#### A. 웹에서 직접 업로드
1. "uploading an existing file" 클릭
2. 아래 파일들을 드래그 앤 드롭:

**✅ 필수 업로드 파일 목록:**
```
📄 index.html
📄 login.html  
📄 register.html
📄 customer-dashboard.html
📄 shop-dashboard.html
📄 admin-dashboard.html
📄 contact-inquiry.html
📄 chat.html
📄 CNAME
📄 manifest.json
📄 sw.js
📄 deploy-ready-config.js

📁 js/ 폴더 전체
├── main.js
├── auth.js
├── shop-dashboard.js
├── customer-dashboard.js
├── admin-dashboard.js
├── config.js
├── logger.js
└── regional-matching.js

📁 icons/ 폴더 (있다면)
└── 모든 아이콘 파일들
```

#### B. Commit 설정
- Commit message: `Initial beautycat deployment`
- "Commit changes" 클릭

### 🌐 3단계: GitHub Pages 활성화 (3분)

1. Repository → **Settings** 탭
2. 왼쪽 메뉴 → **Pages**
3. Source: "Deploy from a branch"
4. Branch: **main** 선택
5. Folder: **/ (root)** 선택
6. **Save** 클릭
7. Custom domain에 `beautycat.kr` 입력
8. **Enforce HTTPS** 체크 ✅
9. **Save** 클릭

### 🔗 4단계: 예스닉 DNS 변경 (5분)

#### A. 예스닉 관리페이지 접속
1. https://www.yesnic.com 로그인
2. 도메인 관리 → beautycat.kr

#### B. 기존 포워딩 삭제
- 포워딩 설정 제거

#### C. DNS 레코드 추가
**A 레코드 4개 추가:**
```
이름: @ (또는 공백)
유형: A
값: 185.199.108.153

이름: @ (또는 공백)  
유형: A
값: 185.199.109.153

이름: @ (또는 공백)
유형: A  
값: 185.199.110.153

이름: @ (또는 공백)
유형: A
값: 185.199.111.153
```

**CNAME 레코드 1개 추가:**
```
이름: www
유형: CNAME
값: yourusername.github.io
```

### ⏰ 5단계: 대기 및 확인 (5-60분)

#### A. GitHub Pages 빌드 확인 (5분)
- Repository → Actions 탭에서 배포 상태 확인
- 녹색 체크마크가 뜨면 성공!

#### B. DNS 전파 대기 (5-60분)
- 전 세계 DNS 서버에 변경사항 반영 시간
- 빠르면 5분, 늦어도 1시간

#### C. 접속 테스트
1. https://yourusername.github.io/beautycat (즉시 가능)
2. https://beautycat.kr (DNS 전파 후)

### 🎉 완료 확인사항
- [ ] GitHub Repository 생성됨
- [ ] 모든 파일 업로드됨  
- [ ] GitHub Pages 활성화됨
- [ ] 예스닉 DNS 변경됨
- [ ] https://beautycat.kr 접속 가능
- [ ] SSL 인증서 적용됨 (🔒 표시)

### 🆘 문제 발생시 체크포인트
1. **GitHub Pages 빌드 실패**: Actions 탭에서 오류 확인
2. **도메인 접속 안됨**: DNS 전파 시간 더 대기
3. **SSL 오류**: Enforce HTTPS 다시 체크
4. **페이지 깨짐**: 파일 경로 오류 확인

### 📞 다음 단계 미리보기
배포 완료 후:
- **3단계**: 환경 설정을 프로덕션으로 변경
- **4단계**: 실제 데이터베이스 준비  
- **5단계**: 결제 시스템 연동

지금 바로 시작해봅시다! 🚀