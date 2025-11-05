# 관리자 대시보드 - 대표샵 관리 기능 추가

> **버전:** v2.3.1  
> **날짜:** 2025-11-05  
> **기능:** 샵 리스트에서 직접 대표샵 지정/해제

---

## 🎯 추가된 기능

### **샵 입점관리 페이지에 대표샵 관리 통합**

관리자가 **샵 리스트**에서 바로 대표샵을 지정하거나 해제할 수 있습니다.

---

## 📊 변경 사항

### **1. 테이블 구조 변경**

#### **Before (6개 컬럼)**
```
샵명 | 지역 | 네이버 카페 ID | 등록일 | 입점상태 | 관리작업
```

#### **After (7개 컬럼)**
```
샵명 | 지역 | 네이버 카페 ID | 등록일 | 입점상태 | 대표샵 상태 | 관리작업
```

### **2. 대표샵 상태 컬럼**

#### **대표샵인 경우**
```html
<span class="badge-blue">
    ⭐ 대표샵
</span>
<button>❌ 해제</button>
```

#### **일반 샵인 경우**
```html
<button>⭐ 대표샵 지정</button>
```

---

## 🔧 기능 상세

### **1. 대표샵 지정**

**동작 과정:**
1. "대표샵 지정" 버튼 클릭
2. 확인 메시지:
   ```
   {샵명}을(를) {시/도} {구/군}의 대표샵으로 지정하시겠습니까?
   
   대표샵으로 지정되면:
   - 해당 지역 메인 페이지에서 전화상담 버튼으로 노출됩니다
   - 고객이 바로 전화 상담할 수 있습니다
   ```
3. 해당 지역에 기존 대표샵이 있으면 추가 확인:
   ```
   {시/도} {구/군}에는 이미 대표샵 "{기존샵명}"이(가) 있습니다.
   기존 대표샵을 해제하고 새로 지정하시겠습니까?
   ```
4. API 호출하여 업데이트
5. 목록 자동 새로고침

**API 요청:**
```javascript
PATCH /tables/skincare_shops/{shopId}
{
    "is_representative": true,
    "representative_status": "approved",
    "representative_approved_at": "2025-11-05T01:30:00Z"
}
```

---

### **2. 대표샵 해제**

**동작 과정:**
1. "❌" 버튼 클릭
2. 확인 메시지:
   ```
   {샵명}의 대표샵 지정을 해제하시겠습니까?
   ```
3. API 호출하여 업데이트
4. 목록 자동 새로고침

**API 요청:**
```javascript
PATCH /tables/skincare_shops/{shopId}
{
    "is_representative": false,
    "representative_status": "none",
    "representative_approved_at": null
}
```

---

## 💡 사용 시나리오

### **시나리오 1: 신규 대표샵 지정**

```
관리자 작업:
1. 샵 리스트에서 우수 업체 확인
2. "대표샵 지정" 버튼 클릭
3. 확인 후 지정 완료

결과:
- 해당 샵에 ⭐ 대표샵 배지 표시
- 메인 페이지 전화상담 섹션에 자동 노출
```

### **시나리오 2: 대표샵 변경**

```
상황: 서울 강남구 대표샵을 A → B로 변경

관리자 작업:
1. B 샵의 "대표샵 지정" 클릭
2. 기존 대표샵(A) 해제 확인
3. 새로운 대표샵(B) 지정 확인

결과:
- A 샵: 대표샵 상태 자동 해제
- B 샵: 대표샵으로 지정
- 메인 페이지에 B 샵 전화번호 표시
```

### **시나리오 3: 대표샵 해제**

```
상황: 대표샵 계약 종료 또는 문제 발생

관리자 작업:
1. 대표샵 배지 옆 "❌" 버튼 클릭
2. 해제 확인

결과:
- 대표샵 상태 해제
- 메인 페이지 전화상담 섹션에서 제거
- 일반 샵으로 전환
```

---

## 🎨 UI 디자인

### **대표샵 배지**

```html
<!-- 대표샵 표시 -->
<div class="flex items-center">
    <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
        <i class="fas fa-star"></i> 대표샵
    </span>
    <button class="ml-2 text-red-600 hover:text-red-800" title="대표샵 해제">
        <i class="fas fa-times-circle"></i>
    </button>
</div>
```

### **대표샵 지정 버튼**

```html
<!-- 일반 샵 -->
<button class="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-blue-100 hover:text-blue-700 text-xs">
    <i class="fas fa-star"></i> 대표샵 지정
</button>
```

---

## 📝 데이터베이스 필드

### **skincare_shops 테이블**

| 필드 | 타입 | 설명 |
|------|------|------|
| `is_representative` | boolean | 대표샵 여부 |
| `representative_status` | string | 대표샵 상태 ('approved', 'none') |
| `representative_approved_at` | datetime | 대표샵 지정 일시 |

---

## 🔍 필터링 및 검색

### **기존 필터 유지**
- 검색: 샵명, 대표자명, 이메일
- 지역 필터: 시/도 선택
- 상태 필터: 활성/비활성/승인대기

### **추가 가능한 필터 (추후)**
- [ ] 대표샵 필터: 대표샵만 보기
- [ ] 대표샵 상태: 승인됨/미지정

---

## ✅ 테스트 체크리스트

### **기능 테스트**
- [x] 대표샵 지정 기능
- [x] 대표샵 해제 기능
- [x] 중복 대표샵 확인
- [x] 기존 대표샵 자동 해제
- [x] API 요청 성공 시 동작
- [x] API 실패 시 로컬 업데이트

### **UI 테스트**
- [x] 배지 표시 정상
- [x] 버튼 클릭 반응
- [x] 확인 메시지 표시
- [x] 목록 자동 새로고침

### **예외 처리**
- [x] 지역 정보 없는 샵 처리
- [x] API 오류 처리
- [x] 중복 요청 방지

---

## 🚀 배포

### **변경된 파일**

1. **admin-dashboard.html**
   - 테이블 헤더에 "대표샵 상태" 컬럼 추가
   - colspan 6 → 7로 수정

2. **js/admin-dashboard.js**
   - `displayShops()` 함수 수정 (대표샵 상태 표시)
   - `toggleRepresentativeStatus()` 함수 추가
   - `updateShopRepresentativeStatus()` 함수 추가

3. **ADMIN_REPRESENTATIVE_SHOP_FEATURE.md** (신규)
   - 기능 설명 문서

### **배포 방법**

```bash
1. D:\beautycat\ 폴더 확인
2. GitHub Desktop 열기
3. 변경사항 확인 (3개 파일)
4. Commit: "v2.3.1: 샵 리스트에 대표샵 관리 기능 추가"
5. Push to origin
```

---

## 📚 관련 문서

- **관리자 매뉴얼**: `ADMIN_MANUAL.md`
- **대표샵 관리 가이드**: 별도 메뉴 "대표샵 지정"
- **API 문서**: `README.md` (데이터베이스 구조)

---

## 🎯 향후 개선사항

### **Phase 1: 대표샵 필터**
- [ ] "대표샵만 보기" 필터 추가
- [ ] 대표샵 개수 통계 표시

### **Phase 2: 대표샵 이력**
- [ ] 대표샵 지정/해제 이력 기록
- [ ] 대표샵 변경 로그 확인

### **Phase 3: 대표샵 통계**
- [ ] 지역별 대표샵 현황 대시보드
- [ ] 대표샵 전환율 분석

---

**작성일:** 2025-11-05  
**버전:** v2.3.1  
**상태:** ✅ 기능 추가 완료
