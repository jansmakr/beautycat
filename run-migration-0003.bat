@echo off
chcp 65001 > nul
echo ====================================
echo 리뷰 테이블 마이그레이션 (quote_id 추가)
echo ====================================
echo.

echo [1/2] 마이그레이션 파일 확인...
if not exist "migrations\0003_add_quote_id_to_reviews.sql" (
    echo ❌ 마이그레이션 파일이 없습니다!
    pause
    exit /b 1
)
echo ✅ 파일 존재 확인
echo.

echo [2/2] 마이그레이션 실행...
wrangler d1 execute beautycat-db --remote --file=migrations/0003_add_quote_id_to_reviews.sql
echo.

if %ERRORLEVEL% EQU 0 (
    echo ====================================
    echo ✅ 마이그레이션 성공!
    echo ====================================
    echo.
    echo 변경 사항:
    echo - reviews 테이블에 quote_id 컬럼 추가
    echo - idx_reviews_quote 인덱스 생성
    echo.
    echo 확인 방법:
    echo wrangler d1 execute beautycat-db --remote --command="PRAGMA table_info(reviews);"
    echo.
) else (
    echo ====================================
    echo ❌ 마이그레이션 실패!
    echo ====================================
    echo.
    echo 오류 확인 후 다시 시도하세요.
    echo.
)

pause
