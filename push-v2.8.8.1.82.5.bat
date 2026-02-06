@echo off
chcp 65001 > nul
echo ========================================
echo 🚀 Beautyket v2.8.8.1.82.5 배포 시작
echo ========================================
echo.

echo 📋 작업 내용:
echo - 핵심 특징 카드 가운데 정렬
echo - 상담 배너 교체 (162KB PNG)
echo - 배너 클릭 시 상담 섹션 스크롤 + 탭 자동 활성화
echo - 전화번호 버튼 삭제 (UX 단순화)
echo.

echo ========================================
echo 📁 Git 상태 확인
echo ========================================
git status
echo.

echo ========================================
echo ✅ 파일 추가 중...
echo ========================================
git add index.html
git add images/consultation-banner.png
git add README.md
git add 완료_상담배너UX개선_v2.8.8.1.82.5.md
git add push-v2.8.8.1.82.5.bat
echo ✅ 파일 추가 완료!
echo.

echo ========================================
echo 💾 커밋 중...
echo ========================================
git commit -m "style: 상담 배너 UX 개선 - 가운데 정렬 + 스크롤 링크 (v2.8.8.1.82.5)

✨ 주요 개선
- 핵심 특징 카드 가운데 정렬 (100%% 무료, 인증된 샵, 빠른 매칭)
- 상담 배너 교체 (162KB PNG, 로컬 이미지)
- 배너 클릭 시 상담 섹션 스크롤 + 지역별 탭 자동 활성화
- 전화번호 버튼 삭제 (UX 단순화, 혼란 제거)

🎨 UX 흐름 개선
- 배너 클릭 → 상담 섹션 부드러운 스크롤
- 600ms 후 지역별 전화상담 탭 자동 활성화
- 사용자 선택권 향상 (정보 확인 후 전화)

🔧 기술 개선
- scrollToRegionalConsultation() 함수 추가
- IntersectionObserver 이미지 지연 로딩
- 조건부 탭 전환 (중복 클릭 방지)

📁 수정 파일
- index.html (가운데 정렬 + 배너 + 스크롤 함수)
- images/consultation-banner.png (신규, 162,126 bytes)
- README.md (버전 업데이트)
- 완료_상담배너UX개선_v2.8.8.1.82.5.md (문서)"

if errorlevel 1 (
    echo ❌ 커밋 실패!
    pause
    exit /b 1
)
echo ✅ 커밋 완료!
echo.

echo ========================================
echo 🚀 Push 중...
echo ========================================
git push origin main

if errorlevel 1 (
    echo ❌ Push 실패!
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 배포 완료!
echo ========================================
echo.
echo 🎉 v2.8.8.1.82.5 배포 성공!
echo.
echo 📋 테스트 체크리스트:
echo 1. https://beautyket.com 접속
echo 2. 핵심 특징 카드 가운데 정렬 확인 (100%% 무료, 인증된 샵, 빠른 매칭)
echo 3. 상담 배너 클릭 → 상담 섹션 스크롤 확인
echo 4. 지역별 전화상담 탭 자동 활성화 확인 (600ms 후)
echo 5. 전화번호 버튼 삭제 확인
echo 6. 모바일/데스크톱 반응형 확인
echo.
echo ========================================
pause
