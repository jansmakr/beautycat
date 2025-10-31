# 뽀샵 모바일 앱 등록 가이드 📱

## 🎯 완료된 모바일 최적화 작업

### ✅ **1. PWA (Progressive Web App) 완전 지원**
- **웹 매니페스트**: `manifest.json` - 앱스토어 등록 필수 메타데이터
- **서비스워커**: `sw.js` - 오프라인 지원 및 캐싱
- **앱 아이콘**: 32x32 ~ 512x512 다양한 크기 지원
- **스플래시 화면**: 자동 생성되는 앱 로딩 화면

### ✅ **2. 모바일 UI/UX 최적화**
- **터치 친화적 디자인**: 최소 44px 터치 타겟 크기
- **심플한 네비게이션**: 하단 모바일 네비게이션 바
- **반응형 레이아웃**: 모든 화면 크기에 최적화
- **터치 피드백**: 모든 버튼에 터치 애니메이션

### ✅ **3. 앱스토어 등록 준비**
- **메타데이터**: SEO 및 앱스토어 최적화
- **앱 아이콘**: 고해상도 SVG/PNG 아이콘 세트
- **스크린샷**: 앱스토어용 스크린샷 템플릿
- **앱 카테고리**: Health, Lifestyle, Beauty

## 🚀 앱스토어 등록 단계별 가이드

### **1단계: Google Play Console 등록**

#### 📋 필요한 정보
```
앱 이름: 뽀샵 - 피부관리 상담 플랫폼
패키지명: kr.pposhop.app
카테고리: 건강 및 피트니스 > 뷰티
타겟 연령: 18세 이상
콘텐츠 등급: 전체 이용가
```

#### 🖼️ 필수 제출 자료
- **앱 아이콘**: 512x512 PNG (투명 배경 없음)
- **피처 그래픽**: 1024x500 PNG
- **스크린샷**: 최소 2개 (휴대폰 + 태블릿)
- **개인정보 처리방침 URL**: 필수
- **앱 설명**: 한국어 + 영어

### **2단계: Apple App Store Connect 등록**

#### 📋 필요한 정보
```
앱 이름: 뽀샵 (PpoShop)
번들 ID: kr.pposhop.app
SKU: PPOSHOP2024
카테고리: Health & Fitness
부카테고리: Medical
연령 등급: 4+
```

#### 🖼️ 필수 제출 자료
- **앱 아이콘**: 1024x1024 PNG
- **스크린샷**: 각 기기별 (iPhone, iPad)
- **앱 미리보기**: 선택사항 (동영상)
- **앱 설명**: 한국어 + 영어

### **3단계: Cordova/Capacitor 앱 빌드**

#### 🛠️ Capacitor를 사용한 빌드 (권장)
```bash
# 1. Capacitor 프로젝트 초기화
npm install -g @capacitor/cli
npx cap init pposhop kr.pposhop.app

# 2. 플랫폼 추가
npx cap add android
npx cap add ios

# 3. 웹 빌드를 네이티브 앱으로 동기화
npx cap copy
npx cap sync

# 4. 네이티브 IDE로 열기
npx cap open android
npx cap open ios
```

#### ⚙️ capacitor.config.json 설정
```json
{
  "appId": "kr.pposhop.app",
  "appName": "뽀샵",
  "webDir": "dist",
  "bundledWebRuntime": false,
  "plugins": {
    "SplashScreen": {
      "launchShowDuration": 2000,
      "backgroundColor": "#ff2d92",
      "showSpinner": false
    },
    "StatusBar": {
      "style": "LIGHT_CONTENT",
      "backgroundColor": "#ff2d92"
    },
    "Keyboard": {
      "resize": "ionic"
    }
  }
}
```

## 📱 앱 기능 명세서

### **핵심 기능**
1. **🗺️ 지역 기반 매칭**: GPS 연동 우리 동네 피부관리실 찾기
2. **💬 실시간 채팅**: WebSocket 기반 업체와 실시간 상담
3. **🔐 Level 1 인증**: 40원 이메일+SMS 간편 인증
4. **📋 견적 관리**: 여러 업체 견적 비교 및 예약 관리
5. **🔔 푸시 알림**: 견적 도착, 예약 알림 등

### **PWA 고급 기능**
- **오프라인 지원**: 기본 정보 오프라인 조회 가능
- **백그라운드 동기화**: 온라인 복구 시 자동 데이터 동기화
- **푸시 알림**: 웹 푸시로 실시간 알림
- **홈 화면 추가**: 원클릭 앱 설치

