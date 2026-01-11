# 🔍 해올토탈뷰티 검색 실패 원인 최종 분석

**날짜**: 2026-01-11  
**분석 대상**: limit 변경 후 검색 실패 원인

---

## 📊 **타임라인 분석**

### ✅ v2.8.8.1.16 (성공!)
**상태**: "해올토탈뷰티" 4~5개 검색됨  
**limit**: `10000` (전체 9999개 조회)  
**검색 로직**: 정상 작동

```javascript
// v2.8.8.1.16 코드
const apiUrl = 'tables/skincare_shops?limit=10000&sort=-created_at';
```

### ❌ v2.8.8.1.17 (실패!)
**상태**: "해올" 검색 시 0개  
**limit**: `5000` (최근 5000개만 조회)  
**검색 로직**: 정상

```javascript
// v2.8.8.1.17 코드 (503 에러 방지 목적)
const apiUrl = 'tables/skincare_shops?limit=5000&sort=-created_at';  // 503 에러 방지
```

### ✅ v2.8.8.1.18 (수정!)
**상태**: limit 10000으로 복원  
**추가**: 시/구/군 필터

```javascript
// v2.8.8.1.18 코드
const apiUrl = 'tables/skincare_shops?limit=10000&sort=-created_at';  // 전체 데이터 로드
```

---

## 🎯 **핵심 원인**

### 문제: limit=5000
```
전체 데이터: 9,999개
sort: -created_at (최신순 정렬)
limit=5000: 최근 5,000개만 조회

해올토탈뷰티 5개 위치:
1️⃣ ID: cf_1768091748044_ncgq6sdq7 (2026-01-11 09:35:48) ← 최신! ✅
2️⃣ ID: ...suw23s7t (2026-01-10 14:55:26) ✅
3️⃣ ID: ...8htez9ei (2026-01-10 14:51:58) ✅
4️⃣ ID: ...2sfyqhzy (2026-01-10 14:44:04) ✅
5️⃣ ID: ...vguco5qp (2026-01-10 12:14:27) ✅

→ 모두 최신 5000개 안에 있어야 함!
```

---

## 🔍 **브라우저 콘솔 테스트 (현재 상태 확인)**

### 테스트 1: limit=5000으로 조회
```javascript
fetch('tables/skincare_shops?limit=5000&sort=-created_at')
  .then(r => r.json())
  .then(data => {
    console.log('📊 조회된 데이터:', data.data.length + '개');
    
    // 첫 번째와 마지막 데이터 확인
    const first = data.data[0];
    const last = data.data[data.data.length - 1];
    
    console.log('🔹 첫 번째:', first.name, '|', new Date(first.created_at).toLocaleString('ko-KR'));
    console.log('🔹 마지막:', last.name, '|', new Date(last.created_at).toLocaleString('ko-KR'));
    
    // 해올 검색
    const haeolShops = data.data.filter(shop => 
      !shop.deleted && 
      (shop.name || '').includes('해올')
    );
    console.log('✅ 해올 검색 결과:', haeolShops.length + '개');
    haeolShops.forEach((shop, i) => {
      console.log(`${i+1}️⃣ ${shop.name} | ${new Date(shop.created_at).toLocaleString('ko-KR')}`);
    });
  });
```

### 테스트 2: limit=10000으로 조회
```javascript
fetch('tables/skincare_shops?limit=10000&sort=-created_at')
  .then(r => r.json())
  .then(data => {
    console.log('📊 조회된 데이터:', data.data.length + '개');
    
    // 해올 검색
    const haeolShops = data.data.filter(shop => 
      !shop.deleted && 
      (shop.name || '').includes('해올')
    );
    console.log('✅ 해올 검색 결과:', haeolShops.length + '개');
    haeolShops.forEach((shop, i) => {
      console.log(`${i+1}️⃣ ${shop.name} | ${new Date(shop.created_at).toLocaleString('ko-KR')}`);
    });
  });
```

### 테스트 3: 해올토탈뷰티 등록일 확인
```javascript
fetch('tables/skincare_shops?limit=10000&sort=-created_at')
  .then(r => r.json())
  .then(data => {
    const haeolShops = data.data.filter(shop => 
      !shop.deleted && 
      (shop.name || '').includes('해올')
    );
    
    console.log('📅 해올토탈뷰티 등록일:');
    haeolShops.forEach((shop, i) => {
      const createdDate = new Date(shop.created_at);
      const index = data.data.findIndex(s => s.id === shop.id);
      console.log(`${i+1}️⃣ ${shop.name}`);
      console.log(`   등록일: ${createdDate.toLocaleString('ko-KR')}`);
      console.log(`   전체 순위: ${index + 1}번째 / ${data.data.length}개`);
      console.log(`   limit=5000 범위: ${index < 5000 ? '✅ 포함' : '❌ 제외'}`);
    });
  });
```

---

## 📊 **예상 결과**

### 시나리오 A: 해올토탈뷰티가 5000개 안에 있음
```
✅ limit=5000: 5개
✅ limit=10000: 5개
→ 결론: v2.8.8.1.17의 limit=5000 코드 문제가 아님
→ 실제 원인: 다른 곳 (캐시? 필터링 로직?)
```

### 시나리오 B: 해올토탈뷰티가 5000개 밖에 있음
```
❌ limit=5000: 0~4개
✅ limit=10000: 5개
→ 결론: limit=5000이 원인!
→ 해결: limit=10000 유지 ✅
```

---

## 🔧 **현재 코드 상태 확인**

### js/admin-dashboard.js (Line 935)
```javascript
// 현재 v2.8.8.1.18
const apiUrl = 'tables/skincare_shops?limit=10000&sort=-created_at';  // 전체 데이터 로드
```

**✅ 올바름!**

---

## 🚀 **다음 단계**

### 1️⃣ **브라우저 콘솔에서 위 테스트 실행**
- 현재 배포된 사이트에서 테스트
- limit=5000과 limit=10000 비교
- 결과를 공유해주세요!

### 2️⃣ **배포 (이미 수정 완료)**
```bash
cd /d D:\beautycat
git add js/admin-dashboard.js admin-dashboard.html
git commit -m "fix: limit 10000 유지 + 시/구/군 필터 v2.8.8.1.18"
git push origin main
```

### 3️⃣ **Cloudflare Purge + 강제 새로고침**
- Cloudflare: Purge Everything
- 브라우저: Ctrl+Shift+R

---

## 💡 **최종 결론 (가설)**

### 가설 1: 데이터 위치 문제
```
해올토탈뷰티 5개가 5001~10000번째 사이에 있음
→ limit=5000으로는 조회 불가
→ limit=10000으로 해결 ✅
```

### 가설 2: 캐시 문제
```
v2.8.8.1.17의 limit=5000 코드가 캐시됨
→ 코드 수정했지만 브라우저가 구버전 사용
→ 강제 새로고침으로 해결 ✅
```

### 가설 3: API 응답 문제
```
limit=5000 요청 시 서버가 다른 데이터 반환
→ 503 에러는 아니지만 데이터 누락
→ limit=10000으로 해결 ✅
```

---

## 🧪 **검증 방법**

**위 테스트 3개를 브라우저 콘솔에서 실행한 후 결과를 공유해주세요!**

그러면 정확한 원인을 파악할 수 있습니다! 🎯

---

**작성자**: AI Agent  
**날짜**: 2026-01-11
