# 🔧 Hotfix v2.8.12.4 - 긴급 예약 필드 추가

## 📋 **변경 사항**

### **문제**
```
❌ "오늘/내일 긴급 예약 희망" 체크박스 데이터 수집 안됨
❌ "현재 피부 상태" 필드가 additional_notes에만 병합되어 별도 확인 어려움
❌ "추가 요청사항" 필드가 additional_notes에만 병합되어 별도 확인 어려움
```

---

## 🔍 **현재 상태**

### **HTML 폼 필드 (존재함)**
```html
<!-- 피부 상태 (Line 2595) -->
<textarea id="skinCondition" name="skinCondition">
  현재 피부 상태를 알려주세요 (선택)
</textarea>

<!-- 추가 요청사항 (Line 2605) -->
<textarea id="importantFactors" name="importantFactors">
  추가 요청사항 (선택)
</textarea>

<!-- 긴급 예약 (Line 2611) -->
<input type="checkbox" id="urgentReservation" name="urgentReservation">
  오늘/내일 긴급 예약 희망
</input>
```

---

## 🛠️ **해결 방법**

### **1. `additionalInfo` 객체에 `urgent_reservation` 추가**

**Before (Line 4263-4274)**:
```javascript
const additionalInfo = {
  budget: ...,
  skin_condition: ...,
  notes: ...,
  // ❌ urgent_reservation 누락
};
```

**After**:
```javascript
const additionalInfo = {
  budget: document.getElementById('budget') ? document.getElementById('budget').value : '',
  skin_condition: document.getElementById('skinCondition') ? document.getElementById('skinCondition').value : '',
  notes: document.getElementById('importantFactors') ? document.getElementById('importantFactors').value : '',
  age_range: document.getElementById('ageRange') ? document.getElementById('ageRange').value : '',
  budget_range: document.getElementById('budgetRange') ? document.getElementById('budgetRange').value : '',
  preferred_schedule: document.getElementById('preferredSchedule') ? document.getElementById('preferredSchedule').value : '',
  urgent_reservation: document.getElementById('urgentReservation') ? document.getElementById('urgentReservation').checked : false, // ✅ 추가
  customer_type: isLoggedIn ? 'member' : 'guest',
  customer_email: isLoggedIn ? currentUser.email : null,
  state: document.getElementById('customerState').value,
  district: document.getElementById('customerDistrict').value
};
```

### **2. `additional_notes` 필드에 긴급 예약 정보 포함**

**Before (Line 4289)**:
```javascript
additional_notes: additionalInfo.notes || additionalInfo.skin_condition || '',
```

**After**:
```javascript
additional_notes: [
  additionalInfo.notes,
  additionalInfo.skin_condition,
  additionalInfo.urgent_reservation ? '⚡ 긴급 예약 희망 (오늘/내일)' : ''
].filter(Boolean).join('\n'),
```

---

## 📊 **효과**

### **수집 데이터 (Before)**
```javascript
{
  additional_notes: "가성비 좋은 곳건조하고 민감해요"
  // ❌ 긴급 예약 정보 없음
}
```

### **수집 데이터 (After)**
```javascript
{
  additional_notes: "가성비 좋은 곳\n건조하고 민감해요\n⚡ 긴급 예약 희망 (오늘/내일)"
  // ✅ 긴급 예약 정보 포함
  // ✅ 줄바꿈(\n)으로 구분되어 가독성 향상
}
```

---

## 🎯 **Shop Dashboard 표시 예시**

### **Before**
```
📋 추가 요청사항:
가성비 좋은 곳건조하고 민감해요
```

### **After**
```
📋 추가 요청사항:
가성비 좋은 곳
건조하고 민감해요
⚡ 긴급 예약 희망 (오늘/내일)
```

---

## ✅ **검증 절차**

### **테스트 케이스**

**입력**:
1. 추가 요청사항: `가성비 좋은 곳`
2. 피부 상태: `건조하고 민감해요`
3. ✅ 긴급 예약 희망 체크

**예상 결과**:
```javascript
{
  additional_notes: "가성비 좋은 곳\n건조하고 민감해요\n⚡ 긴급 예약 희망 (오늘/내일)"
}
```

---

## 📝 **주요 변경 사항 요약**

| 파일 | 변경 내용 | 라인 |
|------|-----------|------|
| `index.html` | `urgent_reservation` 필드 추가 | 4269 |
| `index.html` | `additional_notes` 병합 로직 개선 | 4289-4293 |

---

## 🔗 **관련 문서**

- [HOTFIX_v2.8.12.2_CONSULTATION_FORM_FIX.md](HOTFIX_v2.8.12.2_CONSULTATION_FORM_FIX.md)
- [HOTFIX_v2.8.12.3_IMAGE_RESIZE_FIX.md](HOTFIX_v2.8.12.3_IMAGE_RESIZE_FIX.md)
- [PROJECT_COMPLETION_v2.8.12.3.md](PROJECT_COMPLETION_v2.8.12.3.md)

---

**날짜**: 2025-12-15  
**버전**: v2.8.12.4  
**작성자**: BeautyCat Development Team
