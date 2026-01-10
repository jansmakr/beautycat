# 🔧 동일 이메일 신규 샵 등록 개선 (v2.8.8.1.13)

**날짜**: 2026-01-10  
**우선순위**: MEDIUM  
**담당자**: AI Assistant

---

## 📋 문제 상황

### 사용자 보고
- 동일 이메일로 신규 샵 등록이 안 됨
- "⚠️ 주의: 이 이메일은 customer 타입으로 등록되어 있습니다" 경고 후 중단

### 원인 분석
**라인 1734-1738 (이전 코드)**:
```javascript
if (existingUser.user_type !== 'shop') {
    alert(`⚠️ 주의: "${email}"은 "${existingUser.user_type}" 타입으로 등록되어 있습니다.`);
    return;  // 여기서 함수 종료 → 샵 등록 불가
}
```

**문제점**:
1. 기존 사용자가 'customer' 또는 'admin' 타입일 경우 **경고만 표시하고 중단**
2. 관리자가 수동으로 사용자 관리에서 타입을 변경해야 함 (불편)
3. 샵 등록 흐름이 끊김

---

## 🔧 수정 내용

### `admin-dashboard.html` (라인 1733-1738)

#### 수정 전 ❌
```javascript
// 사용자 타입이 'shop'인지 확인
if (existingUser.user_type !== 'shop') {
    console.log('⚠️ 사용자 타입이 "shop"이 아님. 타입 업데이트 필요:', existingUser.user_type);
    alert(`⚠️ 주의: "${email}"은 "${existingUser.user_type}" 타입으로 등록되어 있습니다.\n\n먼저 사용자 관리에서 타입을 "업체"로 변경해주세요.`);
    return;  // 중단
}
```

#### 수정 후 ✅
```javascript
// v2.8.8.1.13: 사용자 타입이 'shop'이 아니면 자동 변경
if (existingUser.user_type !== 'shop') {
    console.log('⚠️ 사용자 타입이 "shop"이 아님. 자동 업데이트 시작:', existingUser.user_type, '→ shop');
    
    const confirmChange = confirm(
        `⚠️ 주의: "${email}"은 "${existingUser.user_type}" 타입으로 등록되어 있습니다.\n\n` +
        `업체로 전환하시겠습니까?\n\n` +
        `• 확인: 타입을 "업체"로 변경하고 샵 등록 진행\n` +
        `• 취소: 샵 등록 취소`
    );
    
    if (!confirmChange) {
        console.log('❌ 사용자가 타입 변경을 취소함');
        return;
    }
    
    // 사용자 타입을 'shop'으로 업데이트
    const updateResponse = await fetch(`tables/users/${existingUser.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_type: 'shop'
        })
    });
    
    if (!updateResponse.ok) {
        throw new Error('사용자 타입 업데이트 실패');
    }
    
    console.log('✅ 사용자 타입 업데이트 완료:', existingUser.user_type, '→ shop');
}
```

---

## ✅ 수정 효과

### Before (문제)
```
1. 신규 샵 등록 시도 (이메일: test@example.com)
2. 기존 사용자 확인: user_type = 'customer'
3. 경고 팝업: "먼저 사용자 관리에서 타입을 변경해주세요"
4. 함수 종료 → 샵 등록 실패 ❌
5. 관리자가 수동으로 사용자 관리 → 타입 변경 필요
```

### After (수정)
```
1. 신규 샵 등록 시도 (이메일: test@example.com)
2. 기존 사용자 확인: user_type = 'customer'
3. 확인 팝업: "업체로 전환하시겠습니까?"
   - 확인 클릭: 자동으로 user_type을 'shop'으로 변경 → 샵 등록 진행 ✅
   - 취소 클릭: 샵 등록 취소
