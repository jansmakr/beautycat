# 회원 데이터 수정 및 개선 v2.8.8.1.26

## 📅 작업 일자
2026-01-12

## 🎯 목적
신규 회원가입 및 기존 회원 데이터 관리 로직을 개선하여 데이터 정합성을 보장하고 중복 및 누락 문제를 해결

---

## ✅ 완료된 작업

### 1. 회원 데이터 검증 도구 생성
**파일**: `check-member-data.html`

#### 기능
- ✅ 전체 회원 및 샵 데이터 로드 및 통계 표시
- ✅ 5단계 자동 검증 시스템:
  1. `user_type` 필드 유효성 검증
  2. `shop_id` 연결 상태 검증
  3. 업체 회원의 샵 존재 여부 검증
  4. 사용자-샵 간 이메일 일치 검증
  5. 샵 필수 정보 (시/도, 구/군, 주소) 검증
- ✅ 발견된 이슈 자동 수정 기능
- ✅ 검증 보고서 JSON 다운로드
- ✅ 실시간 진행 상황 및 로그 표시

#### 검증 항목
| 검증 항목 | 심각도 | 자동 수정 |
|---------|--------|---------|
| user_type 누락 | ERROR | ✅ |
| user_type 잘못된 값 | ERROR | ✅ |
| shop_id 누락 (업체 회원) | ERROR | ✅ |
| skincare_shops에 샵 미존재 | ERROR | ✅ |
| 이메일 불일치 (사용자 ↔ 샵) | WARNING | ✅ |
| 필수 정보 누락 (시/도, 구/군, 주소) | WARNING | ❌ (수동) |

#### 사용 방법
```
https://beautycat.kr/check-member-data.html
```
1. "전체 검증 시작" 버튼 클릭
2. 이슈 확인 (자동 수정 가능 여부 표시)
3. "모든 이슈 자동 수정" 또는 개별 수정
4. "보고서 다운로드"로 결과 저장

---

### 2. 신규 회원가입 로직 개선
**파일**: `js/auth.js` (Line 854~914)

#### 문제점
- ❌ 동일 이메일로 여러 샵이 생성되는 중복 문제
- ❌ 기존 샵 정보가 있어도 새로 생성됨
- ❌ 사용자-샵 연결이 누락되는 경우 발생

