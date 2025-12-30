# 🔧 HOTFIX: auth.js 프로덕션 환경 체크 수정 v2.8.13.6.88

**배포 일시**: 2025-12-29  
**배포 버전**: v2.8.13.6.88  
**주요 변경**: `skincare_shops` 500 에러 제거

---

## 🐛 **문제점**

### **증상**
```javascript
POST https://beautyket.com/tables/skincare_shops 500 (Internal Server Error)
⚠️ skincare_shops 요청 실패: 500
🚨 API 오류 감지: tables/skincare_shops HTTP 500
```

### **원인**
`js/auth.js`의 `loadDemoShops()` 함수가 **beautyket.com 도메인을 프로덕션으로 인식하지 못함**

```javascript
// 기존 코드 (문제)
const isProduction = location.hostname === 'beautycat.kr' ||
                   location.hostname === 'www.beautycat.kr' ||
                   location.hostname.includes('beautycat.pages.dev');
```

- `beautyket.com`이 포함되지 않음
- 데모 샵 생성 로직이 프로덕션 환경에서 실행됨
- 500 에러 발생

---

## ✅ **해결 방법**

### **수정된 코드**
```javascript
// js/auth.js (line 1404-1410)
const isProduction = location.hostname === 'beautycat.kr' ||
                   location.hostname === 'www.beautycat.kr' ||
                   location.hostname === 'beautyket.com' ||        // 추가 ✅
                   location.hostname === 'www.beautyket.com' ||    // 추가 ✅
                   location.hostname.includes('beautycat.pages.dev');
```

### **효과**
- ✅ `beautyket.com` 접속 시 데모 샵 로드 건너뜀
- ✅ 500 에러 제거
- ✅ 콘솔 로그 깔끔해짐

---

## 📦 **배포 파일**

```
js/auth.js
HOTFIX_AUTH_JS_v2.8.13.6.88.md
```

---

## 💻 **Git 배포 명령어**

```bash
cd /d/beautycat && git add js/auth.js HOTFIX_AUTH_JS_v2.8.13.6.88.md && git commit -m "🔧 HOTFIX v2.8.13.6.88 - beautyket.com 프로덕션 체크 추가

🐛 버그 수정
- js/auth.js: loadDemoShops() 프로덕션 체크에 beautyket.com 추가
- beautyket.com 접속 시 데모 샵 로드 건너뜀
- skincare_shops 500 에러 제거

✅ 효과
- 콘솔 500 에러 제거
- 프로덕션 환경 감지 개선
- 불필요한 API 요청 제거" && git push origin main
```

---

## 🔍 **배포 후 확인**

1. **Cloudflare 배포 대기** (2-5분)
2. **beautyket.com 접속**
3. **F12 → Console 확인**
4. **예상 로그**:
   ```
   🏭 프로덕션 환경 감지: 데모 샵 로드 건너뛰기
   ```
5. **500 에러 없음** ✅

---

**배포 담당자**: AI Assistant  
**배포 승인자**: 사용자  
**배포 상태**: 준비 완료 ✅
