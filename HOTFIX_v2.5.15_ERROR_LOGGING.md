# 🔧 HOTFIX v2.5.15 - 전화 통계 에러 상세 로그 추가

**날짜**: 2025-11-28  
**버전**: v2.5.15  
**목적**: 500 에러의 정확한 원인 파악을 위한 로그 강화

---

## 📋 **수정 내용**

### 파일: `js/main.js` (Line 2579-2592)

#### Before
```javascript
fetch('tables/call_statistics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statData)
}).then(response => {
    if (!response.ok) {
        console.log('📊 [통계] 기록 실패:', response.status);
    } else {
        console.log('✅ [통계] 기록 성공');
    }
}).catch((error) => {
    console.log('📊 [통계] 네트워크 오류:', error.message);
});
```

#### After (v2.5.15) ✅
```javascript
fetch('tables/call_statistics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(statData)
}).then(async response => {
    if (!response.ok) {
        const errorText = await response.text();
        console.log('📊 [통계] 기록 실패:', response.status);
        console.log('📊 [통계] 에러 상세:', errorText);  // ✅ 추가됨
    } else {
        console.log('✅ [통계] 기록 성공');
    }
}).catch((error) => {
    console.log('📊 [통계] 네트워크 오류:', error.message);
});
```

### 파일: `index.html` (Line 2627)

#### Before
```html
<script src="js/main.js?v=2.5.14" defer></script>
```

#### After (v2.5.15) ✅
```html
<script src="js/main.js?v=2.5.15" defer></script>
```

---

## 🎯 **목적**

### 현재 상황
```
📊 [통계] 기록 실패: 500
⚠️ call_statistics 요청 실패: 500
🚨 API 오류 감지: tables/call_statistics HTTP 500
```

### 개선 후
```
📊 [통계] 기록 실패: 500
📊 [통계] 에러 상세: {
    "error": "Database operation failed",
    "message": "D1_ERROR: table call_statistics has no column named updated_at: SQLITE_ERROR"
}
```

---

## 📦 **배포 파일**

1. ✅ **`index.html`** (필수) - main.js 버전 v2.5.15로 업데이트
2. ✅ **`js/main.js`** (필수) - 에러 상세 로그 추가
3. 📄 `HOTFIX_v2.5.15_ERROR_LOGGING.md` (문서)

---

## 🚀 **배포 절차**

### 1. Publish 탭 이동
1. **Publish** 탭 클릭
2. 다음 파일 선택:
   - ✅ `index.html`
   - ✅ `js/main.js`
   - ✅ `HOTFIX_v2.5.15_ERROR_LOGGING.md` (선택)

### 2. 커밋 메시지
```
🔧 HOTFIX v2.5.15: 전화 통계 에러 상세 로그 추가
```

### 3. Publish 버튼 클릭

---

## ✅ **배포 후 테스트**

### 1. 강력 새로고침
- **Windows**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

### 2. main.js 버전 확인
```javascript
// F12 > Console
console.log('main.js 버전:', document.querySelector('script[src*="main.js"]')?.src);
// 기대값: https://beautycat.kr/js/main.js?v=2.5.15
```

### 3. 전화하기 테스트
1. **전화상담** 클릭
2. **서울특별시 → 강남구** 선택
3. **[전화하기]** 버튼 클릭

### 4. 콘솔 로그 확인
**기대 출력:**
```
📊 [통계] 전송 데이터: {
    action: 'phone_call',
    shop_name: '강남 프리미엄 스킨케어',
    phone_number: '02-1234-5678',
    call_time: '2025-11-28T...',
    user_agent: '...',
    user_id: '',
    session_id: ''
}
📊 [통계] 기록 실패: 500
📊 [통계] 에러 상세: {"error":"Database operation failed","message":"D1_ERROR: ..."}
```

---

## 📊 **기대 효과**

### Before
- ❌ 500 에러만 표시 (원인 불명)
- ❌ 디버깅 어려움

### After
- ✅ 서버 에러 메시지 상세 출력
- ✅ 정확한 원인 파악 가능
- ✅ 문제 해결 방향 명확

---

## 🔄 **영향 분석**

### 사용자 경험
- ✅ **변화 없음** (에러는 백그라운드 처리, 전화 기능 정상 동작)

### 개발자 경험
- ✅ **디버깅 용이** (서버 응답 전체 확인 가능)
- ✅ **문제 해결 빠름** (정확한 에러 메시지)

---

## 📝 **버전 히스토리**

| 버전 | 날짜 | 변경 내용 |
|---|---|---|
| v2.5.15 | 2025-11-28 | 전화 통계 에러 상세 로그 추가 |
| v2.5.14 | 2025-11-28 | 모바일 UX 개선 + 통계 수정 시도 |
| v2.5.13.3 | 2025-11-28 | 무한 루프 긴급 수정 |
| v2.5.13.2 | 2025-11-28 | 대표샵 완전 수정 |

---

**상태**: ✅ 수정 완료, 배포 준비 완료  
**우선순위**: 🟢 낮음 (디버깅 개선)
