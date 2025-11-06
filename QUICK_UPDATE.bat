@echo off
chcp 65001 >nul
echo ========================================
echo BeautyCat CSS 캐시 버스팅 자동 업데이트
echo ========================================
echo.

echo 📁 작업 폴더: D:\beautycat
echo.

cd /d D:\beautycat

echo ✅ 1/6 index.html 수정 중...
powershell -Command "(Get-Content 'index.html') -replace 'css/mobile-optimized.css\">', 'css/mobile-optimized.css?v=2.1.0\">' | Set-Content 'index.html'"

echo ✅ 2/6 login.html 수정 중...
powershell -Command "(Get-Content 'login.html') -replace 'css/mobile-optimized.css\">', 'css/mobile-optimized.css?v=2.1.0\">' | Set-Content 'login.html'"

echo ✅ 3/6 register.html 수정 중...
powershell -Command "(Get-Content 'register.html') -replace 'css/mobile-optimized.css\">', 'css/mobile-optimized.css?v=2.1.0\">' | Set-Content 'register.html'"

echo ✅ 4/6 admin-dashboard.html 수정 중...
powershell -Command "(Get-Content 'admin-dashboard.html') -replace 'css/mobile-optimized.css\">', 'css/mobile-optimized.css?v=2.1.0\">' | Set-Content 'admin-dashboard.html'"

echo ✅ 5/6 shop-dashboard.html 수정 중...
powershell -Command "(Get-Content 'shop-dashboard.html') -replace 'css/mobile-optimized.css\">', 'css/mobile-optimized.css?v=2.1.0\">' | Set-Content 'shop-dashboard.html'"

echo ✅ 6/6 customer-dashboard.html 수정 중...
powershell -Command "(Get-Content 'customer-dashboard.html') -replace 'css/mobile-optimized.css\">', 'css/mobile-optimized.css?v=2.1.0\">' | Set-Content 'customer-dashboard.html'"

echo.
echo ========================================
echo ✅ 완료! 6개 파일 수정됨
echo ========================================
echo.
echo 다음 단계:
echo 1. GitHub Desktop 열기
echo 2. Changes 탭에서 6개 파일 확인
echo 3. Commit 메시지: "CSS 캐시 버스팅 v2.1.0"
echo 4. Commit to main 클릭
echo 5. Push origin 클릭
echo.
pause
