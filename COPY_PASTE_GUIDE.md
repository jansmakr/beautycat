# 🚀 BeautyCat 파일 수정 가이드 (복사-붙여넣기)

## 📋 개요
- **수정 파일**: 6개
- **방법**: 찾기-바꾸기 (간단!)
- **소요 시간**: 5분
- **도구**: 메모장 또는 아무 텍스트 에디터

---

## 🎯 작업 순서

### 1단계: 파일 열기
```
Windows 탐색기 → D:\beautycat
```

### 2단계: 각 파일 수정 (찾기-바꾸기)

---

## 📝 파일별 수정 내용

### ✅ 1. index.html

**열기**: D:\beautycat\index.html (메모장으로 열기)

**수정**:
```
Ctrl + H (찾기 및 바꾸기)

찾을 내용:
<link rel="stylesheet" href="css/mobile-optimized.css">

바꿀 내용:
<link rel="stylesheet" href="css/mobile-optimized.css?v=2.1.0">

→ "모두 바꾸기" 클릭
→ 저장 (Ctrl + S)
```

**추가 수정 (선택사항 - 캐시 방지 meta 태그)**:
```
찾을 내용:
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <title>beautycat

바꿀 내용:
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>beautycat

→ "바꾸기" 클릭 (1개만)
→ 저장 (Ctrl + S)
```

---

### ✅ 2. login.html

**열기**: D:\beautycat\login.html

**수정**:
```
Ctrl + H

찾을 내용:
<link rel="stylesheet" href="css/mobile-optimized.css">

바꿀 내용:
<link rel="stylesheet" href="css/mobile-optimized.css?v=2.1.0">

→ "모두 바꾸기"
→ 저장
```

---

### ✅ 3. register.html

**열기**: D:\beautycat\register.html

**수정**:
```
Ctrl + H

찾을 내용:
<link rel="stylesheet" href="css/mobile-optimized.css">

바꿀 내용:
<link rel="stylesheet" href="css/mobile-optimized.css?v=2.1.0">

→ "모두 바꾸기"
→ 저장
```

---

### ✅ 4. admin-dashboard.html

**열기**: D:\beautycat\admin-dashboard.html

**수정**:
```
Ctrl + H

찾을 내용:
<link rel="stylesheet" href="css/mobile-optimized.css">

바꿀 내용:
<link rel="stylesheet" href="css/mobile-optimized.css?v=2.1.0">

→ "모두 바꾸기"
→ 저장
```

---

### ✅ 5. shop-dashboard.html

**열기**: D:\beautycat\shop-dashboard.html

**수정**:
```
Ctrl + H

찾을 내용:
<link rel="stylesheet" href="css/mobile-optimized.css">

바꿀 내용:
<link rel="stylesheet" href="css/mobile-optimized.css?v=2.1.0">

→ "모두 바꾸기"
→ 저장
```

---

### ✅ 6. customer-dashboard.html

**열기**: D:\beautycat\customer-dashboard.html

**수정**:
```
Ctrl + H

찾을 내용:
<link rel="stylesheet" href="css/mobile-optimized.css">

바꿀 내용:
<link rel="stylesheet" href="css/mobile-optimized.css?v=2.1.0">

→ "모두 바꾸기"
→ 저장
```

---

## ✅ 완료 확인

### 1. GitHub Desktop 확인
```
1. GitHub Desktop 열기
2. 좌측 Changes 탭
3. 6개 파일이 보이나요?
   - index.html
   - login.html  
   - register.html
   - admin-dashboard.html
   - shop-dashboard.html
   - customer-dashboard.html
```

### 2. 변경 내용 확인
```
각 파일 클릭 → 우측에 초록색으로:
+<link rel="stylesheet" href="css/mobile-optimized.css?v=2.1.0">

빨간색으로:
-<link rel="stylesheet" href="css/mobile-optimized.css">
```

---

## 🚀 배포하기

### 1. Commit
```
GitHub Desktop 하단:
Summary: "CSS 캐시 버스팅 v2.1.0"
Description: (선택사항) "모바일 UI 개선사항 반영"

→ "Commit to main" 클릭
```

### 2. Push
```
상단 "Push origin" 버튼 클릭
→ 자동 배포 시작!
```

### 3. 확인 (2-3분 후)
```
https://beautycat.kr?v=new

또는

Ctrl + Shift + R (강제 새로고침)
```

---

## 🎉 완료!

배포 후 확인사항:
- ✅ 모바일 화면: 로고 크기, 하단 메뉴
- ✅ 고양이 아이콘: 더 크게 표시
- ✅ 섹션 배경색: 핑크/블루

---

## 🆘 문제 발생 시

### 파일을 찾을 수 없음
```
→ D:\beautycat 폴더 확인
→ 파일이 있는지 확인
```

### 찾기가 안됨 (0개 찾음)
```
→ 이미 수정되어 있을 수 있음
→ 파일 내용 확인:
   "mobile-optimized.css?v=" 있으면 이미 완료!
```

### GitHub Desktop에 안보임
```
→ Repository → Refresh Repository
→ 또는 GitHub Desktop 재시작
```

---

**작업 시작하시면 알려주세요!** 😊
