@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================================
echo    Beautyket v2.8.8.1.82.14 Push Script
echo    퍼스널컬러 변경 + 게스트 허용
echo ================================================
echo.

REM 변경된 파일 추가
echo 📂 변경된 파일 스테이징 중...
git add index.html
git add README.md

echo ✅ 스테이징 완료!
echo.

REM 커밋 메시지
echo 💬 커밋 메시지 작성 중...
git commit -m "feat: 무료진단/전화상담 게스트 허용 + 퍼스널컬러 변경 (v2.8.8.1.82.14)" -m "" -m "✨ 주요 변경사항:" -m "- 나의 컬러 → 퍼스널컬러로 텍스트 변경" -m "- 무료진단 서비스 게스트 이용 가능 (로그인 체크 제거)" -m "  * 피부진단, 성분분석, 퍼스널컬러, 이너케어, 타임머신, 건강일기" -m "- 지역별 대표샵 전화상담 게스트 이용 가능 (로그인 체크 제거)" -m "- 견적비교는 회원 전용 유지" -m "" -m "📂 수정 파일:" -m "- index.html (handleDiagnosisClick, handlePhoneIntent, showPhoneForm 함수 수정)" -m "- README.md (버전 정보 업데이트 v2.8.8.1.82.14)" -m "" -m "🎯 개선 효과:" -m "- 게스트 사용자가 무료 진단 서비스 체험 가능" -m "- 전화 상담 바로 신청 가능" -m "- 서비스 체험 후 회원가입 전환율 향상" -m "- UX 개선: 불필요한 로그인 요구 제거"

echo ✅ 커밋 완료!
echo.

REM Push
echo 🚀 GitHub에 Push 중...
git push origin main

echo.
echo ================================================
echo    ✅ Push 완료!
echo ================================================
echo.
echo 📋 변경 내용:
echo   1. 퍼스널컬러 변경
echo   2. 무료진단 게스트 허용
echo   3. 전화상담 게스트 허용
echo   4. 견적비교 회원 전용 유지
echo.
echo 🔗 확인: https://beautyket.com
echo ================================================
echo.
pause
