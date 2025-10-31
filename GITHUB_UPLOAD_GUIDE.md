# 🚀 BeautyCat GitHub 업로드 가이드

> **프로덕션 준비 완료 버전**을 GitHub에 업로드하는 상세 가이드

---

## 📋 목차

1. [업로드 전 체크리스트](#-업로드-전-체크리스트)
2. [방법 1: GitHub Desktop 사용 (추천 ⭐⭐⭐)](#-방법-1-github-desktop-사용-추천-)
3. [방법 2: Git CLI 사용](#-방법-2-git-cli-사용)
4. [방법 3: GitHub 웹 인터페이스](#-방법-3-github-웹-인터페이스)
5. [업로드 후 확인사항](#-업로드-후-확인사항)
6. [다음 단계](#-다음-단계)

---

## ✅ 업로드 전 체크리스트

### 필수 파일 확인

- [x] `.gitignore` 생성 완료
- [x] `README.md` 업데이트 완료
- [x] 프로덕션 파일 27개 준비
- [x] 테스트/구버전 파일 제외 설정

### GitHub 계정 준비

- [ ] GitHub 계정 생성/로그인 (https://github.com)
- [ ] 새 저장소(Repository) 생성 준비

---

## 🎯 방법 1: GitHub Desktop 사용 (추천 ⭐⭐⭐)

> **가장 쉬운 방법!** 명령어 없이 GUI로 간편하게 업로드

### 1단계: GitHub Desktop 설치

```
다운로드: https://desktop.github.com/
```

1. 위 링크에서 **GitHub Desktop** 다운로드
2. 설치 후 실행
3. GitHub 계정으로 로그인

### 2단계: 저장소 생성

1. **File** → **New repository** 클릭
2. 저장소 정보 입력:
   - **Name**: `BeautyCat` (또는 원하는 이름)
   - **Description**: `피부관리실 견적 매칭 플랫폼`
   - **Local Path**: BeautyCat 프로젝트 폴더 선택
   - **Initialize with README**: ❌ 체크 해제 (이미 있음)
   - **Git Ignore**: None (이미 .gitignore 있음)
   - **License**: MIT (선택사항)

3. **Create Repository** 클릭

### 3단계: 파일 커밋

1. 왼쪽에 변경된 파일 목록 표시됨
2. `.gitignore`에서 제외된 파일만 표시 확인
3. 하단 커밋 메시지 입력:
   ```
   Initial commit - Production ready version
   ```
4. **Commit to main** 버튼 클릭

### 4단계: GitHub에 푸시

1. 상단 **Publish repository** 버튼 클릭
2. 설정 확인:
   - **Name**: BeautyCat
   - **Description**: 피부관리실 견적 매칭 플랫폼
   - **Keep this code private**: 공개/비공개 선택
     - ✅ 체크 해제 = 공개 저장소 (추천)
     - ✅ 체크 = 비공개 저장소

3. **Publish repository** 클릭

### ✅ 완료!

GitHub Desktop에서 **View on GitHub** 클릭하여 확인!

---

## 💻 방법 2: Git CLI 사용

> 터미널/명령 프롬프트에서 Git 명령어로 업로드

### 전제조건

```bash
# Git 설치 확인
git --version

# Git이 없다면 설치
# Windows: https://git-scm.com/download/win
# Mac: brew install git
# Linux: sudo apt install git
```

### 1단계: GitHub에서 저장소 생성

1. https://github.com 접속
2. 우측 상단 **+** → **New repository** 클릭
3. 저장소 정보 입력:
   - **Repository name**: `BeautyCat`
   - **Description**: `피부관리실 견적 매칭 플랫폼`
   - **Public/Private**: 선택
   - **Initialize this repository**: ❌ 모두 체크 해제

4. **Create repository** 클릭

### 2단계: 로컬 프로젝트 초기화

```bash
# BeautyCat 프로젝트 폴더로 이동
cd /path/to/BeautyCat

# Git 초기화
git init

# 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/BeautyCat.git
# YOUR_USERNAME을 본인 GitHub 사용자명으로 변경!
```

### 3단계: 파일 추가 및 커밋

```bash
# 모든 파일 스테이징 (.gitignore가 자동 제외)
git add .

# 제외된 파일 확인 (선택사항)
git status

# 커밋
git commit -m "Initial commit - Production ready version"
```

### 4단계: GitHub에 푸시

```bash
# 기본 브랜치를 main으로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

### 인증 방법

**HTTPS 사용 시**:
- GitHub 사용자명과 **Personal Access Token** 입력
- Token 생성: Settings → Developer settings → Personal access tokens

**SSH 사용 시**:
```bash
# SSH 키 생성 (처음 한 번만)
ssh-keygen -t ed25519 -C "your_email@example.com"

# SSH 키를 GitHub에 등록
# Settings → SSH and GPG keys → New SSH key

# SSH URL로 변경
git remote set-url origin git@github.com:YOUR_USERNAME/BeautyCat.git
```

### ✅ 완료!

브라우저에서 확인:
```
https://github.com/YOUR_USERNAME/BeautyCat
```

---

## 🌐 방법 3: GitHub 웹 인터페이스

> 브라우저에서 직접 파일 업로드 (소규모 프로젝트용)

### ⚠️ 주의사항

- **27개 파일 + 폴더**를 수동으로 업로드해야 함
- 시간이 오래 걸림 (비추천)
- 대신 **GitHub Desktop** 또는 **Git CLI** 사용 권장

### 방법

1. https://github.com → New repository
2. 저장소 생성 (Initialize 없이)
3. **Add file** → **Upload files**
4. 드래그 앤 드롭으로 파일 업로드
5. Commit 메시지 작성 후 **Commit changes**

---

## ✅ 업로드 후 확인사항

### 1. 파일 목록 확인

GitHub 저장소에서 다음 파일들이 보이는지 확인:

```
✅ index.html
✅ login-clean.html
✅ register.html
✅ shop-dashboard-v2.html
✅ customer-dashboard-v2.html
✅ admin-dashboard.html
✅ cloudflare-workers-v3-full-crud.js
✅ README.md
✅ .gitignore
✅ css/, js/, icons/ 폴더들
```

### 2. 제외 파일 확인

다음 파일들이 **없는지** 확인:

```
❌ login.html (구버전)
❌ *-test.html (테스트 파일)
❌ *-old.html (백업 파일)
❌ node_modules/ (의존성)
```

### 3. README 확인

- 저장소 메인 페이지에 README.md가 자동 표시됨
- 프로젝트 설명이 잘 보이는지 확인

### 4. .gitignore 동작 확인

```bash
# 로컬에서 확인 (Git CLI 사용 시)
git status

# "nothing to commit, working tree clean" 메시지 확인
```

---

## 🎉 다음 단계

### 1. 저장소 설정

**Settings** 탭에서:

- ✅ **About** 섹션에 설명 추가
- ✅ **Topics** 태그 추가: `beauty`, `skincare`, `matching-platform`, `pwa`
- ✅ **Website** 링크 추가 (배포 후)

### 2. GitHub Pages 배포 (선택사항)

**Settings** → **Pages**:

1. **Source**: Deploy from a branch
2. **Branch**: main → / (root)
3. **Save**

5분 후 다음 URL에서 접속 가능:
```
https://YOUR_USERNAME.github.io/BeautyCat/
```

⚠️ 하지만 **Cloudflare Pages 배포를 더 추천**합니다! (README 참고)

### 3. Cloudflare Pages 배포 (추천 ⭐⭐⭐)

1. https://dash.cloudflare.com → Pages
2. **Create a project**
3. **Connect to Git** → GitHub 연결
4. BeautyCat 저장소 선택
5. 빌드 설정:
   - **Build command**: (비워두기)
   - **Build output directory**: `/`
6. **Save and Deploy**

### 4. 협업 설정

**Settings** → **Collaborators**:
- 팀원 초대
- 권한 설정

### 5. 브랜치 보호 (선택사항)

**Settings** → **Branches** → **Add rule**:
- **Branch name pattern**: `main`
- ✅ **Require pull request reviews**
- ✅ **Require status checks**

---

## 🔧 트러블슈팅

### 문제 1: "fatal: not a git repository"

```bash
# 해결: Git 초기화
git init
```

### 문제 2: "Permission denied (publickey)"

```bash
# 해결: SSH 키 재설정 또는 HTTPS 사용
git remote set-url origin https://github.com/YOUR_USERNAME/BeautyCat.git
```

### 문제 3: 너무 많은 파일이 업로드됨

```bash
# 해결: .gitignore 확인 후 캐시 삭제
git rm -r --cached .
git add .
git commit -m "Fix gitignore"
git push
```

### 문제 4: 인증 실패

```bash
# 해결: Personal Access Token 사용
# GitHub → Settings → Developer settings → Personal access tokens
# Token 생성 후 비밀번호 대신 사용
```

---

## 📚 유용한 Git 명령어

```bash
# 현재 상태 확인
git status

# 변경사항 확인
git diff

# 커밋 히스토리
git log --oneline

# 원격 저장소 확인
git remote -v

# 최신 변경사항 가져오기
git pull origin main

# 브랜치 생성 및 전환
git checkout -b feature/new-feature

# 파일 삭제 (Git에서)
git rm file.html
git commit -m "Remove file"
git push
```

---

## 🎓 추가 학습 자료

### Git 기초
- **Git 공식 문서**: https://git-scm.com/doc
- **GitHub Guides**: https://guides.github.com/

### GitHub Actions (CI/CD)
- 자동 배포 설정
- 테스트 자동화

### Git 브랜치 전략
- **Git Flow**: feature, develop, main 브랜치
- **GitHub Flow**: main + feature 브랜치

---

## 💡 베스트 프랙티스

### 커밋 메시지 작성법

```bash
# 좋은 예
git commit -m "Add customer dashboard search feature"
git commit -m "Fix quote calculation bug"
git commit -m "Update API documentation"

# 나쁜 예
git commit -m "update"
git commit -m "fix bug"
git commit -m "asdf"
```

### 커밋 단위

- ✅ 논리적으로 관련된 변경사항끼리 묶기
- ✅ 한 번에 하나의 기능/버그 수정
- ❌ 너무 큰 커밋 피하기

### .gitignore 관리

```bash
# 새 파일 유형 제외 시
echo "*.log" >> .gitignore
git add .gitignore
git commit -m "Update gitignore: exclude log files"
```

---

## 🎊 축하합니다!

**BeautyCat 프로젝트**가 성공적으로 GitHub에 업로드되었습니다! 🎉

### 다음 할 일

1. ✅ GitHub 저장소 확인
2. ⏳ Cloudflare Pages 배포
3. ⏳ 팀원 초대 및 협업 시작
4. ⏳ Issue 및 Project 관리 시작
5. ⏳ 실제 운영 환경 구축 (D1 데이터베이스)

---

**Made with ❤️ by BeautyCat Team**

*Last Updated: 2025-10-30*

---

## 🆘 도움이 필요하신가요?

- 📧 **이메일**: support@beautycat.kr (예시)
- 💬 **GitHub Issues**: 저장소의 Issues 탭에서 질문
- 📖 **README.md**: 프로젝트 전체 가이드

**궁금한 사항이 있으시면 언제든 문의하세요!** 😊
