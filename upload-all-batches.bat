@echo off
setlocal enabledelayedexpansion

echo ============================================
echo   배치 자동 업로드
echo ============================================
echo.

set count=0
for %%f in (sql-batches\batch-*.sql) do set /a count+=1

echo 📦 총 %count%개 배치 파일

set /p confirm="업로드 시작? (Y/N): "
if /i not "%confirm%"=="Y" exit /b

echo.
echo 🚀 업로드 시작...
echo.

set num=0
for %%f in (sql-batches\batch-*.sql) do (
    set /a num+=1
    echo [!num!/%count%] %%f
    wrangler d1 execute beautycat-db --remote --file=%%f
    echo.
)

echo ============================================
echo 완료!
echo ============================================

wrangler d1 execute beautycat-db --remote --command="SELECT COUNT(*) FROM public_skincare_data;"

pause