@echo off
chcp 65001 >nul
echo ============================================
echo beautycat 광고 배너 시스템 배포
echo 버전: v2.8.8.1.82.14
echo 날짜: 2026-02-21
echo ============================================
echo.

echo [1/5] 변경 파일 스테이징...
git add index.html
git add css/ad-banners.css
git add README.md
git add 완료_광고배너시스템구축_v2.8.8.1.82.14.md
git add 업로드파일목록_v2.8.8.1.82.14.md
git add 광고배너위치가이드_v2.8.8.1.82.14.md

echo.
echo [2/5] Git 상태 확인...
git status

echo.
echo [3/5] 커밋 생성...
git commit -m "feat: 광고 배너 시스템 구축 (v2.8.8.1.82.14)

- 5개 광고 배너 위치 추가 (728x90, 300x250, 160x600, 970x90)
- 반응형 디자인 최적화 (모바일/태블릿/데스크탑)
- css/ad-banners.css 전용 파일 생성
- 샘플 배너로 위치 확인 가능
- 각 배너 하단에 사이즈 표시
- Google AdSense 적용 가이드 포함

배너 위치:
#1: 메인 상단 (728x90 리더보드)
#2: 폼 중간 (300x250 미디엄 직사각형)
#3: 폼 하단 (728x90 리더보드)
#4: 사이드 (160x600 와이드 스카이스크래퍼, 데스크탑 전용)
#5: 최하단 (970x90 슈퍼 리더보드)

반응형:
- 데스크탑 1400px+: 모든 배너 표시
- 태블릿 768-1399px: 사이드 배너 숨김
- 모바일 767px 이하: 컴팩트 레이아웃"

echo.
echo [4/5] 원격 저장소에 푸시...
git push origin main

echo.
echo [5/5] 배포 완료!
echo.
echo ✅ 광고 배너 시스템 배포 완료
echo.
echo 📍 배포된 파일:
echo   - index.html
echo   - css/ad-banners.css (신규)
echo   - README.md
echo   - 완료_광고배너시스템구축_v2.8.8.1.82.14.md
echo   - 업로드파일목록_v2.8.8.1.82.14.md
echo   - 광고배너위치가이드_v2.8.8.1.82.14.md
echo.
echo 🌐 확인:
echo   https://beautyket.com
echo.
echo 📊 배너 위치:
echo   #1: 메인 상단 (728x90)
echo   #2: 폼 중간 (300x250)
echo   #3: 폼 하단 (728x90)
echo   #4: 사이드 (160x600, 데스크탑 전용)
echo   #5: 최하단 (970x90)
echo.
echo 📱 테스트:
echo   1. 데스크탑 1920px: 모든 배너 확인
echo   2. 데스크탑 1440px: 모든 배너 확인
echo   3. 태블릿 1024px: 사이드 배너 숨김 확인
echo   4. 모바일 375px: 컴팩트 레이아웃 확인
echo.
pause
