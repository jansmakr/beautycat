@echo off
chcp 65001 > nul
echo ========================================
echo 🚀 Beautyket v2.8.8.1.82.4 배포 시작
echo ========================================
echo.

echo 📋 작업 내용:
echo - 서비스 특징 배너 가운데 정렬 추가
echo - 이용 방법 숫자 300%% 확대 + 그라데이션
echo - 그림자 효과 및 시각적 강조
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
git add images/features-banner.png
git add images/how-to-use.png
git add README.md
git add 완료_메인화면UI개선_v2.8.8.1.82.4.md
git add push-v2.8.8.1.82.4.bat
echo ✅ 파일 추가 완료!
echo.

echo ========================================
echo 💾 커밋 중...
echo ========================================
git commit -m "style: 메인 화면 UI 개선 - 배너 추가 + 숫자 강조 (v2.8.8.1.82.4)

✨ 주요 개선
- 서비스 특징 배너 가운데 정렬 추가
- 이용 방법 숫자 300%% 확대 + 그라데이션
- 그림자 효과 및 시각적 강조

🎨 디자인
- 숫자: 8x8 → 12x12 (모바일), 10x10 → 16x16 (데스크톱)
- 색상: 단색 → 핑크-보라 그라데이션
- 폰트: font-bold → font-black (최대 굵기)

📁 수정 파일
- index.html (배너 + 숫자 스타일)
- images/features-banner.png (신규)
- images/how-to-use.png (신규)
- README.md (버전 업데이트)
- 완료_메인화면UI개선_v2.8.8.1.82.4.md (문서)"

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
echo 🎉 v2.8.8.1.82.4 배포 성공!
echo.
echo 📋 테스트 체크리스트:
echo 1. https://beautyket.com 접속
echo 2. 서비스 특징 배너 가운데 정렬 확인
echo 3. 이용 방법 숫자 크기 및 그라데이션 확인
echo 4. 모바일/데스크톱 반응형 확인
echo.
echo ========================================
pause
