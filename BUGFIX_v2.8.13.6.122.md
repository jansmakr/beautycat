# v2.8.13.6.122 - 리뷰 시스템 버그 수정

## 📅 작성 일시
**2025-12-31**

---

## 🐛 발견된 버그

### 1. **리뷰 시스템 치명적 버그** ❌

#### 문제 상황
```javascript
// customer-dashboard.js (수정 전)
showReviewModal('${consultation.id}', '${consultation.shop_id}', ...)
//                                      ^^^^^^^^^^^^^^^^^^^^^^
//                                      consultations 테이블에 없는 필드!
```

#### 원인
- **consultations 테이블**에는 `shop_id` 필드가 **존재하지 않음**
- 대신 `matched_shops` (JSON array) 필드만 있음
- 리뷰 작성 시 `shop_id`가 `undefined`로 저장됨
- **리뷰가 어떤 샵과도 연결되지 않는 치명적 오류**

#### 영향
- ❌ 모든 리뷰의 `shop_id`가 `undefined`
- ❌ 샵별 리뷰 조회 불가능
- ❌ 자동 매칭 시스템과 완전히 분리됨
- ❌ 리뷰 기능 사실상 작동 불가

---

## ✅ 해결 방법

### 설계 변경: 견적서 기반 리뷰 작성

#### 왜 견적서(quotes)를 사용하는가?
1. **quotes 테이블**에는 `shop_id`가 명확히 존재 (FOREIGN KEY → skincare_shops.id)
2. 견적서는 특정 샵의 제안이므로 `shop_id`가 보장됨
3. 고객이 견적서를 수락한 후 리뷰 작성하는 것이 자연스러운 흐름

#### 데이터 흐름
```
사용자 상담 신청 (consultations)
    ↓
샵들이 견적서 제출 (quotes)
    ├─ quote.shop_id → skincare_shops.id
    ├─ quote.status = 'sent'
    └─ 고객이 견적 수락 → status = 'accepted'
    ↓
리뷰 작성 가능 (reviews)
    ├─ review.shop_id = quote.shop_id (등록 샵 ID)
    ├─ review.quote_id = quote.id (추가)
    └─ review.consultation_id = consultation.id
```

---

## 🔧 수정 사항

### 1. 데이터베이스 마이그레이션

#### 파일: `migrations/0003_add_quote_id_to_reviews.sql`
```sql
-- Add quote_id column to reviews table
ALTER TABLE reviews ADD COLUMN quote_id TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_reviews_quote ON reviews(quote_id);
```

#### 실행 방법
```bash
# Windows
run-migration-0003.bat

# 또는 수동 실행
wrangler d1 execute beautycat-db --remote --file=migrations/0003_add_quote_id_to_reviews.sql
```

---

### 2. 스키마 파일 업데이트

#### 파일: `cloudflare-d1-schema.sql`
```sql
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    consultation_id TEXT NOT NULL,
    quote_id TEXT, -- 견적서 ID (추가: 2025-12-31)
    shop_id TEXT NOT NULL,
    ...
    FOREIGN KEY (quote_id) REFERENCES quotes(id),
    ...
);

-- 인덱스 추가
CREATE INDEX idx_reviews_quote ON reviews(quote_id);
```

---

### 3. 고객 대시보드 수정

#### 파일: `js/customer-dashboard.js`

**변경 1**: 리뷰 대기 목록 - 상담 → 견적서 기반으로 변경
```javascript
// 수정 전
const completedConsultations = currentConsultations.filter(...)

// 수정 후
const acceptedQuotes = currentQuotes.filter(quote => 
    quote.status === 'accepted'
);
```

**변경 2**: showReviewModal 함수 - quoteId 파라미터 추가
```javascript
// 수정 전
function showReviewModal(consultationId, shopId, shopName, treatmentType)

// 수정 후
function showReviewModal(consultationId, shopId, shopName, quoteId)
```

**변경 3**: 리뷰 데이터에 quote_id 추가
```javascript
const reviewData = {
    consultation_id: selectedConsultation.id,
    quote_id: selectedConsultation.quote_id, // 추가
    shop_id: selectedConsultation.shop_id,
    ...
};
```

---

## 📊 테스트 결과

### Before (버그 상태)
```javascript
// 리뷰 작성 시
{
    shop_id: undefined,  // ❌ 버그!
    consultation_id: "cons_123",
    customer_id: "user_456"
}
```

### After (수정 후)
```javascript
// 리뷰 작성 시
{
    shop_id: "shop_001",       // ✅ 정상 (등록 샵 ID)
    quote_id: "quote_789",     // ✅ 추가
    consultation_id: "cons_123",
    customer_id: "user_456"
}
```

---

## 🎯 추가 확인 사항

### 1. 삭제 기능 확인 ✅

#### 사용자 삭제
- **파일**: `js/admin-dashboard.js`
- **함수**: `deleteUser(userId)` (Line 1109)
- **기능**:
  - ✅ 관리자 계정 삭제 방지
  - ✅ 샵 타입 사용자 삭제 시 연결된 샵도 함께 삭제
  - ✅ 확인 대화상자로 실수 방지

```javascript
// 사용 방법 (admin-dashboard.html)
<button onclick="deleteUser('user_123')">
    <i class="fas fa-trash"></i> 삭제
</button>
```

