# 🚀 v2.8.13.6.132 - 데이터 통합 마이그레이션

**날짜**: 2026-01-03  
**목적**: public_skincare_data 삭제 + skincare_shops 통합 (6만개 데이터)

---

## 📋 **작업 개요**

### **목표**
- ❌ `public_skincare_data` 테이블 완전 삭제 (102,902개)
- ✅ 로컬 6만개 데이터를 `skincare_shops` 테이블에 직접 업로드
- ✅ 기존 등록 샵 20개와 자동 통합
- ✅ 연결된 모든 코드 정리

### **결과**
```
skincare_shops 테이블
├─ 기존 등록 샵: 20개 (data_source: 'registered')
└─ 신규 공공 데이터: 60,000개 (data_source: 'csv_upload')
───────────────────────────────────────────────
총합: 60,020개
```

---

## ✅ **완료된 작업**

### **1. CSV 업로드 코드 수정** ✅

#### **변경 사항:**
- ✅ `public_skincare_data` → `skincare_shops` 테이블로 변경
- ✅ 유연한 헤더 지원 (필수 필드만 체크)
- ✅ 데이터 자동 정제 함수 추가

#### **지원하는 CSV 형식:**

**기존 형식:**
```csv
business_name,address,phone,region,district,town,status
```

**로컬 형식 (자동 변환):**
```csv
business_name,address,phone_region,district,town,open_d_status
```

#### **자동 변환 로직:**

| 입력 | 변환 | 결과 |
|------|------|------|
| `phone_region: "미등록"` | → | `phone: ""` (빈 값) |
| `district: "전라남1여수시"` | → | `region: "전남"`, `district: "여수시"` |
| `open_d_status: "active"` | → | `status: "영업중"` |

---

### **2. CSV 템플릿 업데이트** ✅

**파일**: `shop-upload-template.csv`

```csv
business_name,address,phone_region,district,town,open_d_status
뷰티샵 예시,서울특별시 강남구 역삼동 123-45,02-1234-5678,서울1강남구,역삼동,active
피부관리실 샘플,경기도 성남시 분당구 정자동 567-89,031-9876-5432,경기1성남시,정자동,active
헬로스킨케어,전라남도 여수시 여서동 8,미등록,전라남1여수시,여서동,active
```

---

## 🚀 **실행 단계**

### **STEP 1: 기존 public_skincare_data 삭제** (5분)

#### **방법 A: Console 스크립트 (권장)**

1. https://beautycat.kr/admin-dashboard.html 접속
2. F12 > Console 열기
3. 아래 코드 실행:

```javascript
// 🗑️ public_skincare_data 완전 삭제
async function deleteAllPublicData() {
    console.log('🗑️ 공공 데이터 삭제 시작...');
    
    let page = 1;
    let totalDeleted = 0;
    
    while (true) {
        const response = await fetch(`tables/public_skincare_data?page=${page}&limit=1000`);
        const result = await response.json();
        
        if (!result.data || result.data.length === 0) break;
        
        // 배치 삭제 (10개씩)
        for (let i = 0; i < result.data.length; i += 10) {
            const batch = result.data.slice(i, i + 10);
            await Promise.all(batch.map(item => 
                fetch(`tables/public_skincare_data/${item.id}`, { method: 'DELETE' })
            ));
            totalDeleted += batch.length;
            console.log(`✅ 삭제 완료: ${totalDeleted}개`);
        }
        page++;
    }
    
    console.log(`🎉 총 ${totalDeleted}개 삭제 완료!`);
    alert('✅ 공공 데이터 삭제 완료!');
}

// 실행
deleteAllPublicData();
```

**예상 시간**: 10-15분

---

### **STEP 2: 로컬 6만개 CSV 업로드** (30분)

#### **방법: 관리자 대시보드 CSV 업로드**

1. https://beautycat.kr/admin-dashboard.html 접속
2. 좌측 메뉴 **"🏪 샵 관리"** 클릭
3. 상단 **"CSV 업로드"** 버튼 클릭
4. 3개 파일 순차적으로 업로드:
   - 파일 1 업로드 → 완료 대기
   - 파일 2 업로드 → 완료 대기
   - 파일 3 업로드 → 완료 대기

#### **업로드 진행 상황:**

```
📤 파일명.csv 업로드 시작...
📋 CSV 헤더: business_name, address, phone_region, district, town, open_d_status
✅ 필수 필드 확인 완료
✅ 파싱된 샵 수: 20,000개
업로드 중... (100/20,000)
업로드 중... (200/20,000)
...
✅ 업로드 완료! 성공: 19,987개, 실패: 13개
```

#### **자동 처리 내용:**

✅ **phone_region: "미등록"** → `phone: ""` (빈 값)  
✅ **district: "전라남1여수시"** → `region: "전남"`, `district: "여수시"`  
✅ **open_d_status: "active"** → `status: "영업중"`  
✅ **data_source**: 자동으로 `"csv_upload"` 설정  
✅ **email**: 빈 값 (공공 데이터)  
✅ **verified**: `false`

---

### **STEP 3: 업로드 확인** (5분)

