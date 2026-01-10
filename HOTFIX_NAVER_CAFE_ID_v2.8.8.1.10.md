# 🔧 HOTFIX: naver_cafe_id 컬럼 오류 수정 (v2.8.8.1.10)

**날짜**: 2026-01-10  
**버전**: v2.8.8.1.10  
**우선순위**: 🔴 HIGH  
**유형**: 버그 수정 (신규 샵 등록 500 에러)

---

## 📌 문제 요약

### 근본 원인
- `admin-dashboard.html`의 신규 샵 등록 시 `naver_cafe_id` 필드를 `skincare_shops` 테이블에 삽입하려고 시도
- 실제 DB 스키마에 `naver_cafe_id` 컬럼이 없어 SQLITE_ERROR 발생
- 500 Internal Server Error로 샵 등록 실패

### 에러 메시지
```
D1_ERROR: table skincare_shops has no column named naver_cafe_id: SQLITE_ERROR
```

### 증상
- 신규 샵 등록 버튼 클릭 시 500 에러 발생
- "해욿토탈뷰티" 샵 등록 실패
- 콘솔: `❌ 샵 등록 실패: {"error":"Database operation failed",...}`

### 영향 범위
- 관리자 대시보드 신규 샵 등록 기능 완전 중단
- 미료쿠 샵 등록 불가능

---

## ✅ 수정 내용

### 1. admin-dashboard.html 수정
- **Line 1776**: `naver_cafe_id: naverId` 제거
- **효과**: 샵 등록 시 존재하지 않는 컬럼 제거

#### 수정 전 (Line 1766~1778)
```javascript
body: JSON.stringify({
    name: shopName,
    owner_name: ownerName,
    state: state,
    district: district,
    address: address,
    phone: phone,
    email: email,
    business_number: businessNumber,
    business_license: licenseNumber,
    naver_cafe_id: naverId,  // ❌ 이 컬럼이 없음!
    status: 'active'
})
```

#### 수정 후 (Line 1766~1777)
```javascript
body: JSON.stringify({
    name: shopName,
    owner_name: ownerName,
    state: state,
    district: district,
    address: address,
    phone: phone,
    email: email,
    business_number: businessNumber,
    business_license: licenseNumber,
    status: 'active'  // ✅ naver_cafe_id 제거
})
```

---

## 📊 실제 DB 스키마 (skincare_shops)

### 존재하는 컬럼
```sql
- id (UUID, Primary Key)
- name (TEXT) -- 샵 이름
- owner_name (TEXT, NOT NULL) -- 대표자명
- phone (TEXT)
- email (TEXT)
- address (TEXT)
- state (TEXT) -- 시/도
- district (TEXT) -- 구/군
- town (TEXT) -- 읍/면/동
- status (TEXT) -- 영업중/폐업
- business_number (TEXT) -- 사업자등록번호
- business_license (TEXT) -- 영업신고번호
- services (TEXT)
- description (TEXT)
- ... (기타 필드)
```

### ❌ 존재하지 않는 컬럼 (제거 완료)
- ~~shop_name~~ (v2.8.8.1.6에서 제거) → `name` 사용
- ~~license_number~~ (v2.8.8.1.7에서 제거) → `business_license` 사용
- ~~is_active~~ (v2.8.8.1.7에서 제거)
- ~~verified~~ (v2.8.8.1.7에서 제거)
- ~~naver_cafe_id~~ (v2.8.8.1.10에서 제거) ← **NEW!**

---

## 🧪 테스트 절차

### 1. Git 배포
```bash
cd /d D:\beautycat
git add admin-dashboard.html HOTFIX_NAVER_CAFE_ID_v2.8.8.1.10.md README.md
git commit -m "fix: naver_cafe_id 컬럼 오류 수정 (v2.8.8.1.10)"
git push origin main
```

### 2. Cloudflare 캐시 삭제
- https://dash.cloudflare.com/ 접속
- beautycat.kr → Caching → **Purge Everything** 클릭

