# 🚀 빠른 배포 가이드 - v2.8.13.6.163.3

## 📦 수정된 파일
```
js/admin-dashboard.js
```

## 💻 배포 명령어 (Windows CMD)

### 한 줄 명령어 (복사해서 실행)
```cmd
cd /d D:\beautycat && git add js/admin-dashboard.js HOTFIX_v2.8.13.6.163.3_ADMIN_SEARCH_DELETE_FIX.md QUICK_PUSH_v2.8.13.6.163.3.md && git commit -m "fix: v2.8.13.6.163.3 - Admin 검색/삭제 수정" && git push origin main
```

### 단계별 명령어
```cmd
cd /d D:\beautycat
git add js/admin-dashboard.js HOTFIX_v2.8.13.6.163.3_ADMIN_SEARCH_DELETE_FIX.md QUICK_PUSH_v2.8.13.6.163.3.md
git commit -m "fix: v2.8.13.6.163.3 - Admin 검색/삭제 수정"
git push origin main
```

---

## 🧪 배포 후 테스트 (1-2분 대기)

### 1. Cloudflare 캐시 삭제
1. https://dash.cloudflare.com 접속
2. `beautycat.kr` 선택
3. **Caching** → **Configuration** → **Purge Everything** 클릭

### 2. Admin Dashboard 테스트
**URL**: https://beautycat.kr/admin-dashboard.html

#### A. 검색 필터 테스트
1. **Ctrl + Shift + R** 강력 새로고침
2. **업체 관리** 섹션 클릭
3. 검색창에 다음을 입력:
   - 샵명: "강남"
   - 대표자명: "홍길동"
   - 이메일: "test"
4. **예상 결과**: 즉시 필터링됨

#### B. 샵 삭제 테스트
1. 임의의 샵 행에서 🗑️ 삭제 버튼 클릭
2. 확인 팝업 확인:
   ```
   정말로 'XXX' 샵을 삭제하시겠습니까?
   
   ⚠️ 정적 JSON 모드: 실제 삭제되지 않으며 페이지 새로고침 시 복구됩니다.
   ```
3. **확인** 클릭
4. **예상 결과**: 테이블에서 샵이 사라짐

#### C. F12 콘솔 확인
```
🔍 검색어 필터: 홍길동 - X개
🗑️ 샵 삭제 요청 (정적 JSON 모드): XXX
✅ 샵 삭제 완료 (정적 JSON 모드), 테이블 새로고침 중...
```

---

## 📊 수정 내용 요약

### Before (v2.8.13.6.163.2)
❌ 대표자명 검색 안됨
❌ 샵 삭제 버튼 작동 안함

### After (v2.8.13.6.163.3)
✅ 대표자명 검색 가능
✅ 샵 삭제 작동 (세션 동안)
✅ 검색 필터 6개 필드 지원
✅ F12 콘솔 로그 명확

---

## 🎯 검증 항목

- [ ] Git 푸시 성공
- [ ] Cloudflare 캐시 삭제
- [ ] Admin Dashboard 접속
- [ ] 대표자명 검색 작동
- [ ] 샵 삭제 작동
- [ ] F12 콘솔 로그 확인
- [ ] 다른 필터 정상 작동

---

**지금 바로 위 명령어를 실행하고 테스트해주세요!** 🚀