4. 샵 등록 성공! ✅
```

---

## 🧪 테스트 시나리오

### 시나리오 1: customer → shop 자동 전환
```
1. 먼저 customer 계정 생성:
   - register.html → 고객 회원가입
   - 이메일: convert_test@beautycat.kr
   - 이름: 전환테스트
   - 전화: 010-1111-2222
   
2. 관리자 대시보드에서 신규 샵 등록:
   - 업체명: 전환테스트샵
   - 이메일: convert_test@beautycat.kr (동일 이메일)
   - 기타 정보 입력
   
3. "등록하기" 클릭
   
4. 예상 결과:
   ✅ 확인 팝업: "업체로 전환하시겠습니까?"
   ✅ "확인" 클릭 시:
      - 콘솔: "✅ 사용자 타입 업데이트 완료: customer → shop"
      - 샵 등록 진행
      - 등록 완료 알림
      - 샵 목록에 "전환테스트샵" 표시
   ✅ "취소" 클릭 시:
      - 샵 등록 취소
      - 모달 그대로 유지
```

### 시나리오 2: 이미 shop 타입인 경우
```
1. 이미 shop 타입으로 등록된 이메일 사용
2. 신규 샵 등록
3. 예상 결과:
   ✅ 타입 변경 팝업 없음 (이미 shop)
   ✅ 바로 샵 등록 진행
```

### 시나리오 3: 신규 이메일
```
1. 처음 사용하는 이메일로 샵 등록
2. 예상 결과:
   ✅ 신규 사용자 생성 (user_type: 'shop')
   ✅ 샵 등록 진행
```

---

## 📊 영향 범위

### 긍정적 영향
- ✅ **사용자 경험 개선**: 동일 이메일로 샵 등록 가능
- ✅ **자동화**: 수동 타입 변경 불필요
- ✅ **유연성**: 고객이 나중에 업체로 전환 가능

### 주의 사항
- ⚠️ **타입 전환 확인**: 사용자가 실수로 타입을 변경하지 않도록 확인 팝업 필수
- ⚠️ **데이터 일관성**: 타입 변경 후에도 기존 고객 데이터는 유지됨

---

## 🚀 배포 절차

### Git 명령어
```bash
cd /d D:\beautycat
git add admin-dashboard.html HOTFIX_DUPLICATE_EMAIL_v2.8.8.1.13.md README.md
git commit -m "fix: 동일 이메일 신규 샵 등록 자동 타입 변경 (v2.8.8.1.13)"
git push origin main
```

### 배포 후 확인
1. **Cloudflare 캐시 삭제**: https://dash.cloudflare.com/ → beautycat.kr → Caching → **Purge Everything**
2. **브라우저 테스트**: https://beautycat.kr/admin-dashboard.html (Ctrl+Shift+R)
3. **동일 이메일 테스트**: 위 테스트 시나리오 1 실행

---

## 🔍 기술적 세부 사항

### API 호출
```javascript
PATCH /tables/users/{userId}
Content-Type: application/json

{
  "user_type": "shop"
}
```

### 로그 메시지
```
⚠️ 사용자 타입이 "shop"이 아님. 자동 업데이트 시작: customer → shop
✅ 사용자 타입 업데이트 완료: customer → shop
🏪 샵 등록 시작...
✅ 샵 등록 완료: shop_xxx
```

---

## 📝 관련 문서
- [v2.8.8.1.8] HOTFIX_REGISTER_FUNCTION_v2.8.8.1.8.md
- [v2.8.8.1.9] HOTFIX_SHOP_TYPE_FILTER_v2.8.8.1.9.md
- [v2.8.8.1.10] HOTFIX_NAVER_CAFE_ID_v2.8.8.1.10.md
- [v2.8.8.1.11] HOTFIX_SEARCH_BUTTON_v2.8.8.1.11.md
- [v2.8.8.1.12] HOTFIX_NEW_SHOP_LIST_v2.8.8.1.12.md

---

**상태**: ✅ 수정 완료 - 배포 대기  
**테스트**: ⏳ 배포 후 검증 필요
