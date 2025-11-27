# 🚨 HOTFIX v2.5.5: DB 스키마 필드 매핑 수정

## 📋 배포 정보
- **버전**: v2.5.5
- **배포일**: 2025-11-27
- **우선순위**: 🔴 긴급 (채팅 500 에러, Shop 404 에러 해결)
- **영향 범위**: skincare_shops 테이블 조회/생성 전체

---

## 🐛 문제 상황

### 1. 메시지 전송 500 에러
```
POST https://beautycat-api.jansmakr.workers.dev/api/tables/messages 500
❌ 메시지 전송 오류: 메시지 전송에 실패했습니다.
```

### 2. Shop 정보 404 에러
```
GET https://beautycat-api.jansmakr.workers.dev/api/tables/skincare_shops/shop_1763289928284 404
GET https://beautycat-api.jansmakr.workers.dev/api/tables/skincare_shops/shop_1763288766406 404
```

### 3. DB 쿼리 에러
```sql
SELECT id, shop_name FROM skincare_shops;
-- ❌ Error: no such column: shop_name
```

---

## 🔍 근본 원인

### DB 스키마 vs 프론트엔드 코드 불일치

#### **DB 스키마 (cloudflare-d1-schema.sql)**
```sql
CREATE TABLE skincare_shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,        -- ✅ 실제 컬럼명
    state TEXT NOT NULL,       -- ✅ 실제 컬럼명
    district TEXT NOT NULL,
    ...
);
```

#### **프론트엔드 코드 (14개 JS 파일)**
```javascript
// ❌ 잘못된 필드명 사용
shop.shop_name  // DB에는 "name"
shop.region     // DB에는 "state"
```

#### **영향받는 파일 (14개)**
- `js/main.js` (10회)
- `js/customer-dashboard.js` (4회)
- `js/shop-dashboard.js` (11회)
- `js/admin-dashboard.js` (10회)
- `js/chat.js` (1회)
- `js/auth.js` (6회)
- `js/regional-matching.js` (4회)
- 기타 8개 파일

---

## ✅ 해결 방법

### 중앙 집중식 필드 매핑 시스템 구축

**`api-global-override.js`에 필드 매핑 로직 추가**

#### 핵심 기능:
1. **자동 필드 변환**
   - DB: `name` → 프론트엔드: `shop_name`
   - DB: `state` → 프론트엔드: `region`

2. **양방향 매핑**
   - 조회(GET): DB → 프론트엔드
   - 생성(POST): 프론트엔드 → DB

3. **투명한 처리**
   - 기존 14개 JS 파일 수정 불필요
   - 모든 API 호출에 자동 적용

---

## 📝 수정 내용

### 1. `js/api-global-override.js` (v2.5.5)

#### 추가된 함수:
```javascript
// 필드 매핑 함수
function mapShopFields(shop) {
    return {
        ...shop,
        shop_name: shop.name || shop.shop_name,  // name → shop_name
        region: shop.state || shop.region,       // state → region
        name: shop.name || shop.shop_name        // 원본 유지
    };
}

function mapResponseFields(data) {
    // 단일 객체, 배열, RESTful 응답 모두 처리
    // ...
}
```

#### 수정된 함수:
- `getTableData()` - 필드 매핑 적용
- `getRecord()` - 필드 매핑 적용
- `createRecord()` - 역매핑 적용 (shop_name → name)

### 2. HTML 캐시 버스팅 (6개 파일)

**버전 업데이트: v2.4.2 → v2.5.5**

- ✅ `chat.html`
- ✅ `customer-dashboard.html`
- ✅ `shop-dashboard.html`
- ✅ `admin-dashboard.html`
- ✅ `index.html`
- ✅ `announcements.html`

---

## 🚀 배포 파일 목록

### **필수 배포 파일 (8개)**
```
1. js/api-global-override.js          (필드 매핑 로직 추가)
2. chat.html                          (v2.5.5 캐시 버스팅)
3. customer-dashboard.html            (v2.5.5 캐시 버스팅)
4. shop-dashboard.html                (v2.5.5 캐시 버스팅)
5. admin-dashboard.html               (v2.5.5 캐시 버스팅)
6. index.html                         (v2.5.5 캐시 버스팅)
7. announcements.html                 (v2.5.5 캐시 버스팅)
8. README.md                          (버전 업데이트)
```