### 3. 신규 샵 등록 테스트

#### 절차
1. https://beautycat.kr/admin-dashboard.html 접속 (Ctrl+Shift+R)
2. 좌측 메뉴 → **업체 관리** 클릭
3. **신규 샵 등록** 버튼 클릭
4. 입력:
   - 업체명: 해욿토탈뷰티
   - 시/도: 경기
   - 시/군/구: 수원시 (31개 로드 확인)
   - 상세 주소: 팔달구 인계동 123
   - 대표자명: 미료쿠
   - 전화번호: 010-5790-2347
   - 이메일: taerang0428@naver.com
   - 비밀번호: test1234!@
   - 사업자등록번호: 111-00-11111
   - 영업신고번호: TEST-2026-001
   - 네이버 카페 아이디: taerang0428 (입력하지만 샵 테이블에는 저장 안됨)
5. **등록하기 버튼 클릭**

#### 예상 결과
- ✅ 콘솔: `👤 사용자 존재 여부 확인 중...`
- ✅ 콘솔: `✅ 기존 사용자 발견: cf_1765378764886_t0kzvh3fc`
- ✅ 콘솔: `🏪 샵 등록 시작...`
- ✅ 콘솔: `✅ 샵 등록 완료: [shop_id]`
- ✅ 알림: "✅ "해욿토탈뷰티" 샵이 성공적으로 등록되었습니다!"
- ❌ 500 에러 없음
- ❌ `naver_cafe_id` 관련 에러 없음

---

## 📂 관련 이슈 히스토리

### v2.8.8.1.6 (2026-01-09)
- **문제**: `shop_name` 컬럼 없음
- **수정**: `shop_name` → `name`

### v2.8.8.1.7 (2026-01-09)
- **문제**: `license_number`, `is_active`, `verified` 컬럼 없음
- **수정**: `license_number` → `business_license`, `is_active`/`verified` 제거

### v2.8.8.1.10 (2026-01-10) ← **현재**
- **문제**: `naver_cafe_id` 컬럼 없음
- **수정**: `naver_cafe_id` 제거

---

## 💡 참고: 네이버 카페 ID 저장 위치

네이버 카페 ID는 **users 테이블**의 `cafe_id` 필드에 저장됩니다:

```javascript
// users 테이블
{
    email: 'taerang0428@naver.com',
    cafe_platform: 'naver',
    cafe_id: 'taerang0428'  // ← 여기에 저장
}
```

신규 샵 등록 시 입력받은 네이버 카페 ID는 사용자 등록 단계에서 users 테이블에 저장되며, skincare_shops 테이블에는 저장되지 않습니다.

---

## 🎯 핵심 개선 사항

1. **신규 샵 등록 정상 작동**: `naver_cafe_id` 필드 제거로 500 에러 해결
2. **DB 스키마 일치**: 코드와 실제 DB 스키마 일치
3. **미료쿠 샵 등록 가능**: 이제 정상적으로 샵 등록 가능

---

## 📂 관련 파일

- ✅ `admin-dashboard.html` (Line 1776): `naver_cafe_id` 제거
- 📄 `HOTFIX_NAVER_CAFE_ID_v2.8.8.1.10.md`: 본 문서
- 📄 `README.md`: 버전 업데이트

---

## 다음 단계

1. ✅ **배포 실행**: 위의 Git 배포 명령 실행
2. ✅ **캐시 삭제**: Cloudflare Purge Everything
3. ✅ **샵 등록 테스트**: 미료쿠 샵 등록 테스트
4. ✅ **데이터 확인**: skincare_shops 테이블에 샵 생성 확인

---

**작성자**: AI Agent  
**배포 상태**: 🟡 배포 준비 완료  
**이전 버전**: v2.8.8.1.9 (샵 타입 필터)  
**현재 버전**: v2.8.8.1.10 (naver_cafe_id 제거)
