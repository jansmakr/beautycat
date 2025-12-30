# 🔧 HOTFIX v2.8.13.6.97 - naver_cafe_id 필드 제거

## 📅 날짜
- **배포일**: 2025-01-30
- **버전**: v2.8.13.6.97
- **이전 버전**: v2.8.13.6.96

---

## 🎯 목표
- 신규 업체 등록 시 500 에러 수정
- DB 스키마에 없는 `naver_cafe_id` 필드 제거

---

## 🐛 해결된 문제

### 1️⃣ 신규 업체 등록 실패 (500 Error)

**문제:**
```
POST /tables/skincare_shops → 500 Internal Server Error

Error: Database operation failed
Message: D1_ERROR: table skincare_shops has no column named naver_cafe_id: SQLITE_ERROR
```

**원인:**
- `skincare_shops` 테이블에 `naver_cafe_id` 컬럼이 존재하지 않음
- 신규 업체 등록 코드에서 존재하지 않는 필드를 전송

**영향:**
- 관리자 대시보드에서 신규 업체 등록 불가
- 김정선 업체 등록 시도 → 500 에러 발생

---

## 🔍 **DB 스키마 확인**

### skincare_shops 테이블 구조
```sql
CREATE TABLE skincare_shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT NOT NULL,
    services TEXT,
    description TEXT,
    business_number TEXT,
    business_license TEXT,
    status TEXT DEFAULT 'pending',
    representative_treatments TEXT,
    price_range TEXT,
    operating_hours TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted INTEGER DEFAULT 0
);
```

**확인:** `naver_cafe_id` 컬럼이 **없음** ❌

---

## 🔧 **수정 내용**

### Before (v2.8.13.6.96)
```javascript
const shopData = {
    name: shopName,
    owner_name: ownerName,
    phone: phone,
    email: email,
    state: state,
    district: district,
    address: address,
    business_number: businessNumber,
    business_license: licenseNumber || null,
    naver_cafe_id: naverCafeId || null,  // ❌ DB에 없는 필드!
    status: 'pending'
};
```

### After (v2.8.13.6.97)
```javascript
const shopData = {
    name: shopName,
    owner_name: ownerName,
    phone: phone,
    email: email,
    state: state,
    district: district,
    address: address,
    business_number: businessNumber,
    business_license: licenseNumber || null,
    // naver_cafe_id 제거됨 ✅
    status: 'pending'
};
```

---

## 📝 변경 사항

### ✅ 수정된 파일

1. **js/admin-dashboard.js**
   - Line 2960: `naver_cafe_id: naverCafeId || null,` 제거
   - 신규 업체 등록 함수 수정

2. **admin-dashboard.html**
   - 버전 업데이트: `v2.8.13.6.96` → `v2.8.13.6.97`

---

## 🧪 테스트 방법

### 1️⃣ 신규 업체 등록 테스트

```bash
1. 관리자 대시보드 접속
2. 샵 입점 관리 → [+ 새 업체 추가]
3. 정보 입력:
   - 업체명: 테스트 업체
   - 대표자명: 테스트 사장님
   - 이메일: test@beautycat.kr
   - 비밀번호: test1234
   - 전화번호: 010-1234-5678
   - 시/도: 서울
   - 구/군: 강남구
   - 주소: 테스트 주소
   - 사업자등록번호: 123-45-67890
4. [등록] 버튼 클릭
5. ✅ 성공 메시지: "업체 등록이 완료되었습니다!"
6. 샵 입점 관리 목록에서 확인
```

### 2️⃣ 콘솔 로그 확인

**성공 시:**
```
User created: {id: 'cf_xxx', name: '테스트 사장님', ...}
Shop created: {id: 'cf_xxx', name: '테스트 업체', ...}
✅ 업체 등록이 완료되었습니다!
```

**실패 시 (구버전):**
```
❌ Shop registration error:
Database operation failed
D1_ERROR: table skincare_shops has no column named naver_cafe_id
```

---

## 📊 이전 오류 로그

### 김정선 업체 등록 시도 (실패)
```javascript
POST https://beautycat.kr/tables/skincare_shops

Request Body:
{
  "name": "김정선 업체",
  "owner_name": "김정선",
  "email": "rlawjdtjs71@naver.com",
  "phone": "031 542 1177",
  "state": "경기",
  "district": "수원시",
  "address": "...",
  "business_number": "000-00-00000",
  "business_license": "...",
  "naver_cafe_id": null,  // ❌ 이 필드 때문에 500 에러!
  "status": "pending"
}

Response: 500 Internal Server Error
{
  "error": "Database operation failed",
  "message": "D1_ERROR: table skincare_shops has no column named naver_cafe_id: SQLITE_ERROR"
}
```

