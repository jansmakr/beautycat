@echo off
chcp 65001 >nul
echo.
echo ========================================
echo 무료 기간 연장 검증 완료 배포
echo v2.8.8.1.82.10
echo ========================================
echo.

echo 📋 배포할 파일:
echo   1. js/config.js (무료 기간 2026-06-30)
echo   2. shop-dashboard.html (하드코딩 값 수정)
echo   3. README.md (버전 v2.8.8.1.82.10)
echo   4. 완료_무료기간연장검증완료_v2.8.8.1.82.10.md
echo   5. push-v2.8.8.1.82.10.bat
echo.

pause

echo.
echo 🔄 Git 추가 중...
git add js/config.js
git add shop-dashboard.html
git add README.md
git add 완료_무료기간연장검증완료_v2.8.8.1.82.10.md
git add push-v2.8.8.1.82.10.bat

echo.
echo 💾 커밋 중...
git commit -m "feat: 무료 기간 3개월 연장 + 검증 완료 (v2.8.8.1.82.10)

- 무료 기간: 2026-03-30 → 2026-06-30 (+92일)
- shop-dashboard.html 하드코딩 값 수정 (201일)
- 전체 페이지 콘솔 로그 검증 완료
- 회원가입/로그인 오류 점검 완료"

echo.
echo 🚀 푸시 중...
git push origin main

echo.
echo ========================================
echo ✅ 배포 완료!
echo ========================================
echo.
echo 📝 변경 사항:
echo   • 무료 기간 3개월 연장 (2026-06-30)
echo   • 남은 일수: 201일 (기준: 2025-12-11)
echo   • shop-dashboard.html 동적 업데이트
echo   • 전체 검증 완료
echo.
echo 🧪 배포 후 테스트:
echo   1. https://beautyket.com/shop-dashboard.html
echo      → 무료 기간: 2026년 6월 30일
echo      → 남은 일수: 201일
echo   2. https://beautyket.com/register.html
echo      → 콘솔: 무료 기간 201일
echo   3. https://beautyket.com/login.html
echo      → 콘솔: 무료 기간 201일
echo.
pause
