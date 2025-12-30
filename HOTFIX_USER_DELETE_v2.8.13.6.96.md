# 🔧 HOTFIX v2.8.13.6.96 - 사용자 삭제 기능 추가

## 📅 날짜
- **배포일**: 2025-01-30
- **버전**: v2.8.13.6.96
- **이전 버전**: v2.8.13.6.95

---

## 🎯 목표
- 관리자 대시보드에 사용자 삭제 기능 추가
- 이메일 중복 등 불필요한 사용자 제거 가능
- shop 타입 사용자 삭제 시 연결된 업체 레코드도 함께 삭제

---

## 🐛 해결된 문제

### 1️⃣ 사용자 삭제 기능 누락
**문제:**
- 관리자 대시보드에서 사용자를 삭제할 수 있는 방법이 없었음
- 이메일 중복, 테스트 계정 등 불필요한 사용자 정리 불가
- shop 타입 사용자 삭제 시 orphaned shop 레코드 남음

**해결:**
```javascript
// 1. 사용자 테이블에 삭제 버튼 추가
<button onclick="deleteUser('${user.id}')" 
        class="text-red-600 hover:text-red-900" 
        title="사용자 삭제">
    삭제
</button>

// 2. deleteUser 함수 강화
async function deleteUser(userId) {
    // Admin 계정 보호
    if (user.user_type === 'admin') {
        showNotification('관리자 계정은 삭제할 수 없습니다.', 'error');
        return;
    }
    
    // shop 타입인 경우 연결된 업체 레코드도 삭제
    if (user.user_type === 'shop') {
        // 이메일로 업체 찾기
        const userShop = shopsData.data.find(s => 
            s.email.toLowerCase() === user.email.toLowerCase()
        );
        
        if (userShop) {
            await fetch(`tables/skincare_shops/${userShop.id}`, {
                method: 'DELETE'
            });
        }
    }
    
    // 사용자 삭제
    await fetch(`tables/users/${userId}`, {
        method: 'DELETE'
    });
}
```

---

## 📝 변경 사항

### ✅ 수정된 파일

1. **js/admin-dashboard.js**
   - `displayUsers()` 함수: 삭제 버튼 추가
   - `deleteUser()` 함수: 강화 (admin 보호, shop 레코드 연쇄 삭제)
   - 상세한 확인 메시지 추가

2. **admin-dashboard.html**
   - 버전 업데이트: `v2.8.13.6.95` → `v2.8.13.6.96`

---

## 🎨 UI 변경사항

### 사용자 관리 테이블

**변경 전:**
```
[보기] [수정]
```

**변경 후:**
```
[보기] [수정] [삭제]
```

### 삭제 확인 메시지
```
정말로 이 사용자를 삭제하시겠습니까?

이름: 김정선
이메일: rlawjdtjs71@naver.com
타입: shop

⚠️ 이 작업은 되돌릴 수 없습니다.
```

---

## 🔒 보안 기능

### 1. Admin 계정 보호
```javascript
if (user.user_type === 'admin') {
    showNotification('관리자 계정은 삭제할 수 없습니다.', 'error');
    return;
}
```

### 2. 확인 절차
- 사용자 정보를 보여주는 상세한 확인 메시지
- 되돌릴 수 없음을 명시

### 3. 연쇄 삭제
- shop 타입 사용자 삭제 시 업체 레코드도 함께 삭제
- 데이터 정합성 유지

---

## 🧪 테스트 방법

### 1. 일반 사용자 삭제
```bash
1. 관리자 대시보드 접속
2. 사용자 관리 메뉴
3. 테스트 사용자 찾기
4. [삭제] 버튼 클릭
5. 확인 메시지 확인
6. [확인] 클릭
7. 성공 메시지: "사용자 "{이름}"이(가) 삭제되었습니다."
8. 사용자 목록에서 제거된 것 확인
```

### 2. Shop 사용자 삭제
```bash
1. shop 타입 사용자 선택
2. [삭제] 버튼 클릭
3. 확인 후 삭제
4. 콘솔 로그 확인:
   🗑️ 사용자 삭제 시작: cf_xxx
   🏪 연결된 업체 레코드 삭제: shop_xxx
   ✅ 업체 레코드 삭제 완료
   ✅ 사용자 삭제 완료: cf_xxx
5. 사용자 목록과 샵 입점 관리에서 모두 제거 확인
```

### 3. Admin 계정 보호 테스트
```bash
1. Admin 계정의 [삭제] 버튼 클릭
2. 오류 메시지: "관리자 계정은 삭제할 수 없습니다."
3. 삭제되지 않음을 확인
```