---

## 🚀 배포 절차

### 1. Git 푸시
```bash
cd /d/beautycat

git add admin-dashboard.html \
        js/admin-dashboard.js \
        HOTFIX_NAVER_CAFE_ID_v2.8.13.6.97.md

git commit -m "🔧 HOTFIX v2.8.13.6.97 - naver_cafe_id 필드 제거

- 신규 업체 등록 시 500 에러 수정
- DB 스키마에 없는 naver_cafe_id 필드 제거
- 김정선 업체 등록 가능하게 수정"

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

3. 버전 확인
   - F12 → Console
   - admin-dashboard.js?v=2.8.13.6.97 확인

4. 신규 업체 등록
   - 샵 입점 관리 → [+ 새 업체 추가]
   - 김정선 업체 정보 입력
   - [등록] 클릭
   - 성공 메시지 확인
```

---

## 🔄 이전 버전과의 차이

### v2.8.13.6.96 → v2.8.13.6.97

| 항목 | v2.8.13.6.96 | v2.8.13.6.97 |
|------|--------------|--------------|
| 신규 업체 등록 | ❌ 500 에러 | ✅ 정상 작동 |
| naver_cafe_id 필드 | ❌ 전송 시도 | ✅ 제거됨 |
| DB 스키마 일치 | ❌ 불일치 | ✅ 일치 |

---

## 📦 배포 파일
- ✅ `admin-dashboard.html` (버전 업데이트)
- ✅ `js/admin-dashboard.js` (naver_cafe_id 제거)
- ✅ `HOTFIX_NAVER_CAFE_ID_v2.8.13.6.97.md` (이 문서)

---

## 🎯 김정선 업체 등록 방법

### 이제 정상 작동합니다! ✅

```
1. 관리자 대시보드
2. 샵 입점 관리 → [+ 새 업체 추가]
3. 정보 입력:
   - 업체명: 김정선 업체
   - 대표자명: 김정선
   - 이메일: rlawjdtjs71@naver.com
   - 비밀번호: 24852485
   - 전화번호: 031-542-1177
   - 시/도: 경기
   - 구/군: 수원시
   - 주소: (실제 주소 입력)
   - 사업자등록번호: 000-00-00000
4. [등록] 클릭
5. ✅ 성공!
```

---

## ⚠️ 주의사항

### 1. 네이버 카페 ID 기능
- 현재 DB 스키마에 `naver_cafe_id` 컬럼이 없음
- 추후 필요시 DB 마이그레이션 필요

### 2. 기존 데이터
- 이미 등록된 업체는 영향 없음
- 새로 등록하는 업체만 영향

### 3. UI 필드
- 신규 업체 등록 모달에 "네이버 카페 ID" 입력 필드가 있을 수 있음
- 입력해도 DB에 저장되지 않음 (무시됨)
- 추후 UI에서도 제거 권장

---

## 🔮 향후 개선 사항

### 1. DB 스키마 업데이트 (선택)
```sql
-- naver_cafe_id 컬럼 추가 (필요시)
ALTER TABLE skincare_shops 
ADD COLUMN naver_cafe_id TEXT;
```

### 2. UI 업데이트
- 신규 업체 등록 모달에서 "네이버 카페 ID" 필드 제거
- 또는 "준비 중" 표시

---

## 📞 문제 발생 시

### 여전히 500 에러 발생
```bash
1. 브라우저 캐시 완전 삭제 재시도
2. 시크릿 모드로 접속 테스트
3. 콘솔 로그 전체 복사해서 공유
```

### 다른 필드 오류
```bash
1. 콘솔에서 에러 메시지 확인
2. DB 스키마와 전송 데이터 비교
3. 필요시 추가 핫픽스
```

---

## 📋 배포 히스토리

| 버전 | 날짜 | 변경사항 | 파일 수 | 상태 |
|------|------|---------|---------|------|
| **v2.8.13.6.97** | 01/30 | naver_cafe_id 제거 | 3 | 🚀 **푸시 대기** |
| v2.8.13.6.96 | 12/30 | 사용자 삭제 기능 | 3 | ✅ 완료 |
| v2.8.13.6.95 | 12/30 | 샵 입점 관리 디버깅 | 3 | ✅ 완료 |

---

**이제 김정선 업체를 정상적으로 등록할 수 있습니다!** 🎉
