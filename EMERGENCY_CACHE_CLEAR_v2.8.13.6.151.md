# 🚨 긴급 캐시 클리어 가이드 v2.8.13.6.151

**작성일**: 2026-01-06 02:00  
**버전**: v2.8.13.6.151-20260106-0200  
**목적**: beautycat.pages.dev 오래된 캐시 완전 제거

---

## 🔍 **문제 상황**

### **beautycat.kr (운영 사이트)**
- ✅ 핑크색 "Beautyket" 로고
- ✅ 최신 버전 v2.8.13.6.151
- ✅ 일괄 삭제 기능 정상 작동

### **beautycat.pages.dev (개발)**
- ❌ 오렌지색 왕관 + "beautycat" 로고 (구버전!)
- ❌ 오래된 캐시 로드
- ❌ 일괄 삭제 기능 없음

### **근본 원인**
```
beautycat.pages.dev → 브라우저 캐시 + Cloudflare CDN 캐시
→ 오래된 beautycat-logo.png (67KB) 로드
→ 최신 beautyket-logo-full.png (647KB) 무시
```

---

## 🚀 **해결 방법**

### **Step 1: Git Push (즉시)**

```cmd
cd /d D:\beautycat

git add admin-dashboard.html
git add js/bulk-delete.js
git add js/admin-dashboard.js
git add README.md
git add BULK_DELETE_GUIDE.md
git add PUSH_GUIDE_v2.8.13.6.151.md
git add EMERGENCY_CACHE_CLEAR_v2.8.13.6.151.md

git commit -m "feat: v2.8.13.6.151 - 일괄 삭제 + 캐시 강제 클리어

✅ 관리자 일괄 삭제 기능 추가
✅ 캐시 버스팅 강화 (2026-01-06 02:00)
✅ 버전: v2.8.13.6.151-20260106-0200
✅ 긴급 캐시 클리어 가이드 추가

🔥 beautycat.pages.dev 오래된 캐시 완전 제거"

git push origin main
```

---

### **Step 2: Cloudflare 배포 확인 (2-3분)**

1. **Cloudflare Dashboard 접속**
   ```
   https://dash.cloudflare.com
   ```

2. **Workers & Pages → beautycat-v2**

3. **Deployments 탭**
   - 최신 배포 상태 확인
   - "Success" 대기

4. **Custom domains 탭**
   - beautycat.kr ✅
   - beautyket.com ✅
   - beautycat.pages.dev ✅

---

### **Step 3: 강제 캐시 클리어**

#### **방법 1: Cloudflare Purge Cache (가장 효과적)**

1. **Cloudflare Dashboard**
2. **Caching → Configuration**
3. **Purge Cache → Purge Everything**
4. **Purge** 버튼 클릭

#### **방법 2: 브라우저 강제 새로고침**

**Windows:**
```
Ctrl + Shift + R
Ctrl + F5
```

**Mac:**
```
Cmd + Shift + R
```

#### **방법 3: 시크릿 모드**

**Windows:**
```
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)
```

**Mac:**
```
Cmd + Shift + N (Chrome)
Cmd + Shift + P (Firefox)
```

#### **방법 4: 브라우저 캐시 완전 삭제**

**Chrome:**
1. **Ctrl + Shift + Delete** (또는 Cmd + Shift + Delete)
2. **시간 범위**: "전체 기간"
3. **체크**: ✅ 캐시된 이미지 및 파일
4. **데이터 삭제** 클릭

**Firefox:**
1. **Ctrl + Shift + Delete** (또는 Cmd + Shift + Delete)
2. **지울 항목**: ✅ 캐시
3. **지금 지우기** 클릭

---

### **Step 4: 버전 확인**

**beautycat.kr 접속:**
```javascript
// F12 → Console
document.querySelector('meta[name="version"]').content
// 기대값: "2.8.13.6.151-20260106-0200"
```

**beautycat.pages.dev 접속:**
```javascript
// F12 → Console
document.querySelector('meta[name="version"]').content
// 기대값: "2.8.13.6.151-20260106-0200"
```

**로고 확인:**
```javascript
// F12 → Console
document.querySelector('img[alt="Beautyket"]').src
// 기대값: "images/beautyket-logo-full.png?v=2025122404"
```

---

## 📊 **체크리스트**

### **배포 전**
- [ ] Git add 7개 파일
- [ ] Git commit
- [ ] Git push origin main

### **배포 중**
- [ ] Cloudflare 배포 Success 확인 (2-3분)
- [ ] Deployments 최신 배포 확인

### **배포 후**
- [ ] Cloudflare Purge Cache
- [ ] beautycat.kr 강제 새로고침 (Ctrl+Shift+R)
- [ ] beautycat.pages.dev 강제 새로고침
- [ ] 시크릿 모드로 재확인
- [ ] 버전 확인 (F12 Console)
- [ ] 로고 확인 (핑크 Beautyket 로고)
- [ ] 일괄 삭제 버튼 확인

---

## 🎯 **예상 결과**

### **beautycat.kr**
- ✅ 핑크 Beautyket 로고
- ✅ v2.8.13.6.151-20260106-0200
- ✅ 일괄 삭제 버튼

### **beautycat.pages.dev**
- ✅ 핑크 Beautyket 로고 (캐시 클리어 후)
- ✅ v2.8.13.6.151-20260106-0200
- ✅ 일괄 삭제 버튼

---

## ⚠️ **만약 여전히 구버전이 보인다면?**

### **최종 해결책: 완전 삭제 후 재접속**

1. **브라우저 캐시 완전 삭제** (위 방법 4)
2. **브라우저 완전 종료**
3. **5분 대기** (Cloudflare CDN 캐시 만료)
4. **다른 브라우저로 접속** (Edge, Firefox 등)
5. **다른 기기로 접속** (모바일)

---

## 📝 **기술 정보**

### **캐시 계층**
```
사용자 브라우저 캐시
    ↓
Cloudflare CDN 캐시
    ↓
Cloudflare Pages 원본
    ↓
GitHub main 브랜치
```

### **캐시 무효화 순서**
1. **GitHub Push** → Cloudflare Pages 원본 업데이트
2. **Cloudflare Purge Cache** → CDN 캐시 클리어
3. **브라우저 강제 새로고침** → 브라우저 캐시 클리어

---

## ✅ **성공 확인**

모든 도메인에서 다음이 동일하게 표시되어야 합니다:

- ✅ **로고**: 핑크 "Beautyket"
- ✅ **버전**: v2.8.13.6.151-20260106-0200
- ✅ **샵 관리**: "일괄 삭제" 버튼 존재
- ✅ **디자인**: 화이트 깔끔한 헤더

---

**Push 완료 후 결과를 알려주세요!** 🚀
