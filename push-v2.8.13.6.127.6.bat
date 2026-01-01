@echo off
chcp 65001 >nul
echo ========================================
echo BeautyCat 배포 스크립트
echo v2.8.13.6.127.6 - Fix button event propagation
echo ========================================
echo.

REM 1단계: Git 상태 확인
echo [1/4] Git 상태 확인...
git status
echo.

REM 2단계: 변경된 파일 추가
echo [2/4] 변경된 파일 추가...
git add admin-dashboard.html
if errorlevel 1 (
    echo ❌ 파일 추가 실패!
    pause
    exit /b 1
)
echo ✅ 파일 추가 완료
echo.

REM 3단계: 커밋
echo [3/4] 커밋 생성...
git commit -m "v2.8.13.6.127.6 - Fix button event propagation with stopPropagation and preventDefault"
if errorlevel 1 (
    echo ❌ 커밋 실패!
    pause
    exit /b 1
)
echo ✅ 커밋 완료
echo.

REM 4단계: GitHub에 푸시
echo [4/4] GitHub에 푸시...
git push origin main
if errorlevel 1 (
    echo ❌ 푸시 실패!
    pause
    exit /b 1
)
echo ✅ 푸시 완료
echo.

echo ========================================
echo 🎉 배포 완료!
echo ========================================
echo.
echo 📍 배포 URL: https://beautycat.kr
echo ⏱️  Cloudflare Pages 배포 대기: 2-3분
echo.
pause