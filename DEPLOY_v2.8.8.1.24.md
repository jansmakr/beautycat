# 🚀 배포 가이드 v2.8.8.1.24

## 📋 변경 사항 요약

### ✅ 수정 내용
1. **김포시 운양동 추가**: korea-town-data.js 업데이트
2. **캐시 버스팅**: v2.8.8.1.24로 버전 업그레이드
3. **해올토탈뷰티 지역 수정**: DB 데이터 업데이트 필요

### 📦 수정된 파일 (3개)
- `js/korea-town-data.js`: 김포시에 운양동 추가
- `admin-dashboard.html`: 캐시 버전 v2.8.8.1.24
- `README.md`: v2.8.8.1.24 업데이트
- `HOTFIX_GIMPO_UNYANG_v2.8.8.1.24.md`: 수정 내역 문서화

---

## 🎯 즉시 실행 가이드

### 1️⃣ GitHub 커밋 & 푸시 (1분)

**GitHub Desktop 사용**:
```
1. GitHub Desktop 열기

2. Changes 탭 확인 (4개 파일)
   - js/korea-town-data.js
   - admin-dashboard.html
   - README.md
   - HOTFIX_GIMPO_UNYANG_v2.8.8.1.24.md
   
3. 커밋 메시지 입력:
   제목: fix: 김포시 운양동 추가 및 해올토탈뷰티 지역 수정 v2.8.8.1.24
   
   설명:
   - korea-town-data.js: 김포시에 운양동 추가
   - 해올토탈뷰티 지역 정보: undefined → 경기도 김포시 운양동
   - 구/군 선택 드롭다운에 운양동 표시
   - 캐시 버전: v2.8.8.1.24
   
4. "Commit to main" 클릭
5. "Push origin" 클릭
```

---

### 2️⃣ Cloudflare 배포 대기 (3-5분)

**확인 방법**:
```
1. Cloudflare 대시보드 접속
   https://dash.cloudflare.com

2. Workers & Pages 선택

3. beautycat 프로젝트 클릭

4. Deployments 탭 선택

5. 최신 배포 확인
   - Status: Success ✅
   - Commit: "fix: 김포시 운양동 추가..."
```

---

### 3️⃣ Cloudflare 캐시 무효화 (30초)

**중요**: 배포 완료 후 반드시 실행!

```
1. Cloudflare 대시보드에서 beautycat.kr 도메인 선택

2. 좌측 메뉴 → Caching 클릭

3. 우측 상단 → "Purge Everything" 클릭

4. 확인 팝업 → "Purge Everything" 재확인

5. 성공 메시지 확인 ✅
```

---

### 4️⃣ 브라우저 강제 새로고침 (10초)

**모든 브라우저에서 실행**:
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

---

### 5️⃣ 해올토탈뷰티 DB 업데이트 (1분)

**브라우저 콘솔에서 실행**:

1. **https://beautycat.kr/admin-dashboard.html** 접속
2. 브라우저 콘솔(F12) 열기
3. 아래 스크립트 복사 & 붙여넣기 & 실행

```javascript
// ===== 해올토탈뷰티 지역 정보 수정 =====
(async function() {
    console.log('🔧 해올토탈뷰티 지역 정보 수정 시작...\n');
    
    const shopId = 'cf_1768135332734_s2a3j9tgg';
    
    // 1. 현재 데이터 확인
    console.log('📡 현재 데이터 조회 중...');
    const currentData = await getRecord('skincare_shops', shopId);
    
    console.log('📊 현재 데이터:');
    console.log('  - 이름:', currentData.shop_name || currentData.name);
    console.log('  - 지역:', currentData.region || currentData.state || 'undefined');
    console.log('  - 구/군:', currentData.district || 'undefined');
    console.log('  - 주소:', currentData.address || 'undefined');
    
    // 2. 수정할 데이터
    const updateData = {
        state: '경기도',
        region: '경기도',
        district: '김포시',
        city: '김포시',
        town: '운양동',
        address: currentData.address || '경기도 김포시 운양동'
    };
    
    console.log('\n✅ 수정할 데이터:');
    console.log('  - 지역:', updateData.region);
    console.log('  - 구/군:', updateData.district);
    console.log('  - 동:', updateData.town);
    console.log('  - 주소:', updateData.address);
    
    // 3. 데이터 업데이트
    console.log('\n📡 데이터 업데이트 중...');
    
    try {
        const result = await updateRecord('skincare_shops', shopId, updateData);
        
        console.log('\n🎉 업데이트 완료!');
        console.log('📊 업데이트된 데이터:');
        console.log('  - 이름:', result.shop_name || result.name);
        console.log('  - 지역:', result.region || result.state);
        console.log('  - 구/군:', result.district);
        console.log('  - 동:', result.town);
        console.log('  - 주소:', result.address);
        
        console.log('\n✅ 해올토탈뷰티 지역 정보 수정 완료!');
        console.log('🔄 페이지를 새로고침하여 확인하세요!');
    } catch (error) {
        console.error('❌ 업데이트 실패:', error);
        console.log('💡 관리자 권한을 확인하세요.');
    }
})();
```