### **참고 문서**
```
- DEPLOY_v2.5.5_DB_SCHEMA_FIX.md      (이 파일)
- DB_DEBUG_GUIDE.md                   (DB 디버깅 가이드)
- DB_QUICK_FIX.sql                    (DB 수정 스크립트)
- WRANGLER_SETUP.md                   (Wrangler CLI 가이드)
- QUICK_DB_FIX_COMMANDS.txt           (빠른 명령어)
```

---

## 🧪 배포 후 테스트

### 1️⃣ 캐시 클리어 (필수!)
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

또는:

F12 → Network 탭 → "Disable cache" 체크 → 새로고침
```

### 2️⃣ 콘솔 확인
```javascript
// 기대 출력:
✅ API Global Override 설정 완료
🔄 필드 매핑 활성화: name → shop_name, state → region
```

### 3️⃣ Shop 데이터 로드 테스트
```javascript
// 브라우저 콘솔에서 실행:
const shop = await getRecord('skincare_shops', 'shop_1763289928284');
console.log(shop.shop_name); // ✅ 정상 출력
console.log(shop.name);      // ✅ 정상 출력 (원본)
```

### 4️⃣ 채팅 메시지 전송 테스트
```
1. https://beautycat.kr/chat.html?consultation_id=cf_1763286471750_ylm9rhqmg&user_type=customer

2. 메시지 입력 후 전송

3. 콘솔 확인:
   ✅ "✅ 메시지 전송 성공"
   ❌ "500 Internal Server Error" 없음
```

---

## 📊 기대 효과

| 항목 | AS-IS (문제) | TO-BE (해결) |
|------|-------------|-------------|
| Shop 조회 | ❌ 404 에러 | ✅ 정상 조회 |
| Shop 정보 표시 | ❌ `undefined` | ✅ 정상 표시 |
| 메시지 전송 | ❌ 500 에러 | ✅ 정상 전송 |
| 코드 유지보수 | ❌ 14개 파일 수정 필요 | ✅ 1개 파일만 관리 |
| DB 스키마 변경 | ❌ 전체 코드 수정 | ✅ 매핑 함수만 수정 |

---

## 🎯 장기 해결책 (차후 진행)

### Phase 1: 현재 (긴급)
- ✅ `api-global-override.js`에 필드 매핑 추가
- ✅ 기존 코드 변경 없이 호환성 유지

### Phase 2: 점진적 마이그레이션 (선택)
```javascript
// 점진적으로 코드를 DB 스키마에 맞게 수정
// shop.shop_name → shop.name
// shop.region → shop.state
```

### Phase 3: 타입스크립트 도입 (권장)
```typescript
// 타입 안정성 확보
interface Shop {
    id: string;
    name: string;      // DB 스키마와 일치
    state: string;     // DB 스키마와 일치
    district: string;
    // ...
}
```

---

## 📞 배포 절차

### Yedit에서:

```
1. 다음 8개 파일 선택:
   - js/api-global-override.js
   - chat.html
   - customer-dashboard.html
   - shop-dashboard.html
   - admin-dashboard.html
   - index.html
   - announcements.html
   - README.md

2. Commit 메시지:
   🚨 HOTFIX v2.5.5: DB 스키마 필드 매핑 수정

3. Push

4. 배포 완료 후:
   - 브라우저 캐시 클리어 (Ctrl+Shift+R)
   - https://beautycat.kr 접속
   - 콘솔에서 "필드 매핑 활성화" 메시지 확인
   - 채팅 기능 테스트
```

---

## ✅ 완료 체크리스트

### 배포 전:
- [x] `api-global-override.js` 필드 매핑 추가
- [x] HTML 6개 파일 캐시 버스팅 (v2.5.5)
- [x] `README.md` 업데이트
- [x] 배포 문서 작성

### 배포 후:
- [ ] 브라우저 캐시 클리어 (Hard Refresh)
- [ ] 콘솔에서 v2.5.5 확인
- [ ] Shop 데이터 로드 테스트
- [ ] 채팅 메시지 전송 테스트
- [ ] 404/500 에러 사라짐 확인

---

## 🎉 결론

**v2.5.5**는 DB 스키마와 프론트엔드 코드 간의 불일치를 해결하는 핵심 패치입니다.

**핵심 장점:**
1. ✅ 14개 JS 파일 수정 불필요
2. ✅ 기존 코드와 100% 호환
3. ✅ 중앙 집중식 관리
4. ✅ 향후 스키마 변경에도 유연 대응

**즉시 배포하여 채팅 기능과 Shop 조회 기능을 복구하세요!** 🚀
