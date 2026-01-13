# 🔄 복원 가이드 - v2.8.8.1.30

## 📋 개요
v2.8.8.1.30 (Beautyket 리브랜딩) 배포 후 문제가 발생할 경우 이전 버전으로 복원하는 방법을 안내합니다.

---

## 🎯 복원 시나리오

### 시나리오 1: 단순 롤백 (브랜드명만 복원)
**상황**: Beautyket → BeautyCat으로 되돌리고 싶은 경우

### 시나리오 2: 디자인 복원
**상황**: 디자인 선명도 변경을 되돌리고 싶은 경우

### 시나리오 3: 전체 복원
**상황**: v2.8.8.1.29로 완전히 되돌리고 싶은 경우

---

## 🔧 복원 방법

### 방법 1: Git Revert (권장 - 안전)

**장점**: 히스토리 유지, 협업에 안전, 추적 가능  
**단점**: 추가 커밋 생성

```bash
# 1. 최신 커밋 되돌리기
git revert HEAD

# 2. 자동으로 생성된 커밋 메시지 확인/수정
# "Revert: v2.8.8.1.30 Beautyket 리브랜딩..."

# 3. Push
git push origin main
```

### 방법 2: Git Reset (주의 - 위험)

**장점**: 깔끔한 히스토리  
**단점**: 협업 시 문제 발생, 되돌릴 수 없음

```bash
# ⚠️ 주의: 이 방법은 히스토리를 완전히 삭제합니다!

# 1. 이전 커밋으로 되돌리기
git reset --hard HEAD~1

# 2. 강제 Push (주의!)
git push -f origin main
```

### 방법 3: 특정 파일만 복원

**장점**: 필요한 파일만 선택적 복원  
**단점**: 수동 작업 필요

```bash
# 1. 이전 버전의 특정 파일 복원
git checkout HEAD~1 -- index.html
git checkout HEAD~1 -- css/premium-design.css

# 2. 이미지 파일 복원
git checkout HEAD~1 -- images/beautycat-logo-v3.png
git checkout HEAD~1 -- images/beautycat-logo.png

# 3. 변경사항 커밋
git add -A
git commit -m "🔄 Restore: 특정 파일 복원"

# 4. Push
git push origin main
```

---

## 📝 단계별 복원 가이드

### 1단계: 현재 상태 백업 (필수)

```bash
# 현재 브랜치 백업
git branch backup-v2.8.8.1.30

# 또는 태그 생성
git tag backup-v2.8.8.1.30
git push origin backup-v2.8.8.1.30
```

### 2단계: 복원 방법 선택

#### Option A: Git Revert (권장)
```bash
git revert HEAD
git push origin main
```

#### Option B: 수동 복원
1. 이전 버전 파일 다운로드
2. 수동으로 텍스트 변경 (Beautyket → BeautyCat)
3. 커밋 & Push

### 3단계: 검증

```bash
# 로컬에서 확인
open index.html  # Mac
start index.html # Windows

# Git 상태 확인
git status
git log --oneline -5
```

### 4단계: 배포 확인

- [ ] 메인 페이지에서 "BeautyCat" 로고 확인
- [ ] CSS 스타일 정상 작동 확인
- [ ] 모바일에서도 정상 표시 확인

---

## 🎯 시나리오별 상세 복원

### 시나리오 1: 브랜드명만 복원 (Beautyket → BeautyCat)

```bash
# 1. index.html 복원
git checkout HEAD~1 -- index.html

# 2. preview-premium-design.html 복원
git checkout HEAD~1 -- preview-premium-design.html

# 3. CSS 파일 복원
git checkout HEAD~1 -- css/premium-design.css

# 4. 워크플로우 복원
git checkout HEAD~1 -- .github/workflows/update-rss.yml

# 5. 이미지 파일 복원
git checkout HEAD~1 -- images/beautycat-logo-v3.png
git checkout HEAD~1 -- images/beautycat-logo.png
git checkout HEAD~1 -- images/beautycat-logo-v2.png
git checkout HEAD~1 -- images/beautycat-logo-new.png
git checkout HEAD~1 -- images/beautycat-cat-emoji.png

# 6. 새 이미지 삭제
git rm images/beautyket-logo-v3.png
git rm images/beautyket-logo.png
git rm images/beautyket-logo-v2.png
git rm images/beautyket-logo-new.png
git rm images/beautyket-cat-emoji.png

# 7. 커밋
git add -A
git commit -m "🔄 Restore: BeautyCat 브랜드명 복원"

# 8. Push
git push origin main
```

