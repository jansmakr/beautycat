# 🚀 빠른 배포 가이드 v2.8.13.6.158

## 📋 변경 사항
- ✅ 고객 대시보드 회원 탈퇴 기능 추가

---

## 🎯 1단계: Git Commit & Push

```bash
cd /d D:\beautycat

git add customer-dashboard.html FEATURE_USER_ACCOUNT_DELETION_v2.8.13.6.158.md QUICK_PUSH_v2.8.13.6.158.md

git commit -m "feat: v2.8.13.6.158 - 고객 회원 탈퇴 기능 추가

- 프로필 관리 섹션에 회원 탈퇴 UI 추가
- 2단계 확인 프로세스 (텍스트 입력 + 최종 확인)
- 사용자 관련 모든 데이터 Soft Delete
- 로컬 스토리지 완전 초기화
- 탈퇴 후 메인 페이지 자동 이동"

git push origin main
```

---

## 🎯 2단계: Cloudflare 배포 확인

### 1. Cloudflare Dashboard 접속
```
URL: https://dash.cloudflare.com
Project: beautycat-v2
```

### 2. Deployments 탭 확인
- ✅ 커밋 메시지: `feat: v2.8.13.6.158 - 고객 회원 탈퇴 기능 추가`
- ✅ 상태: `Success`
- ⏱️ 예상 시간: 2-3분

### 3. 캐시 삭제
```
Cloudflare Dashboard 
→ beautycat.kr 
→ Caching 
→ Configuration 
→ Purge Everything
```

---

## 🎯 3단계: 브라우저 테스트

### URL
```
https://beautycat.kr/customer-dashboard.html
```

### 테스트 절차

#### 1. 고객 계정 로그인
```
이메일: customer@example.com
비밀번호: test123
```

#### 2. 프로필 관리 섹션 이동
- 좌측 사이드바 → "프로필 관리" 클릭

#### 3. 회원 탈퇴 섹션 확인
- ✅ 빨간색 테두리 카드 표시
- ✅ "회원 탈퇴" 제목 표시
- ✅ 삭제되는 정보 목록 표시
- ✅ "회원 탈퇴하기" 버튼 표시

#### 4. 탈퇴 모달 테스트
1. "회원 탈퇴하기" 버튼 클릭
2. 모달 정상 오픈 확인
3. "탈퇴합니다" 입력
4. "탈퇴하기" 버튼 클릭
5. 최종 확인 다이얼로그 표시 확인
6. "취소" 클릭 → 모달 닫힘 확인

#### 5. 콘솔 확인 (F12)
```javascript
// 버전 확인
console.log(document.querySelector('script[src*="customer-dashboard"]').src);
// 예상 결과: "...customer-dashboard.js?v=2.8.13.6.158"

// 탈퇴 함수 존재 확인
console.log(typeof openDeleteAccountModal);
// 예상 결과: "function"

console.log(typeof confirmDeleteAccount);
// 예상 결과: "function"
```

---

## ✅ 체크리스트

### Git & Deployment
- [ ] Git commit 완료
- [ ] Git push 완료
- [ ] Cloudflare 배포 `Success` 확인
- [ ] 캐시 삭제 완료

### 기능 테스트
- [ ] 프로필 관리 섹션에서 회원 탈퇴 UI 표시
- [ ] "회원 탈퇴하기" 버튼 클릭 → 모달 오픈
- [ ] "탈퇴합니다" 입력 후 탈퇴 버튼 클릭 가능
- [ ] 최종 확인 다이얼로그 표시
- [ ] 취소 버튼 정상 작동
- [ ] JS 버전 `v2.8.13.6.158` 확인

### UI/UX
- [ ] 빨간색 경고 테두리 표시
- [ ] 삭제되는 정보 목록 표시
- [ ] 모달 디자인 일관성 확인
- [ ] 모바일 반응형 확인

---

## ⚠️ 주의사항

### 1. 실제 탈퇴 테스트 주의
- 테스트 계정으로만 실제 탈퇴 테스트 진행
- 실제 고객 계정으로 테스트하지 말 것
- Soft Delete이므로 관리자가 복구 가능

### 2. 데이터 백업
- 중요한 고객 데이터는 사전에 백업
- DB 스냅샷 생성 권장

### 3. 롤백 준비
- 문제 발생 시 이전 버전으로 롤백 가능하도록 준비
- Cloudflare Deployments에서 이전 배포 선택 가능

---

## 🆘 문제 해결

### 모달이 열리지 않는 경우
```javascript
// 콘솔에서 확인
console.log(document.getElementById('delete-account-modal'));
// null이 아닌 요소 객체가 표시되어야 함
```

### 탈퇴 버튼이 작동하지 않는 경우
```javascript
// 콘솔에서 확인
console.log(typeof confirmDeleteAccount);
// "function"이 표시되어야 함
```

### 버전이 업데이트되지 않은 경우
1. Ctrl + Shift + R (강력 새로고침)
2. 브라우저 캐시 완전 삭제
3. 시크릿 모드에서 테스트

---

## 📞 지원

문제 발생 시:
- `FEATURE_USER_ACCOUNT_DELETION_v2.8.13.6.158.md` 참고
- 콘솔 로그 확인
- 관리자에게 문의

---

**예상 소요 시간**: 10-15분
**난이도**: ⭐⭐☆☆☆ (중하)

**작성일**: 2026-01-07
**버전**: v2.8.13.6.158