#### 해결 방법
```javascript
// 🔍 기존 샵 존재 여부 확인 (이메일 기준)
const existingShopResponse = await fetch(
    `tables/skincare_shops?search=${encodeURIComponent(registerData.email)}&limit=10`
);
const existingShop = (existingShopsData.data || []).find(s => 
    !s.deleted && s.email && s.email.toLowerCase() === registerData.email.toLowerCase()
);

if (existingShop) {
    // ✅ 기존 샵 재사용
    // 1. 사용자에 shop_id 연결
    await fetch(`/tables/users/${newUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ shop_id: existingShop.id })
    });
    
    // 2. 기존 샵 정보 업데이트 (덮어쓰기 방지)
    await fetch(`tables/skincare_shops/${existingShop.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
            owner_name: registerData.name,
            phone: registerData.phone,
            business_number: registerData.business_number || existingShop.business_number,
            business_license: registerData.business_license || existingShop.business_license
        })
    });
} else {
    // ✅ 새 샵 생성 (기존 로직)
}
```

#### 개선 효과
- ✅ **중복 샵 생성 방지**: 동일 이메일로 여러 샵이 생성되지 않음
- ✅ **기존 데이터 보존**: 이미 등록된 샵 정보 유지
- ✅ **자동 연결**: 사용자-샵 간 shop_id 자동 연결
- ✅ **정보 업데이트**: 필요한 정보만 선택적 업데이트

---

### 3. 고객 → 업체 전환 기능 (기존 확인)
**파일**: `js/admin-dashboard.js` (Line 1857~1923)

#### 현재 로직
```javascript
// 🏪 customer → shop 변경 시 skincare_shops 레코드 생성
if (oldUserType !== 'shop' && userType === 'shop') {
    // 1. 기존 샵 확인 (이메일 기준)
    const existingShop = shopsData.data.find(s => 
        s.email && s.email.toLowerCase() === updatedUser.email.toLowerCase()
    );
    
    if (existingShop) {
        // ✅ 기존 샵 재사용
        // ⚠️ 시/도, 구/군 미등록 경고
    } else {
        // ✅ 새 샵 생성 (기본값 제공)
        const shopData = {
            name: name,
            owner_name: name,
            email: updatedUser.email,
            phone: phone || '정보 없음',
            state: '정보 미등록',
            district: '정보 미등록',
            address: '주소 미등록',
            business_number: '정보 없음',
            business_license: '정보 없음',
            status: 'pending'
        };
        // ⚠️ 필수 정보 입력 안내 알림
    }
}
```

#### 특징
- ✅ 기존 샵 재사용 (중복 방지)
- ✅ 필수 정보 미등록 알림 (UX 개선)
- ✅ 샵 입점 관리로 안내

---

## 📊 테스트 시나리오

### 시나리오 1: 신규 업체 회원가입
**입력**
- 이메일: newshop@example.com
- 이름: 뉴샵
- user_type: shop
- 사업자등록번호: 123-45-67890

**예상 결과**
1. ✅ users 테이블에 회원 생성
2. ✅ skincare_shops 테이블에 샵 생성
3. ✅ users.shop_id = skincare_shops.id 자동 연결

---

### 시나리오 2: 기존 이메일로 재가입 (샵 이미 존재)
**입력**
- 이메일: existingshop@example.com (이미 샵 존재)
- 이름: 기존샵
- user_type: shop

**예상 결과**
1. ✅ users 테이블에 회원 생성
2. ❌ skincare_shops에 새 샵 생성 안 함 (중복 방지)
3. ✅ users.shop_id = 기존 샵 ID 자동 연결
4. ✅ 기존 샵 정보 업데이트 (owner_name, phone 등)

---

### 시나리오 3: 고객 → 업체 전환 (관리자 대시보드)
**입력**
- 기존 고객 회원 (user_type: customer)
- 관리자가 user_type을 'shop'으로 변경

**예상 결과**
1. ✅ users.user_type = 'shop'으로 변경
2. ✅ 이메일로 기존 샵 검색
3. **Case A: 기존 샵 있음**
   - ✅ users.shop_id = 기존 샵 ID 연결
   - ⚠️ 시/도, 구/군 미등록 시 경고
4. **Case B: 기존 샵 없음**
   - ✅ 새 샵 생성 (기본값 제공)
   - ⚠️ 필수 정보 입력 안내

---

## 🔧 관리자 작업 가이드

### 1. 기존 회원 데이터 검증
```
1. https://beautycat.kr/check-member-data.html 접속
2. "전체 검증 시작" 클릭
3. 이슈 확인 및 자동 수정
4. 보고서 다운로드 (백업용)
```

### 2. 수동 수정이 필요한 경우
| 이슈 | 수정 방법 |
|------|---------|
| 필수 정보 누락 | 관리자 대시보드 > 샵 입점 관리 > 해당 샵 편집 |
| 이메일 불일치 | 검증 도구에서 자동 수정 가능 |
| shop_id 누락 | 검증 도구에서 자동 수정 가능 |

### 3. 정기 검증 권장
- 📅 **주기**: 매주 월요일
- 🔍 **방법**: check-member-data.html 실행
- 📊 **보고서**: JSON 파일 보관 (이력 관리)

---

## 🚨 주의사항

### 1. 자동 수정 전 백업 필수
```javascript
// 검증 도구는 자동으로 보고서를 생성하지만,
// 수동 백업도 권장
```

### 2. 삭제된 데이터는 복구 불가
```javascript
// Soft Delete 방식 사용
// deleted = true 플래그만 설정
// 실제 데이터는 유지됨
```

### 3. 이메일 변경 시 주의
```javascript
// 이메일 변경 시 사용자-샵 연결이 끊길 수 있음
// 이메일 변경 후 반드시 검증 도구 실행 권장
```

---

## 📝 다음 단계

### 우선순위: HIGH
- [ ] 기존 회원 데이터 전체 검증 실행
- [ ] 발견된 이슈 자동 수정
- [ ] 검증 보고서 보관

### 우선순위: MEDIUM
- [ ] 정기 검증 일정 수립 (매주 월요일)
- [ ] 관리자 매뉴얼 작성
- [ ] 업체 회원 온보딩 프로세스 개선

### 우선순위: LOW
- [ ] 이메일 변경 시 자동 검증 트리거 추가
- [ ] 검증 결과 이메일 알림 기능
- [ ] 대시보드에 데이터 품질 지표 추가

---

## 🔗 관련 문서
- [README.md](README.md) - 전체 프로젝트 개요
- [DATA_SAMPLING_GUIDE_1000.md](DATA_SAMPLING_GUIDE_1000.md) - 데이터 샘플링 가이드
- [HOTFIX_LIMIT_INCREASE_v2.8.8.1.21.md](HOTFIX_LIMIT_INCREASE_v2.8.8.1.21.md) - limit 증가 내역

---

## 📞 문의
이슈 발생 시: https://github.com/[your-repo]/issues

**작성자**: AI Assistant  
**최종 수정**: 2026-01-12
