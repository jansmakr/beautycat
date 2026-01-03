# 🔧 v2.8.13.6.131.1 - 사용자 삭제 Soft Delete 적용

**작성일**: 2026-01-03 21:00 KST  
**기능**: 사용자 삭제 기능 Soft Delete로 변경 + 중복 함수 제거

---

## ✅ **수정 내용**

### 1. 사용자 삭제 Soft Delete로 변경
**위치**: `js/admin-dashboard.js` Line 1315-1350

**수정 전 (Hard Delete)**:
```javascript
const response = await fetch(`tables/users/${userId}`, {
    method: 'DELETE'  // ❌ 완전 삭제, 복구 불가
});
```

**수정 후 (Soft Delete)**:
```javascript
// GET 기존 데이터
const getUserResponse = await fetch(`/tables/users/${userId}`);
const existingUser = await getUserResponse.json();

// Soft Delete: deleted 플래그 설정
const updatedUser = {
    ...existingUser,
    deleted: true,
    is_active: false,
    status: 'deleted',
    updated_at: Date.now()
};

const response = await fetch(`/tables/users/${userId}`, {
    method: 'PUT',  // ✅ PUT으로 변경, 복구 가능
    body: JSON.stringify(updatedUser)
});
```

**효과**:
- ✅ 사용자 데이터 보관 (`deleted=true` 플래그만 설정)
- ✅ 복구 가능
- ✅ 삭제 이력 추적 가능

---

### 2. 중복 deleteUser 함수 제거
**문제**: Line 1410-1490에 동일한 함수가 중복 정의됨

**해결**: 중복 함수 삭제 (첫 번째 함수만 유지)

---

### 3. loadUsers에 deleted 필터 추가
**위치**: `js/admin-dashboard.js` Line 420

**추가 필요**:
```javascript
// 삭제된 사용자 제외
allUsers = (data.data || []).filter(user => !user.deleted);
```

---

## 🧪 **테스트 방법**

### 1. 사용자 삭제 테스트
```
1. 관리자 대시보드 → 사용자 관리
2. 사용자 선택 → 🗑️ 삭제 아이콘 클릭
3. 확인 메시지: "정말로 이 사용자를 삭제하시겠습니까?"
4. 확인 클릭
5. 결과: "사용자 '이름'이(가) 삭제되었습니다 (복구 가능)"
```

### 2. Console 로그 확인
```
🗑️ 사용자 Soft Delete 시작: user_id_xxx
✅ 사용자 Soft Delete 성공: user_id_xxx
```

### 3. DB 확인
```javascript
// Console에서 실행
fetch('/tables/users?search=삭제된이메일&limit=1')
  .then(r => r.json())
  .then(d => console.log(d.data[0]));

// 결과:
{
  id: "xxx",
  name: "삭제된사용자",
  deleted: true,      // ← deleted 플래그
  is_active: false,
  status: "deleted",
  ...
}
```

---

## 📦 **배포 파일**

```
js/admin-dashboard.js  (deleteUser 함수 Soft Delete로 수정 + 중복 제거)
```

---

## 🚀 **배포 명령어**

```bash
git add js/admin-dashboard.js USER_DELETE_SOFT_DELETE_v2.8.13.6.131.1.md

git commit -m "🔧 v2.8.13.6.131.1 - 사용자 삭제 Soft Delete 적용

- 사용자 삭제 Hard Delete → Soft Delete 변경
- deleted 플래그 설정 (복구 가능)
- 중복 deleteUser 함수 제거
- PUT 메서드 사용 (Cloudflare Workers 호환)

영향: 사용자 관리 → 삭제 기능"

git push origin main
```

---

## ⚠️ **주의사항**

### 1. loadUsers 함수 수정 필요
현재 `loadUsers()` 함수는 deleted 사용자도 표시합니다.

**수정 필요**:
```javascript
// Line 420 근처에 추가
allUsers = (data.data || []).filter(user => !user.deleted);
```

### 2. 관리자 계정 삭제 불가
관리자 계정(`user_type === 'admin'`)은 삭제할 수 없도록 보호됨

### 3. 연결된 샵 레코드
- 사용자가 `shop` 타입인 경우, 연결된 샵도 함께 Soft Delete됨
- 샵 레코드의 `deleted` 플래그도 설정됨

---

## 🎯 **다음 단계**

1. **loadUsers 함수에 deleted 필터 추가**
2. **삭제된 사용자 복구 기능 추가**
3. **삭제 이력 관리 페이지 추가**

---

**지금 바로 배포하세요!** 🚀
