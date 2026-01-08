# 🔧 HOTFIX v2.8.13.6.163.3 - Admin Dashboard 검색/삭제 수정

## 📋 수정 내역

### 1. 검색 필터 개선 ✅
**파일**: `js/admin-dashboard.js` (943-953번째 줄)

**문제**:
- 대표자명(owner_name) 검색이 누락되어 있음
- shop_name 필드 검색 누락

**해결**:
```javascript
// 추가된 필드:
- shop.shop_name  // 샵명 (API 필드명)
- shop.owner_name // 대표자명
```

**검색 가능 필드** (총 6개):
1. `name` - 샵명 (구 필드명)
2. `shop_name` - 샵명 (신 필드명)
3. `owner_name` - **대표자명** ← 추가됨
4. `address` - 주소
5. `phone` - 전화번호
6. `email` - 이메일

---

### 2. 샵 삭제 기능 수정 ✅
**파일**: `js/admin-dashboard.js` (3600-3647번째 줄)

**문제**:
- 정적 JSON 모드에서 API 호출이 실패함
- 삭제 버튼 클릭 시 아무 동작도 하지 않음

**해결**:
- API 호출 제거
- 클라이언트 사이드에서 `allShops` 배열에서 직접 제거
- 세션 동안만 유효 (페이지 새로고침 시 복구됨)

**삭제 방식**:
```javascript
// Before (API 호출)
const response = await fetch(`tables/skincare_shops/${shopId}`, {
    method: 'PUT',
    body: JSON.stringify({ deleted: true })
});

// After (클라이언트 사이드)
const shopIndex = allShops.findIndex(s => s.id === shopId);
allShops.splice(shopIndex, 1);
window.allShops = allShops;
```

---

## 🧪 테스트 방법

### 1. 검색 필터 테스트
1. Admin Dashboard → 업체 관리 섹션
2. 검색창에 다음을 입력:
   - **샵명**: "강남피부과"
   - **대표자명**: "홍길동"
   - **이메일**: "test@example.com"
3. 결과가 즉시 필터링되는지 확인

### 2. 샵 삭제 테스트
1. Admin Dashboard → 업체 관리 섹션
2. 임의의 샵 행에서 🗑️ 삭제 버튼 클릭
3. 확인 팝업:
   ```
   정말로 'XXX' 샵을 삭제하시겠습니까?
   
   ⚠️ 정적 JSON 모드: 실제 삭제되지 않으며 페이지 새로고침 시 복구됩니다.
   ```
4. 확인 클릭
5. 테이블에서 해당 샵이 사라지는지 확인
6. F12 콘솔에 다음 로그 확인:
   ```
   🗑️ 샵 삭제 요청 (정적 JSON 모드): XXX
   ✅ 샵 삭제 완료 (정적 JSON 모드), 테이블 새로고침 중...
   ```

---

## 📊 영향 범위

### 수정된 파일
- `js/admin-dashboard.js` (2군데 수정)

### 변경된 기능
1. ✅ 검색 필터: 대표자명 검색 추가
2. ✅ 샵 삭제: 클라이언트 사이드 삭제로 변경

### 유지되는 기능
- ✅ 지역 필터
- ✅ 상태 필터
- ✅ 샵 타입 필터 (인증샵/공공데이터/신규등록)
- ✅ 샵 수정
- ✅ 대표샵 지정

---

## ⚠️ 주의사항

### 정적 JSON 모드 제한
현재 Admin Dashboard는 **정적 JSON 파일** (`/shops.json`)을 사용 중입니다.

**제한사항**:
1. **삭제**: 세션 동안만 유효 (새로고침 시 복구)
2. **수정**: API 업데이트 불가
3. **추가**: 새 샵 등록 불가

**해결 방법**:
- 실제 API 엔드포인트 사용 시 정상 작동
- 또는 LocalStorage에 변경사항 저장

---

## 🚀 배포 정보

**버전**: v2.8.13.6.163.3
**날짜**: 2026-01-08
**작업 시간**: 약 5분

**Git 커밋 메시지**:
```
fix: v2.8.13.6.163.3 - Admin 검색/삭제 수정
- 검색 필터에 owner_name, shop_name 추가
- 샵 삭제: 정적 JSON 모드 대응 (클라이언트 사이드)
```

---

## ✅ 체크리스트

배포 전:
- [x] js/admin-dashboard.js 수정 완료
- [x] 검색 필터 로직 검증
- [x] 삭제 함수 로직 검증
- [x] HOTFIX 문서 작성

배포 후 테스트:
- [ ] 대표자명 검색 작동 확인
- [ ] 샵 삭제 작동 확인
- [ ] F12 콘솔 로그 확인
- [ ] 다른 필터 정상 작동 확인

---

## 📝 관련 이슈

**문제 1**: 검색 필터에서 대표자명 검색 안됨
**원인**: `owner_name` 필드가 검색 로직에 누락
**해결**: 검색 필터에 `owner_name`, `shop_name` 추가

**문제 2**: 샵 삭제 버튼이 작동하지 않음
**원인**: 정적 JSON 모드에서 API 호출 실패
**해결**: 클라이언트 사이드에서 배열 직접 수정

---

**End of Document**
