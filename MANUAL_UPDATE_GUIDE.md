# 🔧 수동 업데이트 가이드

## 📅 작성일: 2024.11.01 17:20

---

## 🎯 목적

Genspark에서 수정한 파일들을 로컬(D 드라이브) beautycat-v2 폴더에 적용하여 GitHub Desktop으로 Push합니다.

---

## 📋 수정/추가할 파일 목록

### 새로 생성할 파일 (2개):

1. **`sw-unregister.js`** (프로젝트 루트)
2. **`api-global-override.js`** (프로젝트 루트)

### 수정할 파일 (3개):

3. **`index.html`** (프로젝트 루트)
4. **`login.html`** (프로젝트 루트)
5. **`customer-dashboard.html`** (프로젝트 루트)
6. **`shop-dashboard.html`** (프로젝트 루트)

### 삭제할 파일 (1개):

7. **`deploy-ready-config.js`** (프로젝트 루트)

---

## 🚀 단계별 가이드

### 1단계: 로컬 폴더 열기

```
D:\beautycat-v2  (또는 실제 프로젝트 경로)
```

---

### 2단계: 새 파일 생성

#### 2-1. `sw-unregister.js` 생성

1. 프로젝트 루트에 **새 파일 생성**: `sw-unregister.js`
2. 메모장 또는 VS Code로 열기
3. **파일 내용**: 아래 "파일 내용" 섹션 참조
4. 저장

#### 2-2. `api-global-override.js` 생성

1. 프로젝트 루트에 **새 파일 생성**: `api-global-override.js`
2. 메모장 또는 VS Code로 열기
3. **파일 내용**: 아래 "파일 내용" 섹션 참조
4. 저장

---

### 3단계: 기존 파일 수정

#### 3-1. `index.html` 수정

**위치**: 프로젝트 루트

**수정 내용**: 53-54줄에 추가

**찾을 내용** (52-54줄 부근):
```html
    <link rel="icon" type="image/png" sizes="512x512" href="icons/icon-512x512.png">
    
    <!-- 🚨 Cloudflare API Helper (최우선 로드) -->
```

**변경 후**:
```html
    <link rel="icon" type="image/png" sizes="512x512" href="icons/icon-512x512.png">
    
    <!-- 🚨 CRITICAL FIX: 최우선 실행 (Service Worker 제거 + API 오버라이드) -->
    <script src="sw-unregister.js"></script>
    <script src="api-global-override.js"></script>
    
    <!-- 🚨 Cloudflare API Helper (최우선 로드) -->
```

---

#### 3-2. `login.html` 수정

**위치**: 프로젝트 루트

**수정 내용**: Console 필터링 스크립트 제거 (21-58줄)

**찾을 내용** (18-60줄 부근):
```html
    <!-- 개발 환경 오류 방지 -->
    <script src="js/dev-environment-handler.js"></script>
    
    <!-- 콘솔 오류 필터링 (개발 환경용) -->
    <script>
        (function() {
            // 원본 콘솔 메서드 백업
            ...
            (약 40줄의 스크립트)
            ...
        })();
    </script>
    
    <!-- Tailwind CSS (Local Production) -->
```

**변경 후**:
```html
    <!-- 개발 환경 오류 방지 -->
    <script src="js/dev-environment-handler.js"></script>
    
    <!-- Tailwind CSS (Local Production) -->
```

**즉, Console 필터링 스크립트 전체 삭제!**

---

#### 3-3. `customer-dashboard.html` 수정

**위치**: 프로젝트 루트

**수정 내용**: Console 필터링 스크립트 제거 (12-45줄)

**찾을 내용** (10-47줄 부근):
```html
    <script src="api-global-override.js"></script>
    
    <!-- 콘솔 오류 필터링 -->
    <script>
        (function() {
            ...
            (약 35줄의 스크립트)
            ...
        })();
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
```

**변경 후**:
```html
    <script src="api-global-override.js"></script>
    
    <script src="https://cdn.tailwindcss.com"></script>
```

---

#### 3-4. `shop-dashboard.html` 수정

**위치**: 프로젝트 루트

**수정 내용**: `customer-dashboard.html`과 동일 (Console 필터링 제거)

**찾을 내용** (10-47줄 부근):
```html
    <script src="api-global-override.js"></script>
    
    <!-- 콘솔 오류 필터링 -->
    <script>
        (function() {
            ...
        })();
    </script>
    
    <script src="https://cdn.tailwindcss.com"></script>
```

**변경 후**:
```html
    <script src="api-global-override.js"></script>
    
    <script src="https://cdn.tailwindcss.com"></script>
```

---

### 4단계: 파일 삭제

#### 4-1. `deploy-ready-config.js` 삭제

**위치**: 프로젝트 루트

**삭제**: 이 파일을 완전히 삭제하세요!

---

### 5단계: GitHub Desktop으로 Push

1. **GitHub Desktop 실행**
2. **beautycat-v2 저장소 선택**
3. **변경사항 확인** (좌측 패널):
   ```
   + sw-unregister.js (새 파일)
   + api-global-override.js (새 파일)
   M index.html (수정됨)
   M login.html (수정됨)
   M customer-dashboard.html (수정됨)
   M shop-dashboard.html (수정됨)
   - deploy-ready-config.js (삭제됨)
   ```

4. **Commit 메시지 입력**:
   ```
   Fix: Service Worker 제거 및 API 오버라이드 추가
   
   - sw-unregister.js: Service Worker 완전 제거
   - api-global-override.js: 모든 fetch() 자동 변환
   - index.html: 스크립트 추가
   - login.html: Console 필터링 제거
   - customer-dashboard.html: Console 필터링 제거
   - shop-dashboard.html: Console 필터링 제거
   - deploy-ready-config.js: 삭제 (불필요)
   ```

5. **"Commit to main" 버튼 클릭**
6. **"Push origin" 버튼 클릭**

---

### 6단계: Cloudflare Pages 자동 배포 대기

**GitHub에 Push하면 Cloudflare Pages가 자동으로 배포합니다!**

1. **Cloudflare Pages 대시보드** 열기
2. **beautycat-v2 프로젝트** 선택
3. **Deployments 탭** 확인
4. **새 배포 진행 상황** 확인 (2-3분)
5. **"Success" 표시 대기**

---

### 7단계: 브라우저 테스트

배포 완료 후:

1. **Ctrl + Shift + Del** (캐시 삭제)
2. **브라우저 완전 종료**
3. **브라우저 재시작**
4. **https://beautycat-v2.pages.dev 접속**
5. **F12 → Console 확인**

**성공 시 보여야 할 메시지**:
```javascript
✅ 🔧 Service Worker 제거 시작...
✅ ℹ️ 등록된 Service Worker가 없습니다
✅ ✅ 글로벌 Fetch 오버라이드 설치 완료
```

---

## 📝 파일 내용

파일 내용이 너무 길어서, 각 파일을 개별적으로 제공해드리겠습니다.

다음 메시지에서 각 파일의 전체 내용을 복사-붙여넣기 할 수 있게 제공하겠습니다!

---

**준비되셨나요?** 😊