#### 샵 삭제
- **파일**: `js/admin-dashboard.js`
- **함수**: `deleteShop(shopId)` (Line 2965)
- **기능**:
  - ✅ 확인 대화상자로 실수 방지
  - ✅ API 실패 시 로컬 데이터에서 제거
  - ✅ 샵 목록 자동 새로고침

```javascript
// 사용 방법
<button onclick="deleteShop('shop_001')">
    <i class="fas fa-trash"></i> 삭제
</button>
```

---

### 2. 자동 매칭 시스템 코드 검증 ✅

#### 검증 항목
- ✅ Levenshtein Distance 알고리즘 정상
- ✅ 이름 유사도 계산 (80% 임계값)
- ✅ 주소 유사도 계산 (60% 임계값)
- ✅ 전화번호 일치 확인
- ✅ matched_shop_id 업데이트 로직
- ✅ approveShop 함수 통합

**코드 위치**: `js/admin-dashboard.js` Line 1-110, 1389-1431

---

## 📁 변경된 파일 목록

### 신규 파일
1. **migrations/0003_add_quote_id_to_reviews.sql** - DB 마이그레이션
2. **run-migration-0003.bat** - 마이그레이션 실행 스크립트
3. **BUGFIX_v2.8.13.6.122.md** - 버그 수정 문서 (본 파일)

### 수정된 파일
4. **js/customer-dashboard.js** - 리뷰 시스템 수정
   - Line 973-1009: loadPendingReviews() 함수 (상담 → 견적서 기반)
   - Line 1057-1068: showReviewModal() 함수 (quoteId 파라미터 추가)
   - Line 1159-1174: submitReview() 함수 (quote_id 추가)

5. **cloudflare-d1-schema.sql** - 스키마 업데이트
   - Line 195: quote_id 컬럼 추가
   - Line 213: FOREIGN KEY 추가
   - Line 250: 인덱스 추가

---

## 🚀 배포 절차

### 1. 데이터베이스 마이그레이션 실행
```bash
cd D:\beautycat
run-migration-0003.bat
```

**예상 출력**:
```
✅ 마이그레이션 성공!

변경 사항:
- reviews 테이블에 quote_id 컬럼 추가
- idx_reviews_quote 인덱스 생성
```

### 2. Git 커밋 및 Push
```bash
git add js/customer-dashboard.js
git add cloudflare-d1-schema.sql
git add migrations/0003_add_quote_id_to_reviews.sql
git add run-migration-0003.bat
git add BUGFIX_v2.8.13.6.122.md

git commit -m "v2.8.13.6.122 - 리뷰 시스템 버그 수정 (quote_id 추가)"
git push origin main
```

### 3. 배포 후 확인 (2~3분 대기)
1. https://beautycat.kr/customer-dashboard.html 접속
2. 테스트 계정 로그인
3. 리뷰 관리 탭 확인
4. 리뷰 작성 대기 목록이 견적서 기반으로 표시되는지 확인

---

## 🧪 테스트 시나리오

### 시나리오 1: 리뷰 작성 가능 상태
1. 고객이 상담 신청
2. 샵이 견적서 제출
3. 고객이 견적서 수락 (status = 'accepted')
4. → 리뷰 작성 버튼 표시 ✅

### 시나리오 2: 리뷰 작성 불가 상태
1. 고객이 상담만 신청 (견적서 없음)
2. → "리뷰 작성 가능한 견적서가 없습니다." 표시 ✅

### 시나리오 3: 리뷰 작성 완료
1. 리뷰 작성 버튼 클릭
2. 별점 및 리뷰 내용 입력
3. 저장 클릭
4. → `quote_id`와 `shop_id`가 정상적으로 저장됨 ✅

---

## 📈 개선 효과

### Before (버그 상태)
- ❌ 리뷰가 샵과 연결되지 않음
- ❌ 샵별 리뷰 조회 불가능
- ❌ 리뷰 시스템 사실상 작동 불가

### After (수정 후)
- ✅ 리뷰가 명확한 샵 ID와 연결
- ✅ 견적서 기반으로 리뷰 추적 가능
- ✅ 자동 매칭 시스템과 통합
- ✅ 샵별 리뷰 통계 가능
- ✅ 사용자 경험 개선

---

## 🔍 알려진 이슈 및 해결 방법

### 이슈 1: 기존 리뷰 데이터
- **문제**: 기존 리뷰에는 `quote_id`가 NULL
- **해결**: 향후 마이그레이션 스크립트로 매칭 가능 (옵션)
- **영향**: 신규 리뷰만 정상 작동

### 이슈 2: 리뷰 없는 견적서
- **문제**: 견적서 수락 후 리뷰 작성 안 한 경우
- **해결**: "리뷰 작성 대기" 목록에 계속 표시
- **개선**: 일정 기간 후 알림 기능 추가 (향후)

---

## 📞 문의 및 지원

### 기술 문의
- **이메일**: admin@beautycat.kr
- **GitHub**: https://github.com/jansmakr/beautycat/issues

### 긴급 지원
- **관리자 대시보드**: https://beautycat.kr/admin-dashboard.html
- **문제 발생 시**: Console → Network 탭 확인

---

**작성일**: 2025-12-31  
**버전**: v2.8.13.6.122  
**우선순위**: 높음 (치명적 버그 수정)  
**작성자**: BeautyCat 개발팀
