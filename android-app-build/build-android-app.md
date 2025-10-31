# 🚀 BeautyCat Android 앱 빌드 가이드

## 📋 준비사항

### 필요한 도구
- **Node.js** (18.x 이상)
- **Android Studio**
- **JDK 17**
- **Bubblewrap CLI** (Google의 TWA 생성 도구)

### 환경 설정
```bash
# Node.js 설치 확인
node --version
npm --version

# Android Studio 설치 후 SDK 설정
# ANDROID_HOME 환경변수 설정

# JDK 설치 확인
java --version
```

## 🛠️ 1단계: Bubblewrap CLI 설치

```bash
# Bubblewrap CLI 전역 설치
npm install -g @bubblewrap/cli

# 설치 확인
bubblewrap --version
```

## 📱 2단계: TWA (Trusted Web Activity) 프로젝트 생성

### 자동 초기화 (권장)
```bash
# 프로젝트 폴더 생성
mkdir beautycat-android
cd beautycat-android

# Bubblewrap으로 TWA 프로젝트 초기화
bubblewrap init --manifest https://beautycat.kr/manifest.json
```

### 수동 초기화 (세부 설정)
```bash
# 수동으로 프로젝트 초기화
bubblewrap init

# 다음 정보 입력:
# Domain: beautycat.kr
# Manifest URL: https://beautycat.kr/manifest.json
# Package ID: kr.beautycat.app
# App Name: BeautyCat
# Launcher Name: BeautyCat
# Theme Color: #ec4899
# Background Color: #ffffff
# Start URL: /
```

## 🔐 3단계: 앱 서명 키 생성

```bash
# 업로드 키스토어 생성
keytool -genkey -v -keystore android.keystore -alias android -keyalg RSA -keysize 2048 -validity 10000

# 입력 정보:
# 비밀번호: [안전한 비밀번호 설정]
# 이름과 성: BeautyCat Team
# 조직 단위: Development
# 조직: BeautyCat
# 시 또는 지역: Seoul
# 시/도: Seoul
# 국가 코드: KR
```

## 🏗️ 4단계: 앱 빌드

### 디버그 빌드 (테스트용)
```bash
# 디버그 APK 생성
bubblewrap build

# 생성된 파일 위치
# app-debug.apk
```

### 릴리스 빌드 (배포용)
```bash
# 릴리스 AAB 생성 (Google Play 업로드용)
bubblewrap build --skipPwaValidation

# 또는 서명된 APK 생성
bubblewrap build --skipPwaValidation --apk
```

## 📦 5단계: 앱 번들 최적화

### twa-manifest.json 수정
```json
{
  "packageId": "kr.beautycat.app",
  "host": "beautycat.kr",
  "name": "BeautyCat",
  "launcherName": "BeautyCat - 피부관리실 예약",
  "display": "standalone",
  "themeColor": "#ec4899",
  "backgroundColor": "#ffffff",
  "startUrl": "/",
  "appVersionName": "1.0.0",
  "appVersionCode": 1,
  "minSdkVersion": 24,
  "targetSdkVersion": 34
}
```

### 아이콘 최적화
```bash
# 아이콘 파일 준비 (512x512px)
# beautycat-icon.png

# Bubblewrap으로 아이콘 자동 생성
bubblewrap update
```

## 🧪 6단계: 테스트

### 로컬 테스트
```bash
# Android 에뮬레이터 또는 실기기에 설치
adb install app-debug.apk

# 또는 Android Studio에서 Run
```

### PWA 검증
```bash
# 웹 매니페스트 검증
bubblewrap validate --url https://beautycat.kr
```

## 📤 7단계: Google Play Console 업로드

### AAB 파일 업로드
1. **Google Play Console** 접속
2. **앱 만들기** → 기본 정보 입력
3. **앱 릴리스** → **내부 테스트**
4. **새 릴리스 만들기**
5. **app-release.aab** 업로드

### 앱 정보 입력
```yaml
앱 이름: "BeautyCat - 피부관리실 예약"
간단한 설명: "전국 피부관리실 견적비교 예약"
자세한 설명: |
  🐱 BeautyCat으로 우리동네 최고의 피부관리실을 찾아보세요!
  
  ✨ 주요 기능:
  • 전국 피부관리실 한눈에 비교
  • 실시간 견적 요청 및 상담
  • 지역별 맞춤 추천
  • 채팅 및 전화 상담
  • 예약 관리 시스템
  
  💄 BeautyCat과 함께 더 아름다운 나를 만나보세요!
```

## 🎨 8단계: 스토어 에셋 준비

### 필수 이미지
```yaml
앱 아이콘: 512x512px (PNG)
제목 이미지: 1024x500px (JPG/PNG)
스크린샷:
  - 휴대전화: 최소 2개 (1080x1920px)
  - 7인치 태블릿: 1개 (1200x1920px)
  - 10인치 태블릿: 1개 (1920x1200px)
```

### 스크린샷 생성 도구
```bash
# Puppeteer로 자동 스크린샷 생성
npx screenshot-desktop https://beautycat.kr --width=390 --height=844
npx screenshot-desktop https://beautycat.kr/chat.html --width=390 --height=844
```

## 🔄 9단계: 업데이트 프로세스

### 버전 업데이트
```bash
# twa-manifest.json 수정
{
  "appVersionName": "1.0.1",
  "appVersionCode": 2
}

# 새 버전 빌드
bubblewrap build --skipPwaValidation
```

### 자동 업데이트 설정
```javascript
// 웹사이트에 서비스워커 추가로 자동 업데이트
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

## 📊 완성된 파일 구조

```
beautycat-android/
├── twa-manifest.json          # TWA 설정 파일
├── android.keystore           # 앱 서명 키
├── app-release.aab           # Google Play 업로드 파일
├── app-debug.apk             # 테스트용 APK
└── store-assets/
    ├── icon-512x512.png      # 앱 아이콘
    ├── feature-graphic.jpg   # 제목 이미지
    └── screenshots/          # 스크린샷들
        ├── phone-1.png
        ├── phone-2.png
        ├── tablet-7.png
        └── tablet-10.png
```

## 🚨 문제 해결

### 일반적인 오류
1. **매니페스트 검증 실패**:
   ```bash
   # HTTPS 확인
   curl -I https://beautycat.kr/manifest.json
   ```

2. **빌드 실패**:
   ```bash
   # Android SDK 경로 확인
   echo $ANDROID_HOME
   
   # Gradle 캐시 정리
   ./gradlew clean
   ```

3. **서명 오류**:
   ```bash
   # 키스토어 정보 확인
   keytool -list -v -keystore android.keystore
   ```

## 💡 최적화 팁

### 성능 최적화
1. **PWA 최적화**: 서비스 워커, 캐싱 전략
2. **이미지 압축**: WebP 포맷 사용
3. **코드 분할**: 중요하지 않은 기능 지연 로딩

### 사용자 경험 향상
1. **오프라인 지원**: 캐시된 데이터로 기본 기능 제공
2. **푸시 알림**: Firebase Cloud Messaging
3. **딥링크**: 특정 페이지로 바로 이동

---

## 🎉 빌드 완료!

이제 **app-release.aab** 파일을 Google Play Console에 업로드하면 BeautyCat Android 앱이 스토어에 등록됩니다!

### 다음 단계:
1. ✅ **AAB 파일** Google Play Console 업로드
2. ✅ **스토어 정보** 입력 (설명, 스크린샷)
3. ✅ **내부 테스트** 진행
4. ✅ **프로덕션 출시** 신청

**BeautyCat Android 앱 출시를 축하합니다!** 🎊📱