### **네이티브 앱 전용 기능** (Capacitor 플러그인)
```bash
# 위치 서비스
npm install @capacitor/geolocation

# 카메라 (프로필 사진)
npm install @capacitor/camera

# 디바이스 정보
npm install @capacitor/device

# 로컬 알림
npm install @capacitor/local-notifications

# 앱 상태 관리
npm install @capacitor/app
```

## 🎨 앱 디자인 가이드라인

### **컬러 팔레트**
```css
Primary: #ff2d92 (뽀샵 핑크)
Secondary: #6b7280 (그레이)
Success: #10b981 (그린)
Warning: #f59e0b (오렌지)
Error: #ef4444 (레드)
Background: #f9fafb (라이트 그레이)
```

### **타이포그래피**
- **Primary Font**: Pretendard (한글 최적화)
- **System Font**: -apple-system, system-ui
- **크기**: 16px 이상 (접근성 준수)

### **아이콘 시스템**
- **라이브러리**: Font Awesome 6
- **크기**: 최소 24x24px (터치 타겟)
- **색상**: Primary 또는 Gray 계열

## 🔒 보안 및 개인정보보호

### **데이터 보호**
- **JWT 토큰**: 사용자 인증 토큰 관리
- **HTTPS 전용**: 모든 통신 암호화
- **로컬 저장소**: 민감 정보 암호화 저장

### **개인정보 처리방침** (필수)
```
수집 항목: 이름, 연락처, 이메일, 위치 정보
수집 목적: 서비스 제공, 업체 매칭
보유 기간: 회원 탈퇴 시까지
제3자 제공: 계약 업체에게만 제공
```

## 📊 앱 성능 최적화

### **로딩 성능**
- **Code Splitting**: 페이지별 JS 분할 로딩
- **이미지 최적화**: WebP 포맷 사용
- **캐싱 전략**: 서비스워커 적극 활용

### **메모리 관리**
- **가상 스크롤**: 대용량 리스트 최적화
- **이미지 Lazy Loading**: 필요시에만 로드
- **메모리 리크 방지**: 이벤트 리스너 정리

## 📈 앱 마케팅 전략

### **ASO (앱스토어 최적화)**
```
키워드: 피부관리, 뷰티, 상담, 견적, 예약
설명: 우리 동네 피부관리실을 쉽게 찾고 견적을 비교해보세요
스크린샷: 핵심 기능 위주로 5-8장
리뷰 관리: 초기 긍정적 리뷰 확보
```

### **출시 마케팅**
1. **소프트 런칭**: 베타 테스터 100명 모집
2. **언론보도**: 테크 블로그, 뷰티 매거진 소개
3. **인플루언서**: 뷰티 유튜버, 인스타그래머 협업
4. **온라인 광고**: Google Ads, Facebook Ads

## 🚀 출시 체크리스트

### **기술적 준비**
- [ ] PWA 기능 테스트 완료
- [ ] 다양한 기기에서 테스트 완료
- [ ] 성능 최적화 완료 (Lighthouse 90+ 점수)
- [ ] 보안 검사 완료
- [ ] 백업 및 복구 시스템 구축

### **법적 준비**
- [ ] 개인정보 처리방침 작성
- [ ] 이용약관 작성
- [ ] 사업자 등록 완료
- [ ] 통신판매업 신고 완료

### **마케팅 준비**
- [ ] 앱스토어 등록 정보 완성
- [ ] 스크린샷 및 홍보 영상 제작
- [ ] 랜딩페이지 준비
- [ ] SNS 계정 개설
- [ ] 초기 사용자 확보 계획

## 📞 기술 지원

### **개발자 문의**
- **이메일**: tech@pposhop.kr
- **카카오톡**: https://open.kakao.com/o/sXXnTISh
- **GitHub**: pposhop 저장소

### **자주 묻는 질문**
**Q: PWA와 네이티브 앱의 차이점은?**
A: PWA는 웹 기반으로 빠른 출시가 가능하고, 네이티브 앱은 더 깊은 시스템 통합이 가능합니다.

**Q: iOS와 Android 동시 출시 가능한가요?**
A: Capacitor를 사용하면 하나의 코드베이스로 양쪽 플랫폼 동시 빌드가 가능합니다.

**Q: 앱스토어 심사에서 주의할 점은?**
A: 개인정보 처리방침, 콘텐츠 가이드라인 준수, 앱 크래시 없음이 중요합니다.

---

🎉 **모바일 앱 등록을 위한 모든 준비가 완료되었습니다!** 🎉

이제 Capacitor나 Cordova를 사용하여 네이티브 앱을 빌드하고 앱스토어에 등록할 수 있습니다.