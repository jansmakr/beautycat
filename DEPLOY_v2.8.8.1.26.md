# 배포 가이드 v2.8.8.1.26

## 📦 배포할 파일

### 신규 파일
- `check-member-data.html` - 회원 데이터 검증 도구
- `MEMBER_DATA_FIX_v2.8.8.1.26.md` - 회원 데이터 수정 문서

### 수정 파일
- `js/auth.js` - 신규 가입 시 중복 샵 방지 로직 추가
- `README.md` - v2.8.8.1.26 버전 정보 추가

---

## 🚀 배포 절차

### 1. GitHub 커밋 & 푸시
```bash
# 1-1. GitHub Desktop에서 변경사항 확인
# Changes 탭에 4개 파일 확인:
#   - check-member-data.html (NEW)
#   - MEMBER_DATA_FIX_v2.8.8.1.26.md (NEW)
#   - js/auth.js (MODIFIED)
#   - README.md (MODIFIED)

# 1-2. 커밋 메시지 작성
feat: 회원 데이터 검증 및 신규 가입 로직 개선 v2.8.8.1.26

- 회원 데이터 검증 도구 추가 (check-member-data.html)
  - 5단계 자동 검증: user_type, shop_id, 샵 존재, 이메일, 필수정보
  - 자동 수정 기능: user_type, shop_id, 이메일 불일치
  - 검증 보고서 JSON 다운로드
- 신규 가입 로직 개선 (js/auth.js)
  - 중복 샵 생성 방지 (이메일 기반)
  - 기존 샵 재사용 및 자동 연결
  - 정보 업데이트 (덮어쓰기 방지)
- 문서화: MEMBER_DATA_FIX_v2.8.8.1.26.md
- README 업데이트: v2.8.8.1.26

우선순위: HIGH - 데이터 정합성 보장

# 1-3. Commit to main 클릭
# 1-4. Push origin 클릭
```

### 2. Cloudflare 배포 확인
```
1. Cloudflare 대시보드 접속
   URL: https://dash.cloudflare.com/

2. Workers & Pages → beautycat 선택

3. Deployments 탭 확인
   - 최신 배포 상태: Success
   - 배포 시간: ~5분 소요

4. 배포 URL 확인
   Production: https://beautycat.kr
```

### 3. Cloudflare 캐시 무효화
```
1. Cloudflare 대시보드 → Caching 탭

2. "Purge Everything" 클릭

3. 확인 대화상자에서 "Purge Everything" 클릭

4. 완료 메시지 확인: "Success! Cache cleared successfully."
```

### 4. 브라우저 캐시 초기화
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

---

## ✅ 배포 확인 체크리스트

### 1. 회원 데이터 검증 도구 접근
```
URL: https://beautycat.kr/check-member-data.html

✅ 페이지 로드 확인
✅ "전체 검증 시작" 버튼 동작 확인
✅ 통계 표시 확인
✅ 로그 영역 표시 확인
```

### 2. 신규 가입 로직 검증
```
테스트 시나리오 1: 신규 업체 가입
1. 회원가입 페이지 접속
2. user_type: shop 선택
3. 신규 이메일 입력
4. 회원가입 완료
5. 확인: users와 skincare_shops 모두 생성

테스트 시나리오 2: 기존 이메일 재가입
1. 회원가입 페이지 접속
2. user_type: shop 선택
3. 기존 샵 이메일 입력 (예: taerang0428@naver.com)
4. 회원가입 완료
5. 확인: 
   - users만 생성
   - skincare_shops는 기존 것 재사용
   - users.shop_id = 기존 샵 ID
```

### 3. 관리자 대시보드 검증
```
URL: https://beautycat.kr/admin-dashboard.html

✅ 로그인 후 대시보드 로드 확인
✅ 업체 목록 표시 확인 (74개 → 1,161개)
✅ 고객 → 업체 전환 기능 동작 확인
```

---

## 🔍 즉시 실행할 검증

### 배포 후 바로 실행
```
1. https://beautycat.kr/check-member-data.html 접속

2. "전체 검증 시작" 버튼 클릭

3. 검증 결과 확인:
   - 전체 회원: 32명 (예상)
   - 업체 회원: ?명
   - 전체 샵: 1,161개
   - 발견된 이슈: ?개

4. 이슈 확인 후:
   - 자동 수정 가능: "모든 이슈 자동 수정" 클릭
   - 수동 수정 필요: 관리자 대시보드에서 수정

5. "보고서 다운로드" 클릭하여 백업
```

---

## 📊 예상 결과

### Before (v2.8.8.1.22)
- 전체 데이터: 59,264개
- 활성 데이터: 1,161개
- 샘플링 완료: ✅
- 해올토탈뷰티: 1개 (김포점)

### After (v2.8.8.1.26)
- 회원 데이터 검증: ✅ 자동화
- 중복 샵 방지: ✅ 로직 적용
- 기존 샵 재사용: ✅ 자동 연결
- 데이터 정합성: ✅ 보장

---

## 🚨 트러블슈팅

### 문제 1: check-member-data.html 404 에러
**원인**: 파일 미배포 또는 Cloudflare 캐시
**해결**: 
1. GitHub에 파일 존재 확인
2. Cloudflare 캐시 무효화
3. 브라우저 강제 새로고침

### 문제 2: 검증 도구에서 데이터 로드 안 됨
**원인**: API 엔드포인트 오류
**해결**:
1. 브라우저 콘솔(F12) 확인
2. 네트워크 탭에서 API 요청 확인
3. 403/401 에러 → 로그인 확인
4. 500 에러 → API 서버 상태 확인

### 문제 3: 신규 가입 시 여전히 중복 샵 생성
**원인**: js/auth.js 미배포 또는 캐시
**해결**:
1. Cloudflare 배포 완료 확인
2. 캐시 무효화
3. 브라우저 강제 새로고침
4. 콘솔에서 "🔍 기존 샵 존재 여부 확인 중..." 로그 확인

---

## 📝 배포 후 작업

### 즉시 (배포 후 10분 이내)
- [ ] 회원 데이터 검증 실행
- [ ] 이슈 자동 수정
- [ ] 검증 보고서 다운로드

### 24시간 이내
- [ ] 신규 가입 테스트 (실제 이메일)
- [ ] 고객 → 업체 전환 테스트
- [ ] 관리자 대시보드 동작 확인

### 1주일 이내
- [ ] 정기 검증 일정 수립
- [ ] 업체 회원 온보딩 프로세스 개선
- [ ] 관리자 매뉴얼 작성

---

## 🎯 성공 기준

- ✅ check-member-data.html 정상 접근
- ✅ 검증 도구 5단계 검증 성공
- ✅ 발견된 이슈 자동 수정 완료
- ✅ 신규 가입 시 중복 샵 생성 안 함
- ✅ 기존 샵 자동 연결 성공
- ✅ README v2.8.8.1.26 표시

---

## 📞 지원

이슈 발생 시:
1. 브라우저 콘솔(F12) 스크린샷
2. 네트워크 탭 API 요청/응답
3. 재현 단계 상세 기록

**배포 완료 시간**: 약 15분 소요 예상  
**총 작업 시간**: 약 2시간 (코딩 + 테스트 + 문서화)

---

**작성일**: 2026-01-12  
**작성자**: AI Assistant  
**버전**: v2.8.8.1.26