#### **확인 방법:**

1. 샵 관리 화면에서 **총 샵 수 확인**
   - 기대값: 60,020개 (기존 20 + 신규 60,000)

2. **필터 테스트:**
   - "전체 샵" → 60,020개
   - "📝 신규등록만" → 기존 20개
   - "샵 타입" 필터 없음 (csv_upload는 필터 없음)

3. **Console 확인:**
   ```
   🏪 업체 목록 로딩 시작...
   ✅ 업체 목록 로드 완료: 60020개
   ```

---

## 🔧 **다음 단계: 코드 정리**

### **제거 필요 파일/코드:**

#### **1. 파일 삭제**
- ❌ `js/public-data-manager.js` (전체 삭제)

#### **2. admin-dashboard.html 수정**
- ❌ Line 104: "📍 공공 데이터" 메뉴 제거
- ❌ Line 484-540: Public Data Section 제거
- ❌ Line 383: "📍 공공데이터만" 옵션 제거

#### **3. js/admin-dashboard.js 수정**
- ❌ Line 13-174: `autoMatchPublicData()` 함수 제거
- ❌ Line 1803-1820: 자동 매칭 호출 제거

#### **4. region.html 수정**
- ❌ Line 324, 388: `public_skincare_data` → `skincare_shops` 변경

#### **5. shop-detail.html 수정**
- ❌ Line 243-250: `public_skincare_data` 조회 제거

---

## 📊 **수정된 파일 목록**

### **v2.8.13.6.132 변경 사항:**

| 파일 | 상태 | 설명 |
|------|------|------|
| `js/admin-dashboard.js` | ✅ 수정 | CSV 업로드 skincare_shops로 변경 |
| `shop-upload-template.csv` | ✅ 수정 | 로컬 형식 지원 |
| `DATA_MIGRATION_v2.8.13.6.132.md` | ✅ 신규 | 마이그레이션 가이드 |

---

## 🎯 **배포 준비**

### **즉시 배포 명령:**

```bash
git add js/admin-dashboard.js shop-upload-template.csv DATA_MIGRATION_v2.8.13.6.132.md
git commit -m "✨ v2.8.13.6.132 - CSV 업로드 skincare_shops 통합

- CSV 업로드를 skincare_shops 테이블로 변경
- 로컬 CSV 형식 자동 변환 지원 (phone_region, district 파싱)
- 데이터 자동 정제 (미등록→빈값, active→영업중)
- CSV 템플릿 업데이트

이제 6만개 데이터를 바로 업로드 가능합니다!"
git push origin main
```

---

## ✅ **체크리스트**

### **배포 전:**
- [x] CSV 업로드 코드 수정
- [x] CSV 템플릿 업데이트
- [ ] 코드 배포
- [ ] Cloudflare Pages 배포 확인

### **배포 후:**
- [ ] STEP 1: public_skincare_data 삭제 (10-15분)
- [ ] STEP 2: 로컬 6만개 업로드 (30분)
- [ ] STEP 3: 업로드 확인
- [ ] 샵 관리에서 60,020개 확인

### **코드 정리:**
- [ ] js/public-data-manager.js 삭제
- [ ] admin-dashboard.html 수정
- [ ] js/admin-dashboard.js 수정
- [ ] region.html 수정
- [ ] shop-detail.html 수정
- [ ] README.md 업데이트

---

## 🚨 **주의사항**

### **1. 백업**
- ❌ public_skincare_data 삭제는 **복구 불가**
- ✅ 필요시 삭제 전 데이터 백업

### **2. 업로드 중 주의**
- ⏳ 3개 파일 순차 업로드 (동시 업로드 금지)
- ⏳ 각 파일 완료 후 다음 파일 업로드
- ⏳ 브라우저 탭 닫지 말 것

### **3. 에러 발생 시**
- Console에서 오류 확인
- 실패한 행은 로그에 표시됨
- 재업로드 가능 (중복 체크 없음)

---

## 📞 **문제 발생 시**

### **Console 로그 확인:**
```javascript
// 업로드된 샵 수 확인
fetch('tables/skincare_shops?limit=1').then(r => r.json()).then(d => 
    console.log('총 샵 수:', d.total)
);

// data_source별 집계
fetch('tables/skincare_shops?limit=50000').then(r => r.json()).then(d => {
    const sources = {};
    d.data.forEach(shop => {
        sources[shop.data_source] = (sources[shop.data_source] || 0) + 1;
    });
    console.log('출처별 샵 수:', sources);
});
```

---

## 🎉 **완료 후 기대 결과**

```
✅ skincare_shops 테이블: 60,020개
   ├─ registered: 20개 (기존 등록 샵)
   └─ csv_upload: 60,000개 (신규 공공 데이터)

❌ public_skincare_data 테이블: 0개 (완전 삭제)

✅ 샵 관리 화면: 60,020개 표시
✅ 지역별 검색: 정상 작동
✅ 샵 상세 페이지: 정상 작동
```

---

**준비 완료! 지금 바로 배포하고 업로드를 시작하세요!** 🚀
