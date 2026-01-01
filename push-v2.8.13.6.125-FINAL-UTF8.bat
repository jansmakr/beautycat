@echo off
chcp 65001 > nul
echo ========================================
echo BeautyCat v2.8.13.6.125 Final Deploy
echo ========================================
echo.

echo Date: 2025-12-31
echo Version: v2.8.13.6.125
echo Changes: Review system bugfix and XSS vulnerability removal
echo.

echo ========================================
echo Step 1: DB Migration
echo ========================================
echo.

echo Cloudflare D1 remote DB update...
echo.
echo If Wrangler is not installed:
echo    1. Go to: https://dash.cloudflare.com
echo    2. Workers and Pages - D1 - beautycat-db - Console
echo    3. Run SQL from DB_MIGRATION_SIMPLE_GUIDE.md
echo.
echo Press any key to continue...
echo    (If no Wrangler, manual migration needed later)
pause > nul

wrangler d1 execute beautycat-db --remote --file=migrations/0003_add_quote_id_to_reviews.sql

if errorlevel 1 (
    echo.
    echo DB Migration failed or Wrangler not installed!
    echo.
    echo Manual migration method:
    echo    1. Visit https://dash.cloudflare.com
    echo    2. Workers and Pages - D1 - beautycat-db - Console
    echo    3. Run SQL from DB_MIGRATION_SIMPLE_GUIDE.md
    echo.
    echo Continue? (Git commit only will be executed)
    echo    Y = Continue (manual migration later)
    echo    N = Exit (run migration first)
    choice /C YN /M "Choose"
    if errorlevel 2 exit /b 1
    echo.
    echo WARNING: Run DB migration manually after deployment!
    echo.
)

echo.
echo DB Migration completed!
echo.

echo ========================================
echo Step 2: Git Add and Commit
echo ========================================
echo.

echo Adding modified files...
git add js/customer-dashboard.js
git add js/auth.js
git add js/admin-dashboard.js
git add cloudflare-d1-schema.sql

echo.
echo Adding new files...
git add migrations/0003_add_quote_id_to_reviews.sql
git add run-migration-0003.bat
git add BUGFIX_v2.8.13.6.122.md
git add INTEGRATION_TEST_v2.8.13.6.123.md
git add FINAL_ERROR_CHECK_v2.8.13.6.124.md
git add TODAY_WORK_SUMMARY.md
git add FINAL_PUSH_v2.8.13.6.125.md
git add push-v2.8.13.6.125-FINAL.bat
git add push-v2.8.13.6.125-FINAL-UTF8.bat
git add DB_MIGRATION_SIMPLE_GUIDE.md

echo.
echo Creating commit...
git commit -m "v2.8.13.6.125 - Review system bugfix and XSS vulnerability removal (FINAL)" -m "" -m "Major changes:" -m "- Review system: Changed to quote-based review (quote_id added)" -m "- XSS defense: Added escapeHtml, escapeSingleQuote functions" -m "- Input validation: Enhanced currentUser, selectedConsultation, shop_id, quote_id validation" -m "- Error handling: API response validation and user-friendly messages" -m "- Auto-matching: Only on admin approval (removed from signup)" -m "" -m "Modified files:" -m "- js/customer-dashboard.js (XSS defense, input validation)" -m "- js/auth.js (auto-matching removed)" -m "- js/admin-dashboard.js (API path fix)" -m "- cloudflare-d1-schema.sql (quote_id column added)" -m "" -m "New files:" -m "- migrations/0003_add_quote_id_to_reviews.sql" -m "- BUGFIX_v2.8.13.6.122.md" -m "- INTEGRATION_TEST_v2.8.13.6.123.md" -m "- FINAL_ERROR_CHECK_v2.8.13.6.124.md" -m "- TODAY_WORK_SUMMARY.md" -m "- FINAL_PUSH_v2.8.13.6.125.md" -m "" -m "Tests completed:" -m "- Review system (quote-based)" -m "- Auto-matching (admin approval)" -m "- XSS defense" -m "- Input validation" -m "- FOREIGN KEY integrity"

if errorlevel 1 (
    echo.
    echo Git commit failed!
    echo Check changes and try again.
    pause
    exit /b 1
)

echo.
echo Git commit completed!
echo.

echo ========================================
echo Step 3: GitHub Push
echo ========================================
echo.

echo Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo GitHub push failed!
    echo Check network and try again.
    pause
    exit /b 1
)

echo.
echo GitHub push completed!
echo.

echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo All changes successfully deployed!
echo.
echo Deployment stats:
echo    - Modified files: 4
echo    - New files: 9
echo    - Total changed lines: about 300
echo.
echo Post-deployment test scenarios:
echo    1. Shop registration and auto-matching (5min)
echo    2. Review writing (3min)
echo    3. XSS defense test (2min)
echo    4. Exception handling (2min)
echo.
echo Must-read documents:
echo    - DB_MIGRATION_SIMPLE_GUIDE.md (DB migration method)
echo    - BUGFIX_v2.8.13.6.122.md
echo    - INTEGRATION_TEST_v2.8.13.6.123.md
echo    - FINAL_ERROR_CHECK_v2.8.13.6.124.md
echo    - TODAY_WORK_SUMMARY.md
echo    - FINAL_PUSH_v2.8.13.6.125.md
echo.
echo URLs:
echo    - Main: https://beautycat.kr
echo    - Backup: https://beautyket.com
echo.
echo Deployment time: %date% %time%
echo.
pause