### 시나리오 2: 디자인만 복원 (선명도 변경 취소)

```bash
# 1. CSS 파일만 복원
git checkout HEAD~1 -- css/premium-design.css

# 2. 커밋
git add css/premium-design.css
git commit -m "🔄 Restore: 디자인 선명도 이전 상태로 복원"

# 3. Push
git push origin main
```

### 시나리오 3: 전체 복원 (v2.8.8.1.29로)

```bash
# 방법 A: Revert (권장)
git revert HEAD
git push origin main

# 방법 B: Reset (주의)
git reset --hard HEAD~1
git push -f origin main

# 방법 C: 태그로 복원
git checkout v2.8.8.1.29
git checkout -b restore-v2.8.8.1.29
git push origin restore-v2.8.8.1.29
```

---

## 🚨 긴급 복원 (1분 이내)

문제가 심각한 경우 가장 빠른 복원 방법:

```bash
# 1. 강제 되돌리기
git reset --hard HEAD~1

# 2. 강제 Push
git push -f origin main
```

⚠️ **주의**: 이 방법은 히스토리를 삭제하므로 협업 중이라면 팀원에게 알려야 합니다!

---

## 📊 복원 후 확인사항

### 필수 체크리스트
- [ ] 브랜드명이 올바른지 확인 (BeautyCat 또는 Beautyket)
- [ ] 로고 이미지가 정상 표시되는지 확인
- [ ] CSS 스타일이 의도대로 표시되는지 확인
- [ ] 모바일 반응형이 정상 작동하는지 확인
- [ ] RSS 피드가 정상 작동하는지 확인

### Git 상태 확인
```bash
# 현재 브랜치 확인
git branch

# 최근 커밋 히스토리 확인
git log --oneline -10

# 변경된 파일 확인
git diff HEAD~1 HEAD
```

---

## 🔗 참고 문서

- [CHANGELOG_v2.8.8.1.30.md](./CHANGELOG_v2.8.8.1.30.md) - 변경 내역
- [PUSH_FILES_v2.8.8.1.30.md](./PUSH_FILES_v2.8.8.1.30.md) - Push 파일 목록
- [README.md](./README.md) - 프로젝트 개요

---

## 💡 복원 팁

### Tip 1: 백업 습관화
```bash
# 배포 전 항상 태그 생성
git tag v2.8.8.1.30-before-deploy
git push origin --tags
```

### Tip 2: 브랜치 전략
```bash
# 메인 브랜치는 안정 버전만 유지
git checkout -b feature/beautyket-rebrand
# 작업 후 테스트 완료하면 merge
git checkout main
git merge feature/beautyket-rebrand
```

### Tip 3: 단계적 배포
1. 미리보기 파일만 먼저 배포
2. 문제없으면 메인 파일 배포
3. 문제 발생 시 미리보기만 롤백

---

## ❓ 자주 묻는 질문

### Q1: 복원 후 이미지가 안 보여요
**A**: 브라우저 캐시 문제일 수 있습니다.
```bash
# 캐시 클리어 후 Hard Refresh
# Chrome: Ctrl + Shift + R
# Firefox: Ctrl + F5
```

### Q2: Git Push가 거부되어요
**A**: Remote 버전이 더 최신일 수 있습니다.
```bash
# Pull 후 다시 Push
git pull origin main
git push origin main
```

### Q3: 팀원과 충돌이 발생했어요
**A**: 강제 Push는 피하고 협의 후 진행하세요.
```bash
# 협의 후 동기화
git fetch origin
git merge origin/main
```

---

**작성일**: 2026-01-13  
**작성자**: AI Assistant  
**버전**: v2.8.8.1.30  
**태그**: `복원 가이드`, `롤백`, `Git`, `트러블슈팅`