---

## 📊 콘솔 로그

### 성공적인 삭제
```
🗑️ 사용자 삭제 시작: cf_1767063285721_n7xyt128x
🏪 연결된 업체 레코드 삭제: cf_1767063285721_shop_xxx
✅ 업체 레코드 삭제 완료
✅ 사용자 삭제 완료: cf_1767063285721_n7xyt128x
✅ allUsers 배열: 25 명 (26에서 감소)
✅ 업체 수: 15 (16에서 감소)
```

### Admin 삭제 시도
```
❌ 관리자 계정은 삭제할 수 없습니다.
```

---

## 🚀 배포 절차

### 1. Git 푸시
```bash
cd /d/beautycat

git add admin-dashboard.html \
        js/admin-dashboard.js \
        HOTFIX_USER_DELETE_v2.8.13.6.96.md

git commit -m "🔧 HOTFIX v2.8.13.6.96 - 사용자 삭제 기능 추가

- 사용자 관리 테이블에 삭제 버튼 추가
- Admin 계정 삭제 보호 기능
- shop 타입 사용자 삭제 시 연결된 업체 레코드도 함께 삭제
- 상세한 확인 메시지 추가"

git push origin main
```

### 2. 배포 후 테스트
```bash
1. 브라우저 캐시 완전 삭제
   - Chrome: Ctrl+Shift+Delete
   - "전체 기간" 선택
   - 모든 항목 체크
   - [삭제] 클릭

2. 관리자 대시보드 접속
   - https://beautycat.kr/admin-dashboard.html
   - Ctrl+Shift+R (강제 새로고침)
   - F12 → Console 확인

3. 버전 확인
   - 콘솔에서 확인: admin-dashboard.js?v=2.8.13.6.96

4. 테스트 사용자 삭제
   - 사용자 관리 → 테스트 계정 선택
   - [삭제] 버튼 클릭
   - 확인 메시지 확인
   - 삭제 완료 확인
```

---

## 🔄 이전 버전과의 차이

### v2.8.13.6.95 → v2.8.13.6.96

| 항목 | v2.8.13.6.95 | v2.8.13.6.96 |
|------|--------------|--------------|
| 사용자 삭제 | ❌ 기본 기능만 | ✅ 강화된 기능 |
| Admin 보호 | ❌ 없음 | ✅ 있음 |
| Shop 레코드 연쇄 삭제 | ❌ 없음 | ✅ 있음 |
| 확인 메시지 | ⚠️ 간단 | ✅ 상세 |
| 삭제 버튼 UI | ❌ 없음 | ✅ 있음 |

---

## 📦 배포 파일
- ✅ `admin-dashboard.html` (버전 업데이트)
- ✅ `js/admin-dashboard.js` (삭제 기능 강화)
- ✅ `HOTFIX_USER_DELETE_v2.8.13.6.96.md` (이 문서)

---

## 🎯 다음 단계

### 즉시 처리 가능
1. **김정선 업체 생성**
   - 방법 1: 관리자 대시보드 → 샵 입점 관리 → 새 업체 추가
   - 방법 2: user_id 필드 제거 후 API 직접 호출

2. **중복 이메일 정리**
   - 사용자 관리에서 중복 계정 확인
   - 불필요한 계정 [삭제] 버튼으로 제거

3. **테스트 계정 정리**
   - test@, demo@ 계정 정리
   - 실제 사용자만 남기기

### 추후 개선 사항
1. 일괄 삭제 기능
2. 삭제된 사용자 복원 기능 (soft delete)
3. 삭제 이력 로그

---

## ⚠️ 주의사항

1. **되돌릴 수 없음**
   - DELETE는 영구 삭제
   - 신중하게 확인 후 삭제

2. **연쇄 효과**
   - shop 사용자 삭제 시 업체 레코드도 삭제됨
   - 상담 신청 등 관련 데이터는 남아있을 수 있음

3. **Admin 계정**
   - admin@beautycat.kr은 삭제 불가
   - 시스템 보호

---

## 📞 문제 발생 시

### 삭제 실패
```javascript
// 콘솔에서 수동 삭제
fetch('tables/users/{userId}', { method: 'DELETE' })
  .then(r => r.json())
  .then(d => console.log('삭제 완료:', d));
```

### 업체 레코드만 삭제
```javascript
// 업체 레코드만 삭제
fetch('tables/skincare_shops/{shopId}', { method: 'DELETE' })
  .then(r => r.json())
  .then(d => console.log('업체 삭제 완료:', d));
```

---

**배포 완료 후 결과를 알려주세요!** 🚀