---

## ✅ 검증 절차

### 1. 김포시 운양동 확인
```
1. https://beautycat.kr 접속

2. 상단 지역 선택
   - 시/도: 경기도 선택
   - 구/군: 김포시 선택

3. 확인 사항:
   ✅ 운양동이 목록에 표시됨
   ✅ 운양동 선택 가능
```

### 2. 해올토탈뷰티 지역 정보 확인
```
1. https://beautycat.kr/admin-dashboard.html 접속

2. 업체 관리 섹션으로 이동

3. 검색창에 "해올" 입력

4. 해올토탈뷰티 클릭 → 상세 정보 확인

5. 확인 사항:
   ✅ 주소: 경기도 김포시 (또는 김포시)
   ✅ 지역: undefined 없음
```

### 3. 콘솔 검증
```javascript
// 브라우저 콘솔에서 실행
(async function() {
    const shopId = 'cf_1768135332734_s2a3j9tgg';
    const shop = await getRecord('skincare_shops', shopId);
    
    console.log('📊 해올토탈뷰티 검증:');
    console.log('  - 이름:', shop.shop_name || shop.name);
    console.log('  - 지역:', shop.region || shop.state);
    console.log('  - 구/군:', shop.district);
    console.log('  - 동:', shop.town);
    console.log('  - 주소:', shop.address);
    
    const hasUndefined = !shop.region && !shop.state;
    console.log('\n결과:', hasUndefined ? '❌ 수정 필요' : '✅ 정상');
})();
```

---

## 🎉 예상 결과

### Before
```
지역 선택: 김포시 → 운양동 없음 ❌
해올토탈뷰티 지역: undefined > 김포시 ❌
```

### After (v2.8.8.1.24)
```
지역 선택: 김포시 → 운양동 표시 ✅
해올토탈뷰티 지역: 경기도 김포시 ✅
해올토탈뷰티 동: 운양동 ✅
```

---

## 🚨 문제 해결

### Q1: 운양동이 여전히 보이지 않습니다
**A**: 캐시를 완전히 삭제하세요
```
1. Cloudflare → Purge Everything 재실행
2. 브라우저 캐시 삭제
3. Ctrl + Shift + R
4. 5분 대기 후 재확인
```

### Q2: 해올토탈뷰티 지역이 여전히 undefined입니다
**A**: DB 업데이트 스크립트를 재실행하세요
```
1. admin-dashboard.html 접속
2. 브라우저 콘솔(F12) 열기
3. 위 스크립트 복사 & 실행
4. 성공 메시지 확인
5. 페이지 새로고침
```

### Q3: updateRecord 권한 오류
**A**: 관리자 권한을 확인하세요
```
콘솔에서 확인:
console.log('관리자:', currentUser);

관리자가 아니면:
1. 로그아웃
2. admin@beautycat.kr로 로그인
3. 스크립트 재실행
```

---

## 📝 체크리스트

배포 전:
- [ ] GitHub Desktop에서 4개 파일 확인
- [ ] 커밋 메시지 입력
- [ ] Push origin 완료

배포 중:
- [ ] Cloudflare 배포 성공 확인
- [ ] Purge Everything 실행
- [ ] 5분 대기

배포 후:
- [ ] 브라우저 강제 새로고침
- [ ] 김포시 운양동 확인
- [ ] 해올토탈뷰티 DB 업데이트
- [ ] 지역 정보 확인

---

## 🎯 관련 문서
- **수정 내역**: HOTFIX_GIMPO_UNYANG_v2.8.8.1.24.md
- **이전 버전**: v2.8.8.1.23 (캐시 버스팅)

---

**작성일**: 2026-01-12  
**버전**: v2.8.8.1.24  
**소요 시간**: 약 10분
