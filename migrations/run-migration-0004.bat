@echo off
chcp 65001 >nul
echo ========================================
echo Migration 0004: 샵 분류 필드 추가
echo ========================================
echo.

echo 📋 마이그레이션 내용:
echo   - region 필드 추가 (시/도 간략 표기)
echo   - source 필드 추가 (public/registered)
echo   - verified 필드 추가 (인증샵 여부)
echo   - business_name 필드 추가
echo   - 인덱스 추가 (검색 성능 최적화)
echo   - 기존 30,000개 데이터 자동 업데이트
echo.

echo ⚠️  주의사항:
echo   - 이 작업은 데이터베이스 구조를 변경합니다
echo   - 백업이 자동으로 수행되지 않습니다
echo   - 약 30초~1분 소요 예상
echo.

set /p confirm="계속 진행하시겠습니까? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo.
    echo ❌ 마이그레이션이 취소되었습니다.
    pause
    exit /b 1
)

echo.
echo 🚀 마이그레이션 시작...
echo.

echo 📤 Cloudflare D1에 마이그레이션 실행 중...
npx wrangler d1 execute beautycat-db --remote --file=migrations/0004-add-shop-classification-fields.sql

if %errorlevel% neq 0 (
    echo.
    echo ❌ 마이그레이션 실패!
    echo.
    echo 해결 방법:
    echo   1. wrangler 로그인 확인: npx wrangler login
    echo   2. 데이터베이스 이름 확인: beautycat-db
    echo   3. SQL 파일 경로 확인
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ 마이그레이션 완료!
echo.
echo 📊 다음 단계:
echo   1. 데이터 검증: node verify-migration-0004.js
echo   2. 코드 배포: git push origin main
echo.
pause
